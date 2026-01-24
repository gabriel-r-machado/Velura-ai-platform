/* eslint-disable no-console */
import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/shared/lib/supabase/client';
import { useProjectStore } from '@/features/projects/stores/projectStore';
import { toast } from '@/shared/hooks/use-toast';

// Checa o status a cada 3 segundos
const POLLING_INTERVAL_MS = 3_000; 

// Timeout de 5 minutos (300 segundos)
// If AI takes longer than this, something is wrong
const MAX_PROCESSING_TIME_MS = 300_000; 

export const useRealtimeProject = (projectId: string | null) => {
  const setCurrentCode = useProjectStore((s) => s.setCurrentCode);
  const setIsProcessing = useProjectStore((s) => s.setIsProcessing);
  const addMessage = useProjectStore((s) => s.addMessage);
  const removeProcessingProject = useProjectStore((s) => s.removeProcessingProject);
  const isProcessing = useProjectStore((s) => s.isProcessing);

  const processingStartRef = useRef<number | null>(null);

  const handleStatusUpdate = useCallback(
    async (data: {
      id: string;
      code_content: Record<string, string> | null;
      status: string;
      error_message: string | null;
    }) => {
      if (data.status === 'completed' && data.code_content) {

        setCurrentCode(data.code_content);
        setIsProcessing(false);
        removeProcessingProject(data.id);
        processingStartRef.current = null;

        // NÃO adicionar mensagem aqui - o realtime de mensagens já vai fazer isso


        toast({
          title: 'Geração Concluída! 🚀',
          description: 'Seu projeto foi atualizado com sucesso.',
        });
      } else if (data.status === 'error') {

        setIsProcessing(false);
        removeProcessingProject(data.id);
        processingStartRef.current = null;

        // NÃO adicionar mensagem aqui - deixar o realtime fazer


        toast({
          title: 'Falha na geração',
          description: data.error_message || 'Erro desconhecido',
          variant: 'destructive',
        });
      } else if (data.status === 'processing') {
        if (processingStartRef.current === null) {
          processingStartRef.current = Date.now();
        }
        if (!isProcessing) {

          setIsProcessing(true);
        }
      }
    },
    [setCurrentCode, setIsProcessing, removeProcessingProject, isProcessing]
  );

  // Realtime Subscription
  useEffect(() => {
    if (!projectId) return;

    let isMounted = true;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    // Debounce: só conecta após 1500ms de estabilidade (previne loop durante navegação)
    const timer = setTimeout(() => {
      if (!isMounted) return;

      channel = supabase
        .channel(`project-${projectId}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'generated_sites',
            filter: `id=eq.${projectId}`,
          },
          (payload) => {
            if (!isMounted) return;
            const newData = payload.new as { id: string; code_content: Record<string, string> | null; status: string; error_message: string | null };
            handleStatusUpdate(newData);
          }
        )
        .subscribe();
    }, 800);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      
      if (channel) {
        // Dar tempo pro estado estabilizar antes de remover
        setTimeout(() => {
          supabase.removeChannel(channel!).catch(() => {
            // Ignore cleanup errors
          });
        }, 50);
      }
    };
  }, [projectId, handleStatusUpdate]);

  // Polling & Watchdog
  useEffect(() => {
    if (!projectId) return;

    const pollStatus = async () => {
      const { data, error } = await supabase
        .from('generated_sites')
        .select('id, code_content, status, error_message')
        .eq('id', projectId)
        .maybeSingle();

      if (error || !data) return;

      if (data.status === 'processing') {
        if (!isProcessing) setIsProcessing(true);
        if (processingStartRef.current === null) processingStartRef.current = Date.now();
      } else {
        await handleStatusUpdate({
          ...data,
          code_content: data.code_content as Record<string, string> | null,
        });
        return;
      }

      // WATCHDOG CHECK
      if (processingStartRef.current) {
        const elapsed = Date.now() - processingStartRef.current;
        
        // Log every 10s to track waiting in console
        if (elapsed % 10000 < 3000) {

        }

        if (elapsed > MAX_PROCESSING_TIME_MS) {

          
          await supabase
            .from('generated_sites')
            .update({
              status: 'error',
              error_message: 'Client watchdog: generation exceeded time limit.',
              updated_at: new Date().toISOString(),
            })
            .eq('id', projectId);

          setIsProcessing(false);
          removeProcessingProject(projectId);
          processingStartRef.current = null;

          addMessage({
            id: Date.now().toString(),
            role: 'assistant',
            content: '⏱️ A geração demorou mais de 5 minutos e foi cancelada. Tente um prompt mais simples.',
          });
        }
      }
    };

    if (!isProcessing) return;

    const intervalId = setInterval(pollStatus, POLLING_INTERVAL_MS);
    pollStatus();

    return () => clearInterval(intervalId);
  }, [projectId, isProcessing, handleStatusUpdate, setIsProcessing, removeProcessingProject, addMessage]);
};

// Messages hook (kept concise to save space, same as before)
export const useRealtimeMessages = (projectId: string | null) => {
  const addMessage = useProjectStore((state) => state.addMessage);

  useEffect(() => {
    if (!projectId) return;

    let isMounted = true;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    // Debounce: só conecta após 1500ms de estabilidade (previne loop durante navegação)
    const timer = setTimeout(() => {
      if (!isMounted) return;

      channel = supabase
        .channel(`messages-${projectId}`, {
          config: {
            broadcast: { self: true },
          },
        })
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'project_messages',
            filter: `project_id=eq.${projectId}`,
          },
          (payload) => {
            if (!isMounted) return;
            
            const newMsg = payload.new as {
              id: string;
              role: string;
              content: string;
              project_id: string;
              created_at: string;
            };

            // Adicionar QUALQUER mensagem (user ou assistant) via realtime
            // O store já previne duplicatas
            try {
              addMessage({
                id: newMsg.id,
                role: newMsg.role as 'user' | 'assistant',
                content: newMsg.content,
              });
            } catch (error) {
              // Ignore errors in unmounted component
            }
          }
        )
        .subscribe();
    }, 1500);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      
      if (channel) {
        // Dar tempo pro estado estabilizar antes de remover
        setTimeout(() => {
          supabase.removeChannel(channel!).catch(() => {
            // Ignore cleanup errors
          });
        }, 50);
      }
    };
  }, [projectId, addMessage]);
};
