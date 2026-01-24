import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// --- PROMPT "SMART VISUALS" (Foco em Design, Economia em Texto) ---
const SYSTEM_PROMPT = `You are an Award-Winning UI/UX Designer. Build a Visually Stunning Landing Page (React + Tailwind + Framer Motion).

### CRITICAL STRATEGY FOR SPEED & QUALITY
1. **FOCUS ON UI**: Spend all your tokens on complex layouts, gradients, glassmorphism, and animations.
2. **SAVE ON TEXT**: Use "Lorem ipsum" for long descriptions. Do not write creative copy. We need the DESIGN code.
3. **REAL IMAGES**: You MUST use Unsplash images.
   - Format: "https://images.unsplash.com/photo-[ID]?auto=format&fit=crop&w=1200&q=80"
   - IDs: Use distinct IDs for tech, office, abstract, people.
4. **COMPONENTS**:
   - **Hero**: Immersive background or split layout with large typography.
   - **Navbar**: Sticky with backdrop-blur-lg.
   - **Bento Grid**: For features/services (highly visual).
   - **Testimonials**: Cards with avatars.
   - **Footer**: Clean and multi-column.

### TECHNICAL RULES
1. **JSON ONLY**: Return ONLY valid JSON.
2. **NO COMMENTS**: Code must be concise.
3. **STACK**: React + Tailwind + Framer Motion + Lucide React.
4. **FILE STRUCTURE**:
   - "src/main.tsx"
   - "src/App.tsx"
   - "src/index.css" (Tailwind imports + custom animations)
   - "src/components/Hero.tsx"
   - "src/components/Navbar.tsx"
   - "src/components/Features.tsx"
   - "src/components/Testimonials.tsx"
   - "src/components/Footer.tsx"

### JSON STRUCTURE
{
  "src/main.tsx": "...",
  "src/App.tsx": "...",
  "src/components/Hero.tsx": "..."
}`;

const SYSTEM_PROMPT_EDIT = `You are a Senior UI Developer. Improve the design visuals.
Use Lorem Ipsum for text to save space. Return ONLY valid JSON.`;

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

function cleanJsonOutput(text: string): string {
  let clean = text.trim();
  clean = clean.replace(/^```(?:json|javascript|js|tsx|ts)?\s*\n?/i, '');
  clean = clean.replace(/\n?```\s*$/i, '');
  return clean;
}

function tryRepairJson(jsonString: string): string {
    let fixed = jsonString.trim();
    if (!fixed.endsWith('}') && !fixed.endsWith(']')) {
        if (!fixed.endsWith('"')) fixed += '"'; 
        fixed += '"}'; 
    }
    return fixed;
}

async function callDeepSeekWithRetry(
  messages: Array<{ role: string; content: string }>,
  apiKey: string,
  maxRetries = 3
): Promise<string> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[DeepSeek] Attempt ${attempt}/${maxRetries}`);
      
      const controller = new AbortController();
      // Timeout de 2.5 minutos para a API (Seguro para o Supabase)
      const timeoutId = setTimeout(() => controller.abort(), 150000); 
      
      const response = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: messages,
          // --- O PULO DO GATO ---
          // 5500 Tokens: O máximo que o Supabase aguenta antes de morrer.
          // Com Lorem Ipsum, isso equivale a um site de 8000 tokens de "design".
          temperature: 0.6, 
          max_tokens: 5500, 
          stream: false,
          response_format: { type: 'json_object' }
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`DeepSeek API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      
      if (!content) throw new Error('No content in DeepSeek response');

      return content;

    } catch (error) {
      console.error(`[DeepSeek] Attempt ${attempt} failed:`, error);
      lastError = error as Error;
      if (attempt < maxRetries) await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
    }
  }
  throw lastError || new Error('DeepSeek API failed after retries');
}

