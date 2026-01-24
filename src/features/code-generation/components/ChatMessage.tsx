import { motion } from 'framer-motion';
import { User, Bot, Sparkles } from 'lucide-react';
import { forwardRef } from 'react';
import { StreamingMessage } from './StreamingMessage';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  isLatest?: boolean;
  isStreaming?: boolean;
}

export const ChatMessage = forwardRef<HTMLDivElement, ChatMessageProps>(
  function ChatMessage({ role, content, isLatest = false, isStreaming = false }, ref) {
    const isUser = role === 'user';

    return (
      <motion.div
        ref={ref}
        layout
        initial={{ opacity: 0, y: 30, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95, y: -20 }}
        transition={{ 
          type: "spring", 
          stiffness: 260, 
          damping: 20 
        }}
        className={`flex gap-3 p-4 rounded-xl relative overflow-hidden ${
          isUser 
            ? 'bg-gradient-to-br from-blue-950/30 to-blue-900/20 border border-blue-800/30' 
            : 'bg-gradient-to-br from-purple-950/30 to-zinc-900/50 border border-purple-800/20'
        } ${isLatest ? 'ring-2 ring-purple-500/30 shadow-lg shadow-purple-500/10' : ''}`}
    >
      {/* Background Glow Effect */}
      {isLatest && !isUser && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-blue-500/5 to-pink-500/5"
          animate={{
            x: ['-100%', '100%'],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      )}

      <motion.div 
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 400, damping: 25 }}
        className={`relative w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
          isUser 
            ? 'bg-gradient-to-br from-blue-600 to-blue-500 shadow-lg shadow-blue-500/30' 
            : 'bg-gradient-to-br from-purple-600 via-blue-600 to-pink-600 shadow-lg shadow-purple-500/30'
        }`}
      >
        {isUser ? (
          <User className="w-4 h-4 text-white" />
        ) : (
          <>
            <Bot className="w-4 h-4 text-white" />
            {isStreaming && (
              <motion.div
                className="absolute -top-1 -right-1"
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-3 h-3 text-yellow-400" />
              </motion.div>
            )}
          </>
        )}
      </motion.div>
      
      <div className="flex-1 relative z-10">
        {isStreaming && !isUser ? (
          <StreamingMessage content={content} isStreaming={true} />
        ) : (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="text-sm text-zinc-200 leading-relaxed space-y-2"
          >
            {/* Renderizar conteúdo com formatação */}
            {content.split('\n').map((line, idx) => {
              // Detectar headers com **texto**
              const boldMatch = line.match(/\*\*(.+?)\*\*/g);
              if (boldMatch) {
                let formattedLine = line;
                boldMatch.forEach(match => {
                  const text = match.replace(/\*\*/g, '');
                  formattedLine = formattedLine.replace(match, `<strong class="font-semibold text-white">${text}</strong>`);
                });
                return <div key={idx} dangerouslySetInnerHTML={{ __html: formattedLine }} />;
              }
              
              // Detectar listas com •
              if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
                return (
                  <div key={idx} className="flex gap-2 pl-2">
                    <span className="text-purple-400 flex-shrink-0">•</span>
                    <span>{line.replace(/^[•\-]\s*/, '')}</span>
                  </div>
                );
              }
              
              // Detectar emojis no início (headers)
              if (/^[🎨📦✅⚙️🔍⚡📄✨🚀💬]/.test(line)) {
                return (
                  <div key={idx} className="text-base font-medium text-white mt-1">
                    {line}
                  </div>
                );
              }
              
              // Linha normal
              return line ? <div key={idx}>{line}</div> : <div key={idx} className="h-2" />;
            })}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
});
