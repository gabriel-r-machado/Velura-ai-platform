/**
 * @deprecated Use CodeGenerationService from @/features/code-generation instead
 * This file is kept for backwards compatibility only
 */

export async function generateLandingPage(prompt: string): Promise<Record<string, string>> {
  const response = await fetch("/api/generate-code", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    throw new Error("Failed to generate code");
  }

  const data = await response.json();
  return data.files;
}
