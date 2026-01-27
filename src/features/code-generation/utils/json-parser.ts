import { APIError } from "@/shared/lib/errors";

/**
 * BULLETPROOF JSON SANITIZER
 * Removes markdown, explanations, and extracts pure JSON from LLM responses
 */
function sanitizeAIResponse(text: string): string {

  
  let clean = text.trim();
  
  // Step 1: Remove markdown code blocks
  clean = clean.replace(/^```(?:json|javascript|js|tsx|ts)?\s*\n?/i, '');
  clean = clean.replace(/\n?```\s*$/i, '');
  
  // Step 2: Remove common explanations/preambles
  const jsonStartPatterns = [
    /^Here's the.*?:\s*/i,
    /^Here is the.*?:\s*/i,
    /^Sure.*?:\s*/i,
    /^Certainly.*?:\s*/i,
    /^Of course.*?:\s*/i,
    /^I've created.*?:\s*/i,
    /^I've generated.*?:\s*/i,
    /^Below is.*?:\s*/i,
  ];
  
  for (const pattern of jsonStartPatterns) {
    clean = clean.replace(pattern, '');
  }
  
  // Step 3: Extract JSON by finding first { and last }
  const firstBrace = clean.indexOf('{');
  const lastBrace = clean.lastIndexOf('}');
  
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    clean = clean.substring(firstBrace, lastBrace + 1);

  }
  
  // Step 4: Remove any trailing text after the final }
  const finalBraceIndex = clean.lastIndexOf('}');
  if (finalBraceIndex !== -1) {
    clean = clean.substring(0, finalBraceIndex + 1);
  }
  
  // Step 5: Validate it starts and ends correctly
  if (!clean.startsWith('{')) {
    throw new APIError('Sanitized response does not start with {');
  }
  if (!clean.endsWith('}')) {
    throw new APIError('Sanitized response does not end with }');
  }
  



  
  return clean;
}

// Essential file templates that MUST exist for Vite to work with Tailwind CDN
const ESSENTIAL_FILES = {
  "index.html": `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Landing Page</title>
    <script src="https://cdn.tailwindcss.com"></script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`,

  "src/main.tsx": `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)`,

  "vite.config.ts": `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})`,

  "tsconfig.json": `{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}`,

  "tailwind.config.js": `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}`,

  "postcss.config.js": `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`
};

function tryRepairJson(jsonString: string): string {
  let fixed = jsonString.trim();
  
  if (!fixed.endsWith("}") && !fixed.endsWith("]")) {
    if (!fixed.endsWith('"')) {
      fixed += '"';
    }
    fixed += '"}';
  }
  
  return fixed;
}

export function parseCodeFiles(content: string): Record<string, string> {



  
  // STEP 1: Sanitize the AI response
  const sanitized = sanitizeAIResponse(content);
  
  try {
    const parsed = JSON.parse(sanitized) as Record<string, string>;

    
    // Remove index.css if it exists (not needed - we use Tailwind CDN)
    if (parsed["src/index.css"]) {

      delete parsed["src/index.css"];
    }
    
    // Ensure all essential files exist
    const finalFiles = ensureEssentialFiles(parsed);
    


    
    return finalFiles;
  } catch {


    
    // Last attempt: try to repair JSON
    try {
      const repaired = tryRepairJson(sanitized);
      const parsed = JSON.parse(repaired) as Record<string, string>;

      
      if (parsed["src/index.css"]) {
        delete parsed["src/index.css"];
      }
      
      return ensureEssentialFiles(parsed);
    } catch {

      throw new APIError("Failed to parse AI response. The AI may have returned invalid JSON format. Please try again.");
    }
  }
}

function ensureEssentialFiles(files: Record<string, string>): Record<string, string> {
  const result = { ...files };
  
  // Add missing essential files
  for (const [filename, template] of Object.entries(ESSENTIAL_FILES)) {
    if (!result[filename]) {

      result[filename] = template;
    }
  }
  
  // Ensure we have at least a basic App.tsx
  if (!result["src/App.tsx"]) {

    result["src/App.tsx"] = `export default function App() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="text-center text-white">
        <h1 className="text-6xl font-bold mb-4">Welcome</h1>
        <p className="text-xl">Your app is running!</p>
      </div>
    </div>
  );
}`;
  }
  
  return result;
}
