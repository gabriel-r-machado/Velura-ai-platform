import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/shared/lib/supabase/client';
import { useProjectStore } from '@/features/projects/stores/projectStore';
import { useAuth } from '@/features/auth/contexts/AuthContext';
import { toast } from '@/shared/hooks/use-toast';

export const useProjectActions = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { 
    resetState, 
    setCurrentProjectId,
    setMessages,
    setCurrentCode,
    currentProjectId,
    currentCode,
    messages,
    setIsProcessing,
    addMessage,
    addProcessingProject,
    removeProcessingProject,
  } = useProjectStore();

  const createNewProject = useCallback(async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to create projects.",
        variant: "destructive",
      });
      router.push('/auth');
      return null;
    }

    try {
      // Reset state first
      resetState();

      // Create a new project immediately with empty prompt
      const { data, error } = await supabase
        .from('generated_sites')
        .insert({
          prompt: '',
          code_content: {},
          user_id: user.id,
          status: 'idle',
        })
        .select('id')
        .single();

      if (error) throw error;

      // 🔥 ADICIONAR MENSAGEM DE BOAS-VINDAS NO BANCO
      await supabase.from('project_messages').insert({
        project_id: data.id,
        role: 'assistant',
        content: 'Olá! 👋 Descreva a landing page que você deseja criar e eu vou gerar o código com React + TypeScript + Tailwind CSS. Pode me pedir alterações a qualquer momento!',
      });

      // Navigate to the new project
      router.push(`/project/${data.id}`);
      
      return data.id;
    } catch (error) {

      toast({
        title: "Error creating project",
        description: "Please try again.",
        variant: "destructive",
      });
      return null;
    }
  }, [user, router, resetState]);

  const loadProject = useCallback(async (projectId: string) => {
    try {
      // Reset state before loading
      resetState();

      // Fetch project data
      const { data: project, error: projectError } = await supabase
        .from('generated_sites')
        .select('*')
        .eq('id', projectId)
        .maybeSingle();

      if (projectError) throw projectError;

      // Project not found - redirect to home
      if (!project) {

        toast({
          title: "Project not found",
          description: "This project doesn't exist or has been deleted.",
          variant: "destructive",
        });
        router.push('/');
        return null;
      }

      // Fetch messages
      const { data: projectMessages, error: messagesError } = await supabase
        .from('project_messages')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true });

      if (messagesError) throw messagesError;


      projectMessages?.forEach(msg => {

      });

      // Update store
      setCurrentProjectId(projectId);
      setCurrentCode(project.code_content as Record<string, string> || null);
      setMessages(
        projectMessages.map((msg) => ({
          id: msg.id,
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        }))
      );



      // Check if project is currently processing
      if (project.status === 'processing') {
        setIsProcessing(true);
        addProcessingProject({ id: projectId, prompt: project.prompt });
      }

      return project;
    } catch (error) {

      toast({
        title: "Error loading project",
        description: "Could not load the project.",
        variant: "destructive",
      });
      router.push('/');
      return null;
    }
  }, [resetState, setCurrentProjectId, setCurrentCode, setMessages, setIsProcessing, addProcessingProject, router]);

  const sendPrompt = useCallback(async (prompt: string) => {
    if (!user || !currentProjectId) {
      toast({
        title: "Error",
        description: "No active project or not authenticated.",
        variant: "destructive",
      });
      return;
    }



    setIsProcessing(true);
    addProcessingProject({ id: currentProjectId, prompt });

    // 🔥 OTIMISTIC UPDATE: Mostrar mensagem do usuário IMEDIATAMENTE
    const tempUserId = `temp-user-${Date.now()}`;

    addMessage({
      id: tempUserId,
      role: 'user',
      content: prompt.trim(),
    });

    // 🔥 SALVAR MENSAGEM DO USUÁRIO NO BANCO
    // O realtime vai adicionar a versão final com o ID correto do banco
    try {

      
      const { data, error } = await supabase.from('project_messages').insert({
        project_id: currentProjectId,
        role: 'user',
        content: prompt.trim(),
      }).select().single();

      if (error) {

        throw error;
      }
      

    } catch (error) {

      // Mensagem já está no store (otimistic), então apenas loga o erro
    }

    try {
      // 🎯 ADICIONAR MENSAGEM TEMPORÁRIA DE PROGRESSO
      const tempAssistantId = `temp-assistant-${Date.now()}`;
      let currentStatusMessage = '🚀 Iniciando...';
      let detectedFiles: string[] = [];
      

      addMessage({
        id: tempAssistantId,
        role: 'assistant',
        content: currentStatusMessage,
      });

      // 🔥 USAR STREAMING PARA FEEDBACK EM TEMPO REAL
      const response = await fetch('/api/generate-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt,
          currentFiles: currentCode && Object.keys(currentCode).length > 0 ? currentCode : undefined
        }),
      });

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      // 🌊 PROCESSAR STREAM E ATUALIZAR MENSAGEM EM TEMPO REAL
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let generatedFiles: Record<string, string> | null = null;
      let isUpdate = false;
      let totalFiles = 0;

      try {
        while (true) {
          const { done, value } = await reader.read();
          
          if (value) {
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (!line.trim() || !line.startsWith('data: ')) continue;
              
              try {
                const data = JSON.parse(line.slice(6));


                if (data.type === 'status') {
                  // 🔄 ATUALIZAR STATUS EM TEMPO REAL COM EMOJI
                  currentStatusMessage = `${data.emoji || '✨'} ${data.message}`;
                  
                  useProjectStore.setState(state => ({
                    messages: state.messages.map(msg =>
                      msg.id === tempAssistantId
                        ? { ...msg, content: currentStatusMessage }
                        : msg
                    )
                  }));

                } else if (data.type === 'files_detected') {
                  // 📄 MOSTRAR ARQUIVOS DETECTADOS
                  detectedFiles = data.files || [];
                  currentStatusMessage = `${data.emoji} ${data.message}`;
                  
                  useProjectStore.setState(state => ({
                    messages: state.messages.map(msg =>
                      msg.id === tempAssistantId
                        ? { ...msg, content: currentStatusMessage }
                        : msg
                    )
                  }));

                } else if (data.type === 'complete') {

                  generatedFiles = data.files;
                  totalFiles = data.summary?.totalFiles || Object.keys(data.files).length;
                  isUpdate = data.summary?.isUpdate || false;
                  detectedFiles = data.summary?.fileNames || Object.keys(data.files);
                  // NÃO fazer break aqui, continuar lendo até done
                } else if (data.type === 'error') {
                  throw new Error(data.error);
                }
              } catch (parseError) {

              }
            }
          }
          
          if (done) {

            break;
          }
        }
      } catch (streamError) {

        throw streamError;
      }

      if (!generatedFiles) {

        throw new Error('No files generated');
      }



      // Update project in Supabase with generated code
      const { error: updateError } = await supabase
        .from('generated_sites')
        .update({
          code_content: generatedFiles,
          status: 'completed',
          prompt: prompt,
          updated_at: new Date().toISOString(),
        })
        .eq('id', currentProjectId);

      if (updateError) throw updateError;

      // Update code locally
      setCurrentCode(generatedFiles);
      setIsProcessing(false);
      removeProcessingProject(currentProjectId);

      // 🔥 REMOVER MENSAGEM TEMPORÁRIA E CRIAR MENSAGEM FINAL DETALHADA
      useProjectStore.setState(state => ({
        messages: state.messages.filter(msg => msg.id !== tempAssistantId)
      }));

      // Criar mensagem de resumo
      const actionWord = isUpdate ? 'atualizado' : 'criado';
      const fileList = detectedFiles.slice(0, 5).map(f => `  • ${f}`).join('\n');
      const moreFiles = detectedFiles.length > 5 ? `\n  ... e mais ${detectedFiles.length - 5} arquivos` : '';
      
      const summaryMessage = `✅ **Código ${actionWord} com sucesso!**

📦 ${totalFiles} arquivo${totalFiles > 1 ? 's' : ''} ${isUpdate ? 'modificado' : 'criado'}${totalFiles > 1 ? 's' : ''}:
${fileList}${moreFiles}

🎨 Confira o resultado no preview ao lado!`;


      const { data: savedMessage, error: messageError } = await supabase
        .from('project_messages')
        .insert({
          project_id: currentProjectId,
          role: 'assistant',
          content: summaryMessage,
        })
        .select()
        .single();

      if (messageError) {

        addMessage({
          id: `assistant-fallback-${Date.now()}`,
          role: 'assistant',
          content: summaryMessage,
        });
      } else {

      }

    } catch (error) {

      setIsProcessing(false);
      
      const errorContent = `❌ Erro ao gerar código: ${error instanceof Error ? error.message : 'Erro desconhecido'}`;

      // 🔥 SALVAR ERRO NO BANCO - realtime vai propagar
      try {
        await supabase.from('project_messages').insert({
          project_id: currentProjectId,
          role: 'assistant',
          content: errorContent,
        });

      } catch (saveError) {

        // Fallback: mostrar localmente
        addMessage({
          id: `error-fallback-${Date.now()}`,
          role: 'assistant',
          content: errorContent,
        });
      }

      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive",
      });
    }
  }, [user, currentProjectId, currentCode, messages, addMessage, setIsProcessing, addProcessingProject]);

  const deleteProject = useCallback(async (projectId: string) => {
    try {
      const { error } = await supabase
        .from('generated_sites')
        .delete()
        .eq('id', projectId);

      if (error) throw error;

      // If deleting the current project, reset state
      if (projectId === currentProjectId) {
        resetState();
        router.push('/');
      }

      toast({
        title: "Project deleted",
        description: "The project has been removed.",
      });

      return true;
    } catch (error) {

      toast({
        title: "Error deleting project",
        description: "Please try again.",
        variant: "destructive",
      });
      return false;
    }
  }, [currentProjectId, resetState, router]);

  return {
    createNewProject,
    loadProject,
    sendPrompt,
    deleteProject,
  };
};
