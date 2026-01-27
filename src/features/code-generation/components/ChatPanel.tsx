import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Command, Loader2 } from 'lucide-react';
import { ChatMessage } from './ChatMessage';
import { ProgressIndicator } from './ProgressIndicator';
import { useSound } from '@/shared/hooks/useSound';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface ChatPanelProps {
  inputValue: string;
  setInputValue: (value: string) => void;
  onGenerate: (prompt: string) => void;
  isThinking: boolean;
  messages: Message[];
  inputRef?: React.RefObject<HTMLInputElement>;
}

export const ChatPanel = ({ 
  inputValue, 
  setInputValue, 
  onGenerate, 
  isThinking,
  messages,
  inputRef 
}: ChatPanelProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { play } = useSound();

  // DEBUG: Log isThinking changes
  useEffect(() => {

  }, [isThinking]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (inputValue.trim() && !isThinking) {
      play('send');
      onGenerate(inputValue.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();

      if (inputValue.trim() && !isThinking) {

        play('send');
        onGenerate(inputValue.trim());

      } else {

      }
    }
  };

  return (
    <div className="h-full flex flex-col bg-velura-surface">
      {/* Header com status visual */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <h2 className="font-medium text-sm">Chat</h2>
          
          {/* Status indicator */}
          <AnimatePresence>
            {isThinking && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-2 text-xs text-purple-400"
              >
                <motion.div 
                  className="w-2 h-2 bg-purple-400 rounded-full"
                  animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <span className="font-medium">AI is working...</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !isThinking && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-full flex items-center justify-center"
          >
            <div className="text-center text-muted-foreground">
              <p className="text-sm">Start by describing your landing page</p>
              <p className="text-xs mt-1 opacity-70">or select an example from the sidebar</p>
            </div>
          </motion.div>
        )}
        
        <AnimatePresence mode="popLayout">
          {messages.map((message, index) => {
            const isLatest = index === messages.length - 1;
            const isStreaming = isLatest && message.role === 'assistant' && message.content.startsWith('✨');
            
            return (
              <ChatMessage
                key={message.id}
                role={message.role}
                content={message.content}
                isLatest={isLatest}
                isStreaming={isStreaming}
              />
            );
          })}
        </AnimatePresence>
        
        <AnimatePresence>
          {isThinking && (
            <ProgressIndicator 
              currentStatus={
                messages.length > 0 && messages[messages.length - 1]?.role === 'assistant' && messages[messages.length - 1]?.content.startsWith('✨')
                  ? messages[messages.length - 1]?.content.replace('✨ ', '')
                  : undefined
              }
            />
          )}
        </AnimatePresence>
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-white/10">
        <form onSubmit={handleSubmit}>
          <div className={`glass-panel rounded-xl p-1 flex items-center gap-2 transition-all ${
            isThinking ? 'opacity-60 cursor-not-allowed ring-2 ring-purple-500/20' : 'opacity-100'
          }`}>
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                isThinking 
                  ? "AI is working on your request..." 
                  : "Describe your landing page or request changes..."
              }
              className="flex-1 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground/50 disabled:cursor-not-allowed"
              disabled={isThinking}
            />
            <motion.button
              type="submit"
              disabled={!inputValue.trim() || isThinking}
              className="p-2 rounded-lg bg-velura-accent text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-velura-accent/90 transition-colors"
              whileTap={{ scale: 0.95 }}
            >
              <AnimatePresence mode="wait">
                {isThinking ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0, rotate: 0 }}
                    animate={{ opacity: 1, rotate: 360 }}
                    exit={{ opacity: 0 }}
                    transition={{ rotate: { duration: 1, repeat: Infinity, ease: "linear" } }}
                  >
                    <Loader2 className="w-4 h-4" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="send"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <Send className="w-4 h-4" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
          <div className="flex items-center justify-center gap-1 mt-2 text-xs text-muted-foreground/50">
            <Command className="w-3 h-3" />
            <span>+ Enter to send</span>
          </div>
        </form>
      </div>
    </div>
  );
};
