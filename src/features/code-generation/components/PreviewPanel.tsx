"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Eye, Code, Loader2, Download } from 'lucide-react';
import IframePreview from './IframePreview';
import { FileTree } from './FileTree';
import { useSound } from '@/shared/hooks/useSound';
import { downloadProjectAsZip } from '@/features/code-generation/utils/downloadUtils';
import { toast } from '@/shared/hooks/use-toast';

interface PreviewPanelProps {
  showGenerated: boolean;
  generatedCode: Record<string, string> | null;
  currentPrompt: string;
  currentProjectId: string | null;
  onSave?: () => Promise<string | null>;
  isProcessing?: boolean;
}

export const PreviewPanel = ({ 
  showGenerated, 
  generatedCode, 
  currentPrompt, 
  isProcessing = false,
}: PreviewPanelProps) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');
  const [isDownloading, setIsDownloading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [showUpdateFlash, setShowUpdateFlash] = useState(false);
  const { play } = useSound();

  // Auto-switch to preview when new code is generated AND on initial mount
  useEffect(() => {
    if (generatedCode && Object.keys(generatedCode).length > 0) {
      // Force preview tab and ensure iframe loads
      setActiveTab('preview');
      
      // 🔥 MOSTRAR FLASH DE ATUALIZAÇÃO
      setShowUpdateFlash(true);
      setTimeout(() => setShowUpdateFlash(false), 2000);
      
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        setActiveTab('preview');
      }, 100);
    }
  }, [generatedCode]);

  const handleTabChange = (tab: 'preview' | 'code') => {
    play('toggle');
    setActiveTab(tab);
  };

  const handleDownload = async () => {
    if (!generatedCode) {
      toast({
        title: "Nothing to download",
        description: "Generate some code first!",
        variant: "destructive",
      });
      return;
    }

    setIsDownloading(true);
    try {
      const projectName = currentPrompt
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .slice(0, 30) || 'velura-project';
      
      await downloadProjectAsZip(generatedCode, projectName);
      play('success');
      toast({
        title: "Download started! 📦",
        description: "Your project has been packaged as a ZIP file.",
      });
    } catch (error) {

      toast({
        title: "Download failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-velura-bg">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 border-b border-white/10 bg-velura-surface">
        <div className="flex items-center gap-1 p-1 rounded-lg bg-white/5">
          <button
            onClick={() => handleTabChange('preview')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-all ${
              activeTab === 'preview'
                ? 'bg-white/10 text-white'
                : 'text-muted-foreground hover:text-white'
            }`}
          >
            <Eye className="w-4 h-4" />
            Preview
          </button>
          <button
            onClick={() => handleTabChange('code')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-all ${
              activeTab === 'code'
                ? 'bg-white/10 text-white'
                : 'text-muted-foreground hover:text-white'
            }`}
          >
            <Code className="w-4 h-4" />
            Code
          </button>
        </div>
        
        <div className="flex items-center gap-3">
          {showGenerated && generatedCode && (
            <>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 text-xs text-green-400"
              >
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                Generated
              </motion.div>
              
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={handleDownload}
                disabled={isDownloading}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 text-white text-sm hover:bg-white/20 transition-colors disabled:opacity-50"
              >
                {isDownloading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                Download
              </motion.button>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden relative">
        {/* 🔥 FLASH DE ATUALIZAÇÃO */}
        <AnimatePresence>
          {showUpdateFlash && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 pointer-events-none"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-blue-500/20 to-pink-500/20"
                animate={{
                  opacity: [0, 0.5, 0],
                }}
                transition={{ duration: 1.5 }}
              />
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.5, opacity: 0 }}
                transition={{ duration: 1 }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
              >
                <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-full p-4 shadow-2xl shadow-purple-500/50">
                  <Image src="/favicon.png" alt="Velura Logo" width={32} height={32} />
                </div>
              </motion.div>
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -50, opacity: 0 }}
                transition={{ delay: 0.3 }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-12"
              >
                <div className="bg-zinc-900/90 backdrop-blur-sm px-6 py-3 rounded-full border border-purple-500/30 shadow-xl">
                  <span className="text-white font-medium text-sm">✨ Preview Atualizado!</span>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {activeTab === 'preview' ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full relative"
            >
              {showGenerated && generatedCode ? (
                <IframePreview files={generatedCode} />
              ) : isProcessing ? (
                <div className="h-full flex items-center justify-center bg-zinc-950">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                    <p className="text-sm text-zinc-400">Generating your site...</p>
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-velura-accent/20 to-velura-accent-secondary/20 flex items-center justify-center mx-auto mb-4">
                      <Image src="/favicon.png" alt="Velura Logo" width={32} height={32} />
                    </div>
                    <h3 className="text-lg font-medium mb-2">Ready to build</h3>
                    <p className="text-sm text-muted-foreground max-w-xs">
                      Describe your landing page in the chat and watch the magic happen
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="code"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full overflow-hidden"
            >
              {showGenerated && generatedCode ? (
                <div className="h-full flex flex-col">
                  <FileTree 
                    files={generatedCode} 
                    onSelectFile={setSelectedFile}
                    selectedFile={selectedFile}
                  />
                  {selectedFile && (
                    <div className="flex-1 overflow-auto bg-gray-900 p-4 border-t border-gray-800">
                      <div className="text-xs text-gray-500 mb-2">{selectedFile}</div>
                      <pre className="text-sm text-gray-300 font-mono">
                        <code>{generatedCode[selectedFile]}</code>
                      </pre>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <Code className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-sm">Code will appear here after generation</p>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
