import { create } from 'zustand';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export interface ProcessingProject {
  id: string;
  prompt: string;
}

interface ProjectState {
  // Current project state
  currentProjectId: string | null;
  messages: Message[];
  currentCode: Record<string, string> | null;
  isProcessing: boolean;
  
  // Global processing queue (for background tasks)
  processingProjects: ProcessingProject[];
  
  // Actions
  setCurrentProjectId: (id: string | null) => void;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  setCurrentCode: (code: Record<string, string> | null) => void;
  setIsProcessing: (isProcessing: boolean) => void;
  
  // Processing queue actions
  addProcessingProject: (project: ProcessingProject) => void;
  removeProcessingProject: (id: string) => void;
  
  // Reset state for new project
  resetState: () => void;
}

export const useProjectStore = create<ProjectState>((set) => ({
  currentProjectId: null,
  messages: [],
  currentCode: null,
  isProcessing: false,
  processingProjects: [],
  
  setCurrentProjectId: (id) => set({ currentProjectId: id }),
  setMessages: (messages) => set({ messages }),
  addMessage: (message) => set((state) => {
    // Se a mensagem tem ID do banco (número), remover qualquer mensagem temporária do mesmo role
    if (!message.id.startsWith('temp-') && !message.id.startsWith('user-fallback-')) {
      const filteredMessages = state.messages.filter(m => 
        !m.id.startsWith('temp-') || m.role !== message.role
      );
      
      // Verificar se essa mensagem do banco já existe
      const messageExists = filteredMessages.some(m => m.id === message.id);
      if (messageExists) {

        return state;
      }
      

      return { messages: [...filteredMessages, message] };
    }
    
    // Para mensagens temporárias, verificar duplicatas normalmente
    const messageExists = state.messages.some(m => m.id === message.id);
    if (messageExists) {

      return state;
    }
    
    return { messages: [...state.messages, message] };
  }),
  setCurrentCode: (code) => set({ currentCode: code }),
  setIsProcessing: (isProcessing) => set({ isProcessing }),
  
  addProcessingProject: (project) => set((state) => ({
    processingProjects: [...state.processingProjects, project]
  })),
  removeProcessingProject: (id) => set((state) => ({
    processingProjects: state.processingProjects.filter(p => p.id !== id)
  })),
  
  resetState: () => set({
    currentProjectId: null,
    messages: [],
    currentCode: null,
    isProcessing: false,
  }),
}));
