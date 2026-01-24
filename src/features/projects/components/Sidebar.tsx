import { Layout, User, Clock, Building, FolderOpen, Trash2, LogOut, Loader2, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useAuth } from '@/features/auth/contexts/AuthContext';
import { useProjects, Project } from '@/features/projects/hooks/useProjects';
import { useProjectStore } from '@/features/projects/stores/projectStore';
import { formatDistanceToNow } from 'date-fns';

interface SidebarProps {
  onSelectPrompt: (prompt: string) => void;
  onLoadProject: (project: Project) => void;
  onNewProject: () => void;
  currentProjectId: string | null;
}

const examplePrompts = [
  { icon: Layout, label: 'SaaS Landing Page', prompt: 'Create a modern SaaS landing page with hero section, features grid, pricing cards, and testimonials' },
  { icon: User, label: 'Portfolio Site', prompt: 'Build a minimal portfolio website for a designer with project gallery and contact form' },
  { icon: Clock, label: 'Waitlist Page', prompt: 'Design a beautiful waitlist page with email signup and countdown timer' },
  { icon: Building, label: 'Agency Website', prompt: 'Create a creative agency website with case studies and team section' },
];

export const Sidebar = ({ onSelectPrompt, onLoadProject, onNewProject, currentProjectId }: SidebarProps) => {
  const { user, signOut } = useAuth();
  const { projects, loading, deleteProject } = useProjects();
  const { processingProjects } = useProjectStore();

  const handleDelete = async (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this project?')) {
      try {
        await deleteProject(projectId);
      } catch (error) {

      }
    }
  };

  const truncatePrompt = (prompt: string, maxLength: number = 30) => {
    return prompt.length > maxLength ? prompt.substring(0, maxLength) + '...' : prompt;
  };

  return (
    <div className="h-full flex flex-col bg-velura-surface border-r border-white/10">
      {/* Logo */}
      <div className="p-4 border-b border-white/10">
        <motion.div 
          className="flex items-center gap-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-velura-accent to-velura-accent-secondary flex items-center justify-center">
            <Image src="/favicon.png" alt="Velura Logo" width={16} height={16} />
          </div>
          <span className="font-semibold text-lg tracking-tight">Velura</span>
        </motion.div>
      </div>

      {/* New Project Button */}
      {user && (
        <div className="p-4 border-b border-white/10">
          <motion.button
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={onNewProject}
            className="w-full flex items-center justify-center gap-2 p-3 rounded-lg bg-velura-accent hover:bg-velura-accent/90 text-white font-medium transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Project</span>
          </motion.button>
        </div>
      )}

      {/* Global Processing Indicator */}
      <AnimatePresence>
        {processingProjects.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 pb-2"
          >
            <div className="p-2 rounded-lg bg-velura-accent/20 border border-velura-accent/30">
              <div className="flex items-center gap-2 text-xs text-velura-accent">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Generating...</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* User Projects Section */}
      {user && (
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-2 mb-3">
            <FolderOpen className="w-4 h-4 text-muted-foreground" />
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Your Projects</p>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            </div>
          ) : projects.length === 0 ? (
            <p className="text-xs text-muted-foreground/60 text-center py-2">
              No projects yet. Create your first one!
            </p>
          ) : (
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {projects.map((project) => (
                <motion.button
                  key={project.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  onClick={() => onLoadProject(project)}
                  className={`w-full flex items-center justify-between p-2 rounded-lg text-left text-sm transition-all group ${
                    currentProjectId === project.id
                      ? 'bg-velura-accent/20 text-foreground border border-velura-accent/30'
                      : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-xs font-medium">
                      {truncatePrompt(project.prompt)}
                    </p>
                    <p className="text-[10px] text-muted-foreground/60">
                      {formatDistanceToNow(new Date(project.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  <div
                    onClick={(e) => handleDelete(e, project.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded transition-all cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3 text-red-400" />
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Example Prompts */}
      <div className="flex-1 p-4 overflow-y-auto">
        <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Example Prompts</p>
        <div className="space-y-2">
          {examplePrompts.map((item, index) => (
            <motion.button
              key={item.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => onSelectPrompt(item.prompt)}
              className="w-full flex items-center gap-3 p-3 rounded-lg text-left text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all group"
            >
              <item.icon className="w-4 h-4 group-hover:text-velura-accent transition-colors" />
              <span>{item.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* User Info & Logout */}
      {user && (
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
            <button
              onClick={signOut}
              className="p-2 hover:bg-white/5 rounded-lg transition-colors"
              title="Sign out"
            >
              <LogOut className="w-4 h-4 text-muted-foreground hover:text-foreground" />
            </button>
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts */}
      <div className="p-4 border-t border-white/10">
        <p className="text-xs text-muted-foreground mb-2">Keyboard Shortcuts</p>
        <div className="space-y-1 text-xs text-muted-foreground/70">
          <div className="flex justify-between">
            <span>Command palette</span>
            <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-[10px]">⌘K</kbd>
          </div>
          <div className="flex justify-between">
            <span>Send message</span>
            <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-[10px]">⌘↵</kbd>
          </div>
        </div>
      </div>
    </div>
  );
};
