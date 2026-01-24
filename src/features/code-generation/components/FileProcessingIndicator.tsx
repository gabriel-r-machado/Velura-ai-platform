import { motion } from 'framer-motion';
import { FileCode, Check, Loader2 } from 'lucide-react';

interface FileProcessingIndicatorProps {
  files: string[];
  currentFile?: string;
}

export function FileProcessingIndicator({ files, currentFile }: FileProcessingIndicatorProps) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden"
    >
      <div className="bg-zinc-900/50 rounded-lg border border-zinc-800 p-3 space-y-2">
        <div className="flex items-center gap-2 text-xs text-zinc-400 mb-2">
          <Loader2 className="w-3 h-3 animate-spin text-purple-400" />
          <span>Processando arquivos...</span>
        </div>
        
        <div className="space-y-1 max-h-32 overflow-y-auto">
          {files.map((file, index) => {
            const isProcessing = currentFile === file;
            const isCompleted = files.indexOf(file) < files.indexOf(currentFile || '');
            
            return (
              <motion.div
                key={file}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-2 text-xs"
              >
                {isCompleted ? (
                  <Check className="w-3 h-3 text-green-400 flex-shrink-0" />
                ) : isProcessing ? (
                  <Loader2 className="w-3 h-3 text-purple-400 animate-spin flex-shrink-0" />
                ) : (
                  <FileCode className="w-3 h-3 text-zinc-600 flex-shrink-0" />
                )}
                <span className={`truncate ${
                  isCompleted ? 'text-green-400 line-through' :
                  isProcessing ? 'text-purple-400 font-medium' :
                  'text-zinc-500'
                }`}>
                  {file}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
