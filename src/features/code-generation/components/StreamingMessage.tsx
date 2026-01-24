import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface StreamingMessageProps {
  content: string;
  isStreaming?: boolean;
  onComplete?: () => void;
}

export function StreamingMessage({ content, isStreaming = false, onComplete }: StreamingMessageProps) {
  const [displayedContent, setDisplayedContent] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!isStreaming) {
      setDisplayedContent(content);
      setCurrentIndex(content.length);
      return;
    }

    if (currentIndex < content.length) {
      const timer = setTimeout(() => {
        setDisplayedContent(content.slice(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      }, 10); // 10ms por caractere = efeito de digitação rápido

      return () => clearTimeout(timer);
    } else if (onComplete) {
      onComplete();
    }
  }, [content, currentIndex, isStreaming, onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative"
    >
      <div className="text-sm text-zinc-200 whitespace-pre-wrap">
        {displayedContent}
        {isStreaming && currentIndex < content.length && (
          <motion.span
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 0.8, repeat: Infinity }}
            className="inline-block w-1 h-4 ml-1 bg-purple-500"
          />
        )}
      </div>
    </motion.div>
  );
}
