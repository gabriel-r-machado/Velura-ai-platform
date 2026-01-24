import { Sandpack } from "@codesandbox/sandpack-react";
import { monokaiPro } from "@codesandbox/sandpack-themes";

interface IframePreviewProps {
  files: Record<string, string>;
}

export default function IframePreview({ files }: IframePreviewProps) {
  // 1. Verifica se temos o mínimo para rodar
  const hasEssentials = 
    files["index.html"] && 
    (files["src/main.tsx"] || files["src/index.tsx"]) && 
    files["src/App.tsx"];

  // Se não tiver os arquivos ainda, mostra Loading (sem erros no console)
  if (!hasEssentials) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center bg-[#1e1e1e] text-white/50 gap-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        <p className="text-sm font-mono animate-pulse">
          Gerando arquivos do projeto...
        </p>
      </div>
    );
  }

  // 2. TRUQUE DE MESTRE: Normaliza os arquivos para o Sandpack
  // O Sandpack precisa que os arquivos comecem com "/" para sobrescrever o template
  // FILTRAR arquivos de configuração que causam conflito com Sandpack
  const configFilesToSkip = [
    'postcss.config.js',
    'tailwind.config.ts',
    'tailwind.config.js',
    'vite.config.ts',
    'vite.config.js',
    'tsconfig.json',
    'package.json'
  ];
  
  const sandpackFiles = Object.keys(files)
    .filter(fileName => !configFilesToSkip.includes(fileName))
    .reduce((acc, fileName) => {
      const formattedName = fileName.startsWith("/") ? fileName : `/${fileName}`;
      const content = files[fileName];
      if (content !== undefined) {
        acc[formattedName] = content;
      }
      return acc;
    }, {} as Record<string, string>);

  return (
    <div className="h-full w-full">
      <Sandpack
        // Usamos 'vite-react-ts' pois sua IA gera vite.config.ts
        template="vite-react-ts"
        theme={monokaiPro}
        files={sandpackFiles}
        options={{
          showNavigator: true, // Mostra a barra de URL fake
          showTabs: false,     // Esconde as abas de código
          showConsole: true,   // Útil para ver erros de runtime
          externalResources: ["https://cdn.tailwindcss.com"], // Tailwind CDN
          activeFile: "/src/App.tsx", // Força abrir neste arquivo
          editorHeight: "100vh", 
        }}
        customSetup={{
          dependencies: {
            "react": "^18.2.0",
            "react-dom": "^18.2.0",
            "lucide-react": "latest",
            "framer-motion": "latest",
            "clsx": "latest",
            "tailwind-merge": "latest"
          },
        }}
      />
    </div>
  );
}
