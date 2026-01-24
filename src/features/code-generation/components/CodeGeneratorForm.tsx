import { useState } from "react";
import { useCodeGenerator } from "@/features/code-generation";
import { Button } from "@/shared/components/ui/button";
import { Textarea } from "@/shared/components/ui/textarea";
import { Loader2 } from "lucide-react";

export function CodeGeneratorForm() {
  const [prompt, setPrompt] = useState("");
  const { generateCode, isGenerating, error } = useCodeGenerator();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await generateCode(prompt);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Describe the landing page you want to create..."
        className="min-h-[120px]"
        disabled={isGenerating}
      />

      {error && (
        <div className="text-sm text-destructive" role="alert">
          {error.message}
        </div>
      )}

      <Button
        type="submit"
        disabled={isGenerating || !prompt.trim()}
        className="w-full"
      >
        {isGenerating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating...
          </>
        ) : (
          "Generate Code"
        )}
      </Button>
    </form>
  );
}
