/**
 * Code Generation Feature
 * 
 * Provides AI-powered code generation using DeepSeek API.
 * Includes hooks, services, and types for generating landing pages.
 * 
 * @example
 * ```tsx
 * import { useCodeGenerator } from '@/features/code-generation';
 * 
 * function MyComponent() {
 *   const { generateCode, isGenerating } = useCodeGenerator();
 *   // Use the hook...
 * }
 * ```
 */

export { useCodeGenerator } from "./hooks/useCodeGenerator";
export { CodeGenerationService } from "./services/code-generation.service";
export type { GenerateCodeRequest, GenerateCodeResponse } from "./schemas";
