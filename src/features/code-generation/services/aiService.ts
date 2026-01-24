import { supabase } from '@/shared/lib/supabase/client';

export interface GeneratedCode {
  files: Record<string, string>;
}

export interface GenerationError {
  error: string;
  rawContent?: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface GenerateCodeParams {
  prompt: string;
  messages?: ChatMessage[];
  currentFiles?: Record<string, string>;
}

export async function generateCode(params: GenerateCodeParams): Promise<GeneratedCode> {
  const { prompt, messages, currentFiles } = params;

  const { data, error } = await supabase.functions.invoke('generate-code', {
    body: { 
      prompt,
      messages: messages || [],
      current_files: currentFiles || null,
    },
  });

  if (error) {

    throw new Error(error.message || 'Failed to call generate-code function');
  }

  if (data.error) {

    throw new Error(data.error);
  }

  if (!data.files) {
    throw new Error('No files generated');
  }

  return { files: data.files };
}

export async function saveSite(prompt: string, codeContent: Record<string, string>, userId: string): Promise<string> {
  const { data, error } = await supabase
    .from('generated_sites')
    .insert({
      prompt,
      code_content: codeContent,
      user_id: userId,
    })
    .select('id')
    .single();

  if (error) {

    throw new Error(error.message || 'Failed to save site');
  }

  return data.id;
}

export async function getSavedSites() {
  const { data, error } = await supabase
    .from('generated_sites')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {

    throw new Error(error.message || 'Failed to fetch sites');
  }

  return data;
}
