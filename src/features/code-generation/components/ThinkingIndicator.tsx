import { motion } from 'framer-motion';
import { Bot, Sparkles } from 'lucide-react';

interface ThinkingIndicatorProps {
  message?: string;
  showCodeSkeleton?: boolean;
}

export function ThinkingIndicator({ 
  message = "Crafting your UI...", 
  showCodeSkeleton = false 
}: ThinkingIndicatorProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex gap-3 p-4 bg-zinc-950 rounded-lg border border-purple-500/20"
    >
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center flex-shrink-0 relative">
        <Bot className="w-4 h-4 text-white" />
        <motion.div
          className="absolute -top-1 -right-1"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Sparkles className="w-3 h-3 text-yellow-400" />
        </motion.div>
      </div>
      
      <div className="flex flex-col gap-2 flex-1">
        {!showCodeSkeleton ? (
          <>
            <div className="flex items-center gap-2">
              <span className="text-sm text-zinc-300">{message}</span>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Animated dots */}
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 rounded-full bg-purple-500"
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 1.2,
                      repeat: Infinity,
                      delay: i * 0.2,
                      ease: "easeInOut",
                    }}
                  />
                ))}
              </div>
              
              {/* Progress bar */}
              <div className="flex-1 h-1 bg-zinc-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-purple-600 to-blue-600"
                  animate={{
                    x: ['-100%', '100%'],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col gap-2">
            <span className="text-xs text-zinc-400 mb-1">Generating code...</span>
            {/* Code Skeleton Lines */}
            {[
              'w-full',
              'w-3/4',
              'w-5/6',
              'w-2/3',
              'w-full',
              'w-4/5'
            ].map((width, i) => (
              <motion.div
                key={i}
                className={`h-3 ${width} bg-zinc-800 rounded`}
                animate={{
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.15,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