async function processGeneration(
  projectId: string,
  prompt: string,
  messages: ChatMessage[],
  currentFiles: Record<string, string> | null,
  supabaseClient: any,
  deepseekApiKey: string
) {
  console.log(`[Worker] Starting generation for project: ${projectId}`);
  
  try {
    await supabaseClient
      .from('generated_sites')
      .update({ status: 'processing', error_message: null, updated_at: new Date().toISOString() })
      .eq('id', projectId);

    const isEdit = currentFiles && Object.keys(currentFiles).length > 0;
    const systemInstruction = isEdit ? SYSTEM_PROMPT_EDIT : SYSTEM_PROMPT;
    const apiMessages = [{ role: 'system', content: systemInstruction }];

    if (isEdit) {
      apiMessages.push({ 
        role: 'user', 
        content: `Current Code:\n${JSON.stringify(currentFiles)}\n\nRequest: ${prompt}` 
      });
    } else {
      // Instrução extra para garantir visual
      apiMessages.push({ 
        role: 'user', 
        content: `Create a VISUALLY STUNNING landing page for: ${prompt}. Use real Unsplash images and glassmorphism. Use Lorem Ipsum for text.` 
      });
    }

    const recentMessages = (messages || []).slice(-4);
    recentMessages.forEach(msg => {
       if (msg.content !== prompt) apiMessages.push({ role: msg.role, content: msg.content });
    });

    const aiRawResponse = await callDeepSeekWithRetry(apiMessages, deepseekApiKey);

    console.log(`[Worker] Parsing response...`);
    let codeFiles: Record<string, string> = {};
    const cleanedContent = cleanJsonOutput(aiRawResponse);

    try {
      codeFiles = JSON.parse(cleanedContent);
    } catch (e) {
      console.warn("JSON Parse failed. Attempting repair...");
      try {
        const repaired = tryRepairJson(cleanedContent);
        codeFiles = JSON.parse(repaired);
      } catch (e2) {
          const match = cleanedContent.match(/\{[\s\S]*\}/);
          if (match) {
             try { codeFiles = JSON.parse(match[0]); } catch { throw e; }
          } else {
            throw new Error("Could not parse AI response.");
          }
      }
    }

    if (!codeFiles['src/main.tsx'] && !isEdit) {
       codeFiles['src/main.tsx'] = `import React from 'react';\nimport ReactDOM from 'react-dom/client';\nimport App from './App';\nimport './index.css';\n\nReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>);`;
    }

    const { error: updateError } = await supabaseClient
      .from('generated_sites')
      .update({
        code_content: codeFiles,
        status: 'completed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', projectId);

    if (updateError) throw updateError;

    await supabaseClient.from('project_messages').insert({
      project_id: projectId,
      role: 'assistant',
      content: isEdit ? "Visual update applied! ✨" : "Website ready! (Check the design) 🚀",
    });

    console.log(`[Worker] Success for project ${projectId}`);

  } catch (error) {
    console.error(`[Worker] Error:`, error);
    const msg = error instanceof Error ? error.message : 'Unknown error';
    
    await supabaseClient.from('generated_sites').update({ status: 'error', error_message: msg }).eq('id', projectId);
    
    await supabaseClient.from('project_messages').insert({ 
      project_id: projectId, 
      role: 'assistant', 
      content: `❌ Error: ${msg}` 
    });
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { project_id, prompt, messages, current_files } = await req.json();

    if (!project_id || !prompt) throw new Error('Missing fields');

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const deepseekKey = Deno.env.get('DEEPSEEK_API_KEY');

    const supabaseClient = createClient(supabaseUrl!, supabaseKey!);

    const generationTask = processGeneration(
      project_id, prompt, messages || [], current_files || null, supabaseClient, deepseekKey!
    ).catch(console.error);

    // @ts-ignore
    if (typeof EdgeRuntime !== 'undefined' && EdgeRuntime.waitUntil) {
      // @ts-ignore
      EdgeRuntime.waitUntil(generationTask);
    }

    return new Response(JSON.stringify({ 
        status: 'queued', 
        message: 'Generation started...' 
    }), {
      status: 202, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal Error' }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
