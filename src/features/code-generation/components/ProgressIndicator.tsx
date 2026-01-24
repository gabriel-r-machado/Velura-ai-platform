import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Sparkles, Code, Zap, CheckCircle2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ProgressIndicatorProps {
  currentStatus?: string;
}

const STEPS = [
  { id: 'analyzing', label: 'Analisando pedido', icon: Bot, color: 'text-blue-400' },
  { id: 'connecting', label: 'Conectando com IA', icon: Zap, color: 'text-yellow-400' },
  { id: 'generating', label: 'Gerando código', icon: Code, color: 'text-purple-400' },
  { id: 'processing', label: 'Processando arquivos', icon: Sparkles, color: 'text-pink-400' },
  { id: 'optimizing', label: 'Otimizando', icon: CheckCircle2, color: 'text-green-400' },
];

export function ProgressIndicator({ currentStatus }: ProgressIndicatorProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!currentStatus) {
      // Auto-progress sem status
      const timer = setInterval(() => {
        setCurrentStep(prev => {
          const next = (prev + 1) % STEPS.length;
          setProgress((next / STEPS.length) * 100);
          return next;
        });
      }, 2000);
      return () => clearInterval(timer);
    } else {
      // Detectar step baseado no status
      const statusMap: Record<string, number> = {
        'Analisando': 0,
        'Conectando': 1,
        'Gerando': 2,
        'Processando': 3,
        'Otimizando': 4,
      };

      for (const [key, value] of Object.entries(statusMap)) {
        if (currentStatus.includes(key)) {
          setCurrentStep(value);
          setProgress(((value + 1) / STEPS.length) * 100);
          break;
        }
      }
    }
  }, [currentStatus]);

  const currentStepData = STEPS[currentStep] ?? STEPS[0]!;
  const CurrentIcon = currentStepData.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex gap-3 p-4 bg-gradient-to-r from-zinc-950 to-zinc-900 rounded-xl border border-purple-500/30 shadow-lg shadow-purple-500/10"
    >
      {/* Avatar Animado */}
      <div className="relative">
        <motion.div 
          className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 via-blue-600 to-pink-600 flex items-center justify-center flex-shrink-0"
          animate={{
            boxShadow: [
              '0 0 20px rgba(168, 85, 247, 0.4)',
              '0 0 40px rgba(168, 85, 247, 0.6)',
              '0 0 20px rgba(168, 85, 247, 0.4)',
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ duration: 0.3 }}
            >
              <CurrentIcon className="w-5 h-5 text-white" />
            </motion.div>
          </AnimatePresence>
        </motion.div>
        
        {/* Pulse Ring */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-purple-500"
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.8, 0, 0.8],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </div>
      
      <div className="flex flex-col gap-3 flex-1">
        {/* Status Text */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex items-center gap-2"
          >
            <span className={`text-sm font-medium ${currentStepData.color}`}>
              {currentStatus || currentStepData.label}
            </span>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-3 h-3 text-yellow-400" />
            </motion.div>
          </motion.div>
        </AnimatePresence>
        
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden relative">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-600 via-blue-500 to-pink-500"
              initial={{ width: '0%' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
            {/* Shimmer Effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              animate={{
                x: ['-100%', '200%'],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          </div>
          
          {/* Steps Indicators */}
          <div className="flex justify-between items-center gap-1">
            {STEPS.map((step, index) => (
              <motion.div
                key={step.id}
                className={`flex-1 h-1 rounded-full transition-colors ${
                  index <= currentStep ? 'bg-purple-500' : 'bg-zinc-700'
                }`}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: index <= currentStep ? 1 : 0.5 }}
                transition={{ delay: index * 0.1 }}
              />
            ))}
          </div>
        </div>
        
        {/* Animated Dots */}
        <div className="flex gap-1">
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-purple-500"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.15,
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
