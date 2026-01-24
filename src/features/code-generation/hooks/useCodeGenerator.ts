import { useState, useCallback } from "react";
import { CodeGenerationService } from "../services/code-generation.service";
import { toast } from "@/shared/hooks/use-toast";

interface UseCodeGeneratorReturn {
  generateCode: (prompt: string, currentFiles?: Record<string, string>) => Promise<Record<string, string> | null>;
  isGenerating: boolean;
  error: Error | null;
  generatedFiles: Record<string, string> | null;
}

export function useCodeGenerator(): UseCodeGeneratorReturn {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [generatedFiles, setGeneratedFiles] = useState<Record<string, string> | null>(null);

  const generateCode = useCallback(async (prompt: string, currentFiles?: Record<string, string>): Promise<Record<string, string> | null> => {
    if (!prompt.trim()) {
      toast({
        title: "Error",
        description: "Please provide a prompt",
        variant: "destructive",
      });
      return null;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const files = await CodeGenerationService.generateCode(prompt, currentFiles);
      setGeneratedFiles(files);
      
      toast({
        title: "Success",
        description: "Code generated successfully",
      });

      return files;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Unknown error occurred");
      setError(error);
      
      toast({
        title: "Generation Failed",
        description: error.message,
        variant: "destructive",
      });

      return null;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return {
    generateCode,
    isGenerating,
    error,
    generatedFiles,
  };
}
