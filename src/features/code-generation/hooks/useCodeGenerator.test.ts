/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useCodeGenerator } from "./useCodeGenerator";

describe("useCodeGenerator", () => {
  it("should initialize with default state", () => {
    const { result } = renderHook(() => useCodeGenerator());

    expect(result.current.isGenerating).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.generatedFiles).toBeNull();
  });

  it("should reject empty prompts", async () => {
    const { result } = renderHook(() => useCodeGenerator());

    const files = await result.current.generateCode("");

    expect(files).toBeNull();
    expect(result.current.isGenerating).toBe(false);
  });
});
