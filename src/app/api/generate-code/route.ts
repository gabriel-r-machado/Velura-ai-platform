import { generateCodeRequestSchema } from "@/features/code-generation/schemas";
import { callDeepSeekAPI } from "@/features/code-generation/api/deepseek-client";
import { parseCodeFiles } from "@/features/code-generation/utils/json-parser";
import { createErrorResponse } from "@/shared/lib/error-handler";
import { codeGenerationLimiter, getClientIP } from "@/shared/lib/rate-limiter";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    // Rate limiting
    const clientIP = getClientIP(request);
    const { allowed, remaining, resetTime } = codeGenerationLimiter.check(clientIP);

    if (!allowed) {
      const resetDate = new Date(resetTime);
      return new Response(
        JSON.stringify({
          error: "Rate limit exceeded",
          message: "Too many requests. Please try again later.",
          resetAt: resetDate.toISOString(),
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "X-RateLimit-Limit": "10",
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": resetDate.toISOString(),
            "Retry-After": Math.ceil((resetTime - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    const body = await request.json();
    const { prompt, currentFiles } = generateCodeRequestSchema.parse(body);

    // Se existirem arquivos anteriores, criar prompt contextual
    let userMessage = prompt;
    if (currentFiles && Object.keys(currentFiles).length > 0) {
      userMessage = `CONTEXT: The user wants to modify an EXISTING project.

CURRENT FILES JSON:
${JSON.stringify(currentFiles, null, 2)}

USER REQUEST:
"${prompt}"

INSTRUCTIONS:
1. Analyze the CURRENT FILES carefully.
2. Apply the user's request to these files.
3. Return the COMPLETE updated JSON object (all files, updated or unchanged).
4. Maintain the same file structure.
5. Do not remove existing files unless explicitly requested.
6. Follow all the original response format rules (raw JSON, no markdown, etc.).`;
    }

    // 🔥 STREAMING RESPONSE - Envia progresso EM TEMPO REAL
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // 1️⃣ Analisando
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'status', message: 'Analisando seu pedido...', emoji: '🔍' })}\n\n`));
          await new Promise(resolve => setTimeout(resolve, 400));

          // 2️⃣ Preparando
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'status', message: currentFiles ? 'Carregando arquivos existentes...' : 'Iniciando projeto do zero...', emoji: '📂' })}\n\n`));
          await new Promise(resolve => setTimeout(resolve, 300));

          // 3️⃣ Conectando
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'status', message: 'Conectando com DeepSeek AI...', emoji: '⚡' })}\n\n`));
          await new Promise(resolve => setTimeout(resolve, 200));

          // 4️⃣ Gerando - mostrar progresso
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'status', message: 'Velura está escrevendo o código...', emoji: '✍️' })}\n\n`));
          
          // Gerar código
          const content = await callDeepSeekAPI(userMessage);
          
          // 5️⃣ Processando
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'status', message: 'Extraindo arquivos do código...', emoji: '📦' })}\n\n`));
          await new Promise(resolve => setTimeout(resolve, 250));

          const files = parseCodeFiles(content);
          const fileNames = Object.keys(files);
          const fileCount = fileNames.length;

          // 6️⃣ Mostrando arquivos processados
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
            type: 'files_detected', 
            message: `${fileCount} arquivos detectados: ${fileNames.slice(0, 3).join(', ')}${fileCount > 3 ? '...' : ''}`,
            emoji: '📄',
            files: fileNames
          })}\n\n`));
          await new Promise(resolve => setTimeout(resolve, 300));

          // 7️⃣ Validando
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'status', message: 'Validando componentes React...', emoji: '✅' })}\n\n`));
          await new Promise(resolve => setTimeout(resolve, 200));

          // 8️⃣ Otimizando
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'status', message: 'Otimizando código...', emoji: '⚙️' })}\n\n`));
          await new Promise(resolve => setTimeout(resolve, 150));

          // 9️⃣ Finalizado
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
            type: 'complete', 
            files, 
            timestamp: Date.now(),
            summary: {
              totalFiles: fileCount,
              fileNames: fileNames,
              isUpdate: !!currentFiles
            }
          })}\n\n`));
          
          controller.close();
        } catch (error) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', error: error instanceof Error ? error.message : 'Unknown error' })}\n\n`));
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        "X-RateLimit-Limit": "10",
        "X-RateLimit-Remaining": remaining.toString(),
        "X-RateLimit-Reset": new Date(resetTime).toISOString(),
      },
    });
  } catch (error) {
    return createErrorResponse(error);
  }
}
