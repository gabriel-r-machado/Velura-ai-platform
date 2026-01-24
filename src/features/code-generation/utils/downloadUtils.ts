import JSZip from 'jszip';

const DEFAULT_PACKAGE_JSON = `{
  "name": "velura-generated-project",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "lucide-react": "^0.462.0",
    "framer-motion": "^12.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.1",
    "autoprefixer": "^10.4.19",
    "postcss": "^8.4.38",
    "tailwindcss": "^3.4.4",
    "typescript": "^5.2.2",
    "vite": "^5.3.1"
  }
}`;

const DEFAULT_VITE_CONFIG = `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})`;

const DEFAULT_TSCONFIG = `{
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
}`;

const DEFAULT_TSCONFIG_NODE = `{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "strict": true
  },
  "include": ["vite.config.ts"]
}`;

const DEFAULT_INDEX_HTML = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Velura Generated Project</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`;

const DEFAULT_MAIN_TSX = `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)`;

const DEFAULT_INDEX_CSS = `@tailwind base;
@tailwind components;
@tailwind utilities;

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: system-ui, -apple-system, sans-serif;
}`;

const DEFAULT_TAILWIND_CONFIG = `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}`;

const DEFAULT_POSTCSS_CONFIG = `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`;

const DEFAULT_GITIGNORE = `# Logs
logs
*.log
npm-debug.log*

# Dependencies
node_modules
.pnp
.pnp.js

# Build
dist
dist-ssr
*.local

# Editor
.vscode/*
!.vscode/extensions.json
.idea

# OS
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?`;

const DEFAULT_VITE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" class="iconify iconify--logos" width="31.88" height="32" preserveAspectRatio="xMidYMid meet" viewBox="0 0 256 257"><defs><linearGradient id="IconifyId1813088fe1fbc01fb466" x1="-.828%" x2="57.636%" y1="7.652%" y2="78.411%"><stop offset="0%" stop-color="#41D1FF"></stop><stop offset="100%" stop-color="#BD34FE"></stop></linearGradient><linearGradient id="IconifyId1813088fe1fbc01fb467" x1="43.376%" x2="50.316%" y1="2.242%" y2="89.03%"><stop offset="0%" stop-color="#FFBD4F"></stop><stop offset="100%" stop-color="#FF980E"></stop></linearGradient></defs><path fill="url(#IconifyId1813088fe1fbc01fb466)" d="M255.153 37.938L134.897 252.976c-2.483 4.44-8.862 4.466-11.382.048L.875 37.958c-2.746-4.814 1.371-10.646 6.827-9.67l120.385 21.517a6.537 6.537 0 0 0 2.322-.004l117.867-21.483c5.438-.991 9.574 4.796 6.877 9.62Z"></path><path fill="url(#IconifyId1813088fe1fbc01fb467)" d="M185.432.063L96.44 17.501a3.268 3.268 0 0 0-2.634 3.014l-5.474 92.456a3.268 3.268 0 0 0 3.997 3.378l24.777-5.718c2.318-.535 4.413 1.507 3.936 3.838l-7.361 36.047c-.495 2.426 1.782 4.5 4.151 3.78l15.304-4.649c2.372-.72 4.652 1.36 4.15 3.788l-11.698 56.621c-.732 3.542 3.979 5.473 5.943 2.437l1.313-2.028l72.516-144.72c1.215-2.423-.88-5.186-3.54-4.672l-25.505 4.922c-2.396.462-4.435-1.77-3.759-4.114l16.646-57.705c.677-2.35-1.37-4.583-3.769-4.113Z"></path></svg>`;

export async function downloadProjectAsZip(
  files: Record<string, string>,
  projectName: string = 'velura-project'
): Promise<void> {
  const zip = new JSZip();

  // Normalize and add generated files
  Object.entries(files).forEach(([path, content]) => {
    // Remove leading slash if present
    let normalizedPath = path.startsWith('/') ? path.slice(1) : path;
    
    // If the file doesn't have a src/ prefix and is a component/tsx file, add it
    if (
      !normalizedPath.startsWith('src/') &&
      !normalizedPath.startsWith('public/') &&
      !['package.json', 'vite.config.ts', 'tsconfig.json', 'index.html', 'tailwind.config.js', 'postcss.config.js', '.gitignore'].includes(normalizedPath)
    ) {
      // Check if it's a component file
      if (normalizedPath.includes('/') || normalizedPath.endsWith('.tsx') || normalizedPath.endsWith('.ts') || normalizedPath.endsWith('.css')) {
        // Handle component paths like /components/Header.tsx
        if (normalizedPath.startsWith('components/')) {
          normalizedPath = `src/${normalizedPath}`;
        } else if (normalizedPath === 'App.tsx' || normalizedPath === 'App.js') {
          normalizedPath = `src/${normalizedPath}`;
        } else if (normalizedPath === 'index.css' || normalizedPath === 'styles.css') {
          normalizedPath = `src/${normalizedPath}`;
        } else {
          normalizedPath = `src/${normalizedPath}`;
        }
      }
    }

    zip.file(normalizedPath, content);
  });

  // Add essential files if not present
  const hasFile = (pattern: string | RegExp) => {
    return Object.keys(files).some((path) => {
      const normalized = path.startsWith('/') ? path.slice(1) : path;
      if (typeof pattern === 'string') {
        return normalized === pattern || normalized === `src/${pattern}`;
      }
      return pattern.test(normalized);
    });
  };

  // Package.json
  if (!hasFile('package.json')) {
    zip.file('package.json', DEFAULT_PACKAGE_JSON);
  }

  // Vite config
  if (!hasFile('vite.config.ts') && !hasFile('vite.config.js')) {
    zip.file('vite.config.ts', DEFAULT_VITE_CONFIG);
  }

  // TypeScript configs
  if (!hasFile('tsconfig.json')) {
    zip.file('tsconfig.json', DEFAULT_TSCONFIG);
    zip.file('tsconfig.node.json', DEFAULT_TSCONFIG_NODE);
  }

  // index.html
  if (!hasFile('index.html')) {
    zip.file('index.html', DEFAULT_INDEX_HTML);
  }

  // main.tsx entry point
  if (!hasFile(/main\.(tsx?|jsx?)$/)) {
    zip.file('src/main.tsx', DEFAULT_MAIN_TSX);
  }

  // index.css (if not already in files)
  if (!hasFile(/index\.css$/) && !hasFile(/styles\.css$/)) {
    zip.file('src/index.css', DEFAULT_INDEX_CSS);
  }

  // Tailwind config
  if (!hasFile('tailwind.config.js') && !hasFile('tailwind.config.ts')) {
    zip.file('tailwind.config.js', DEFAULT_TAILWIND_CONFIG);
  }

  // PostCSS config
  if (!hasFile('postcss.config.js') && !hasFile('postcss.config.cjs')) {
    zip.file('postcss.config.js', DEFAULT_POSTCSS_CONFIG);
  }

  // .gitignore
  if (!hasFile('.gitignore')) {
    zip.file('.gitignore', DEFAULT_GITIGNORE);
  }

  // Vite SVG
  zip.file('public/vite.svg', DEFAULT_VITE_SVG);

  // Generate and download
  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${projectName}.zip`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
