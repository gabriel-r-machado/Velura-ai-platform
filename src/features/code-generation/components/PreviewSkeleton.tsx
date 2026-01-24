import { motion } from 'framer-motion';

export const PreviewSkeleton = () => {
  return (
    <div className="h-full w-full bg-zinc-950 p-6 overflow-hidden">
      {/* Navbar Skeleton */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-between mb-8"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-white/5 animate-pulse" />
          <div className="w-24 h-4 rounded bg-white/5 animate-pulse" />
        </div>
        <div className="flex gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="w-16 h-4 rounded bg-white/5 animate-pulse"
              style={{ animationDelay: `${i * 100}ms` }}
            />
          ))}
        </div>
      </motion.div>

      {/* Hero Skeleton */}
      <div className="flex flex-col items-center text-center mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="w-3/4 h-12 rounded-lg bg-gradient-to-r from-white/5 via-white/10 to-white/5 animate-pulse mb-4"
        />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="w-1/2 h-8 rounded bg-white/5 animate-pulse mb-6"
        />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="w-2/3 h-4 rounded bg-white/5 animate-pulse mb-2"
        />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="w-1/2 h-4 rounded bg-white/5 animate-pulse mb-8"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="w-32 h-12 rounded-xl bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 animate-pulse"
        />
      </div>

      {/* Hero Image Skeleton */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="w-full h-48 rounded-2xl bg-gradient-to-br from-white/5 to-white/10 animate-pulse mb-12 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
      </motion.div>

      {/* Features Grid Skeleton */}
      <div className="grid grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 + i * 0.1 }}
            className="p-6 rounded-xl bg-white/5 border border-white/10"
          >
            <div className="w-12 h-12 rounded-lg bg-violet-500/20 animate-pulse mb-4" />
            <div className="w-3/4 h-5 rounded bg-white/10 animate-pulse mb-2" />
            <div className="w-full h-3 rounded bg-white/5 animate-pulse mb-1" />
            <div className="w-2/3 h-3 rounded bg-white/5 animate-pulse" />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// Overlay for when updating existing code
export const PreviewLoadingOverlay = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex flex-col items-center gap-4 p-8 rounded-2xl bg-velura-surface/90 border border-white/10"
      >
        <div className="relative">
          <motion.div
            className="w-16 h-16 rounded-full border-4 border-velura-accent/30"
            style={{ borderTopColor: 'hsl(var(--velura-accent))' }}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
          <motion.div
            className="absolute inset-2 rounded-full border-4 border-violet-500/30"
            style={{ borderBottomColor: 'rgb(139 92 246)' }}
            animate={{ rotate: -360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-foreground">Updating preview...</p>
          <p className="text-xs text-muted-foreground mt-1">Your design is being enhanced</p>
        </div>
      </motion.div>
    </motion.div>
  );
};
