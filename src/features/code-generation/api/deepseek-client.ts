"use server";

import { env } from "@/env.mjs";
import { AI_CONFIG, SYSTEM_PROMPT } from "@/features/code-generation/constants";
import { APIError } from "@/shared/lib/errors";

interface DeepSeekMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface DeepSeekResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export async function callDeepSeekAPI(prompt: string): Promise<string> {
  // Timeout de 5 minutos
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 300000);

  try {
    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.DEEPSEEK_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: AI_CONFIG.MODEL,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: prompt },
        ] satisfies DeepSeekMessage[],
        temperature: AI_CONFIG.TEMPERATURE,
        max_tokens: AI_CONFIG.MAX_TOKENS,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();

      throw new APIError(`DeepSeek API failed: ${errorText}`, response.status);
    }

    const data = (await response.json()) as DeepSeekResponse;
    const content = data.choices[0]?.message?.content;
    
    if (!content) {

      throw new APIError("No content in DeepSeek response");
    }

    return content;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof Error && error.name === 'AbortError') {
      throw new APIError('DeepSeek API timeout after 5 minutes', 408);
    }
    
    throw error;
  }
}
