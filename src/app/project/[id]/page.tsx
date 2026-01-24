'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/shared/components/ui/resizable';
import { Sidebar } from '@/features/projects/components/Sidebar';
import { ChatPanel } from '@/features/code-generation/components/ChatPanel';
import { PreviewPanel } from '@/features/code-generation/components/PreviewPanel';
import { useProjectStore } from '@/features/projects/stores/projectStore';
import { useProjectActions } from '@/features/projects/hooks/useProjectActions';
import { useRealtimeProject, useRealtimeMessages } from '@/features/projects/hooks/useRealtimeProject';
import { useAuth } from '@/features/auth/contexts/AuthContext';

export default function ProjectPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const hasLoadedRef = useRef(false);
  const [enableRealtime, setEnableRealtime] = useState(false);
  
  const { 
    currentProjectId,
    messages, 
    currentCode, 
    isProcessing,
  } = useProjectStore();
  
  const { loadProject, sendPrompt, createNewProject } = useProjectActions();

  // Subscribe to realtime updates - só habilita após carregar projeto
  useRealtimeProject(enableRealtime && id ? id : null);
  useRealtimeMessages(enableRealtime && id ? id : null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth');
    }
  }, [user, authLoading, router]);

  // Reset hasLoadedRef when ID changes
  useEffect(() => {
    hasLoadedRef.current = false;
  }, [id]);

  // Load project on mount or ID change
  useEffect(() => {
    if (!id || !user) {
      setIsLoading(false);
      setEnableRealtime(false);
      return;
    }
    
    // Prevent infinite loop - only load once per ID
    if (hasLoadedRef.current && currentProjectId === id) {
      setIsLoading(false);
      setEnableRealtime(true);
      return;
    }
    
    setIsLoading(true);
    setEnableRealtime(false); // Desabilita durante carregamento
    hasLoadedRef.current = true;
    
    // Save to localStorage for persistence
    localStorage.setItem('velura_last_project', id);
    
    // Load project and handle not found case
    loadProject(id)
      .then((result) => {
        if (!result) {
          hasLoadedRef.current = false;
          setEnableRealtime(false);
        } else {
          // Só habilita realtime após projeto carregar com sucesso
          setTimeout(() => setEnableRealtime(true), 500);
        }
      })
      .finally(() => setIsLoading(false));
  }, [id, user]); // Removed loadProject from dependencies to prevent loop

  const handleGenerate = (prompt?: string) => {
    if (!prompt || !prompt.trim() || isProcessing) {
      return;
    }
    
    setInputValue('');
    sendPrompt(prompt);
  };

  const handleSelectPrompt = (prompt: string) => {
    setInputValue(prompt);
    inputRef.current?.focus();
  };

  const handleLoadProject = async (project: { id: string }) => {
    router.push(`/project/${project.id}`);
  };

  const handleNewProject = async () => {
    await createNewProject();
  };

  const handleSave = async () => {
    return currentProjectId;
  };

  if (authLoading || isLoading) {
    return (
      <div className="h-screen w-screen bg-zinc-950 flex items-center justify-center">
        <div className="animate-pulse text-zinc-400">Loading project...</div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-zinc-950 text-zinc-100 overflow-hidden">
      <div className="flex h-full">
        {/* Sidebar */}
        <div className="w-56 flex-shrink-0 border-r border-white/10 bg-zinc-900">
          <Sidebar 
            onSelectPrompt={handleSelectPrompt} 
            onLoadProject={handleLoadProject}
            onNewProject={handleNewProject}
            currentProjectId={currentProjectId}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 h-full">
          <ResizablePanelGroup direction="horizontal" className="h-full">
            <ResizablePanel defaultSize={35} minSize={25} maxSize={50}>
              <ChatPanel
                inputValue={inputValue}
                setInputValue={setInputValue}
                onGenerate={handleGenerate}
                isThinking={isProcessing}
                messages={messages}
                inputRef={inputRef}
              />
            </ResizablePanel>
            
            <ResizableHandle withHandle className="bg-white/5 hover:bg-white/10 transition-colors" />
            
            <ResizablePanel defaultSize={65} minSize={40}>
              <PreviewPanel 
                showGenerated={!!currentCode && Object.keys(currentCode).length > 0}
                generatedCode={currentCode}
                currentPrompt=""
                currentProjectId={currentProjectId}
                onSave={handleSave}
                isProcessing={isProcessing}
              />
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </div>
    </div>
  );
}
