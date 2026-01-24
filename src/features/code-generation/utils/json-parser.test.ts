import { describe, it, expect } from "vitest";
import { parseCodeFiles } from "./json-parser";

describe("parseCodeFiles", () => {
  it("should parse valid JSON response", () => {
    const input = JSON.stringify({
      "src/App.tsx": "export default function App() {}",
      "src/index.css": "@tailwind base;",
    });

    const result = parseCodeFiles(input);

    expect(result).toEqual({
      "src/App.tsx": "export default function App() {}",
      "src/index.css": "@tailwind base;",
      "src/main.tsx": expect.stringContaining("ReactDOM.createRoot"),
    });
  });

  it("should clean markdown code blocks", () => {
    const input = "```json\n" + JSON.stringify({ "src/App.tsx": "code" }) + "\n```";

    const result = parseCodeFiles(input);

    expect(result["src/App.tsx"]).toBe("code");
  });

  it("should throw error for incomplete JSON that cannot be repaired", () => {
    const input = '{"src/App.tsx": "code';

    expect(() => parseCodeFiles(input)).toThrow("Failed to parse AI response as JSON");
  });

  it("should always include main.tsx if missing", () => {
    const input = JSON.stringify({
      "src/App.tsx": "export default function App() {}",
    });

    const result = parseCodeFiles(input);

    expect(result["src/main.tsx"]).toBeDefined();
    expect(result["src/main.tsx"]).toContain("ReactDOM.createRoot");
  });

  it("should throw error for invalid JSON", () => {
    const input = "not a json at all { invalid :::";

    expect(() => parseCodeFiles(input)).toThrow("Failed to parse AI response as JSON");
  });
});
