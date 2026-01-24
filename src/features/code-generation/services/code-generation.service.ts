import type { GenerateCodeRequest, GenerateCodeResponse } from "@/features/code-generation/schemas";
import { APIError } from "@/shared/lib/errors";

export class CodeGenerationService {
  private static readonly API_URL = "/api/generate-code";

  static async generateCode(prompt: string, currentFiles?: Record<string, string>): Promise<Record<string, string>> {
    const requestBody: GenerateCodeRequest = { prompt, currentFiles };

    const response = await fetch(this.API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new APIError(
        errorData.error?.message || "Failed to generate code",
        response.status
      );
    }

    const data = (await response.json()) as GenerateCodeResponse;
    return data.files;
  }
}
