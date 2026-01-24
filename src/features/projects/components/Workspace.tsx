"use client";

import { useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/shared/components/ui/resizable';
import { Sidebar } from '@/features/projects/components/Sidebar';
import { ChatPanel } from '@/features/code-generation/components/ChatPanel';
import { PreviewPanel } from '@/features/code-generation/components/PreviewPanel';
import { useAuth } from '@/features/auth/contexts/AuthContext';
import type { Project } from '@/features/projects/hooks/useProjects';
import { supabase } from '@/shared/lib/supabase/client';
import { toast } from '@/shared/hooks/use-toast';
import { useSound } from '@/shared/hooks/useSound';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export const Workspace = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { play } = useSound();
  const inputRef = useRef<HTMLInputElement>(null);
  const isNavigatingRef = useRef(false);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Hydration fix - ensure client-side only rendering
  useEffect(() => {

    setIsMounted(true);
  }, []);

  // Welcome message
  useEffect(() => {
    if (isMounted && messages.length === 0) {

      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: 'Welcome to Velura! 🚀 Describe your landing page and I\'ll create it with AI-generated images. Try: "Luxury car rental with exotic vehicles"',
      }]);
    }
  }, [isMounted]);

  const handleGenerate = async (prompt: string) => {
    if (!prompt.trim()) {

      return;
    }

    // Check if user is authenticated
    if (!user) {

      toast({
        title: "Authentication required",
        description: "Please sign in to generate landing pages.",
        variant: "destructive",
      });
      router.push('/auth');
      return;
    }

    const userPrompt = prompt;

    setInputValue('');
    setIsThinking(true);
    play('send');


    // Add user message
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'user',
      content: userPrompt,
    }]);

    try {
      // Create a new project first
      const { data: project, error: createError } = await supabase
        .from('generated_sites')
        .insert({
          prompt: userPrompt,
          code_content: {},
          user_id: user.id,
          status: 'processing',
        })
        .select('id')
        .single();

      if (createError) {

        throw createError;
      }



      // Save user message

      await supabase.from('project_messages').insert({
        project_id: project.id,
        role: 'user',
        content: userPrompt,
      });


      // Save to localStorage for persistence
      localStorage.setItem('velura_last_project', project.id);
      
      // Previne múltiplas navegações
      if (isNavigatingRef.current) return;
      isNavigatingRef.current = true;
      
      // Navigate to project page (realtime will handle the rest)
      setTimeout(() => {
        router.push(`/project/${project.id}`);
      }, 200);


      // Call edge function (fire-and-forget, realtime handles updates)
      await supabase.functions.invoke('generate-code', {
        body: {
          project_id: project.id,
          prompt: userPrompt,
          messages: [{ role: 'user', content: userPrompt }],
          current_files: null,
        },
      });
      


    } catch (error) {

      setIsThinking(false);
      
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Error: ${error instanceof Error ? error.message : 'Failed to create project'}`,
      }]);

      toast({
        title: "Error",
        description: "Failed to create project. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSelectPrompt = (prompt: string) => {
    play('click');
    setInputValue(prompt);
    inputRef.current?.focus();
  };

  const handleLoadProject = (project: Project) => {
    play('click');
    router.push(`/project/${project.id}`);
  };

  const handleNewProject = () => {
    play('click');
    setMessages([{
      id: 'welcome',
      role: 'assistant',
      content: 'Ready to create something new! Describe your landing page.',
    }]);
    setInputValue('');
    inputRef.current?.focus();
  };

  return (
    <div className="h-screen w-screen bg-zinc-950 text-zinc-100 overflow-hidden">
      {!isMounted ? (
        <div className="h-full w-full flex items-center justify-center">
          <div className="animate-pulse text-gray-500">Loading...</div>
        </div>
      ) : (
        <div className="flex h-full">
          {/* Sidebar with Projects */}
          <div className="w-64 flex-shrink-0 border-r border-white/10 bg-zinc-900">
            <Sidebar 
              onSelectPrompt={handleSelectPrompt} 
              onLoadProject={handleLoadProject}
              onNewProject={handleNewProject}
              currentProjectId={null}
            />
          </div>

          {/* Main Content Area */}
          <div className="flex-1 h-full">
            <ResizablePanelGroup direction="horizontal" className="h-full">
              {/* Chat Panel (Left) */}
              <ResizablePanel defaultSize={40} minSize={30} maxSize={60}>
                <ChatPanel
                  inputValue={inputValue}
                  setInputValue={setInputValue}
                  onGenerate={handleGenerate}
                  isThinking={isThinking}
                  messages={messages}
                  inputRef={inputRef}
                />
              </ResizablePanel>
              
              <ResizableHandle className="w-px bg-white/10 hover:bg-white/20 transition-colors" />
              
              {/* Preview Panel (Right) */}
              <ResizablePanel defaultSize={60} minSize={40}>
                <PreviewPanel 
                  showGenerated={false}
                  generatedCode={null}
                  currentPrompt=""
                  currentProjectId={null}
                  onSave={async () => null}
                  isProcessing={isThinking}
                />
              </ResizablePanel>
            </ResizablePanelGroup>
          </div>
        </div>
      )}
    </div>
  );
};
