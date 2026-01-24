import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Layout, User, Clock, Building, Trash2, RotateCcw } from 'lucide-react';
import { useSound } from '@/shared/hooks/useSound';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectPrompt: (prompt: string) => void;
  onClearChat: () => void;
  onResetPreview: () => void;
}

const commands = [
  { icon: Layout, label: 'SaaS Landing Page', type: 'prompt', prompt: 'Create a modern SaaS landing page with hero section, features grid, pricing cards, and testimonials' },
  { icon: User, label: 'Portfolio Site', type: 'prompt', prompt: 'Build a minimal portfolio website for a designer with project gallery and contact form' },
  { icon: Clock, label: 'Waitlist Page', type: 'prompt', prompt: 'Design a beautiful waitlist page with email signup and countdown timer' },
  { icon: Building, label: 'Agency Website', type: 'prompt', prompt: 'Create a creative agency website with case studies and team section' },
  { icon: Trash2, label: 'Clear Chat', type: 'action', action: 'clear' },
  { icon: RotateCcw, label: 'Reset Preview', type: 'action', action: 'reset' },
];

export const CommandPalette = ({ open, onOpenChange, onSelectPrompt, onClearChat, onResetPreview }: CommandPaletteProps) => {
  const [search, setSearch] = useState('');
  const { play } = useSound();

  const filteredCommands = commands.filter(cmd =>
    cmd.label.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        play('click');
        onOpenChange(!open);
      }
      if (e.key === 'Escape' && open) {
        onOpenChange(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onOpenChange, play]);

  const handleSelect = (cmd: typeof commands[0]) => {
    play('click');
    if (cmd.type === 'prompt' && cmd.prompt) {
      onSelectPrompt(cmd.prompt);
    } else if (cmd.action === 'clear') {
      onClearChat();
    } else if (cmd.action === 'reset') {
      onResetPreview();
    }
    onOpenChange(false);
    setSearch('');
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => onOpenChange(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />
          
          {/* Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-lg z-50"
          >
            <div className="glass-panel rounded-xl border border-white/20 overflow-hidden shadow-2xl">
              {/* Search Input */}
              <div className="flex items-center gap-3 p-4 border-b border-white/10">
                <Search className="w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search commands..."
                  className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground/50"
                  autoFocus
                />
                <kbd className="px-2 py-1 rounded bg-white/10 text-xs text-muted-foreground">ESC</kbd>
              </div>
              
              {/* Commands List */}
              <div className="max-h-80 overflow-y-auto p-2">
                {filteredCommands.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No commands found
                  </div>
                ) : (
                  filteredCommands.map((cmd) => (
                    <button
                      key={cmd.label}
                      onClick={() => handleSelect(cmd)}
                      className="w-full flex items-center gap-3 p-3 rounded-lg text-left text-sm hover:bg-white/5 transition-colors group"
                    >
                      <cmd.icon className="w-4 h-4 text-muted-foreground group-hover:text-velura-accent transition-colors" />
                      <span>{cmd.label}</span>
                      {cmd.type === 'prompt' && (
                        <span className="ml-auto text-xs text-muted-foreground/50">prompt</span>
                      )}
                    </button>
                  ))
                )}
              </div>
              
              {/* Footer */}
              <div className="flex items-center justify-between p-3 border-t border-white/10 text-xs text-muted-foreground/50">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 rounded bg-white/10">↑↓</kbd>
                    navigate
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 rounded bg-white/10">↵</kbd>
                    select
                  </span>
                </div>
                <span>Velura Command Palette</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
