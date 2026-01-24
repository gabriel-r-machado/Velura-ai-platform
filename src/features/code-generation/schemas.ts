import { z } from "zod";

export const generateCodeRequestSchema = z.object({
  prompt: z.string().min(10, "Prompt must be at least 10 characters").max(5000, "Prompt too long"),
  currentFiles: z.record(z.string(), z.string()).optional(),
});

export const generateCodeResponseSchema = z.object({
  files: z.record(z.string(), z.string()),
  timestamp: z.number(),
});

export type GenerateCodeRequest = z.infer<typeof generateCodeRequestSchema>;
export type GenerateCodeResponse = z.infer<typeof generateCodeResponseSchema>;
