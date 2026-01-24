"use client";

import { FileIcon } from "lucide-react";

interface FileTreeProps {
  files: Record<string, string>;
  onSelectFile: (fileName: string) => void;
  selectedFile: string | null;
}

export function FileTree({ files, onSelectFile, selectedFile }: FileTreeProps) {
  // Ordena os arquivos: index.html primeiro, depois src/main.tsx, App.tsx, depois componentes
  const fileList = Object.keys(files).sort((a, b) => {
    if (a === "index.html") return -1;
    if (b === "index.html") return 1;
    if (a === "src/main.tsx") return -1;
    if (b === "src/main.tsx") return 1;
    if (a === "src/App.tsx") return -1;
    if (b === "src/App.tsx") return 1;
    return a.localeCompare(b);
  });

  return (
    <div className="flex flex-col gap-1 p-2 bg-gray-950 rounded-lg border border-gray-800 h-full overflow-y-auto">
      <div className="sticky top-0 bg-gray-950 pb-2 mb-2 border-b border-gray-800">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
          Project Files
        </h3>
        <p className="text-xs text-gray-600 mt-1">
          {fileList.length} files generated
        </p>
      </div>
      
      {fileList.map((fileName) => (
        <button
          key={fileName}
          onClick={() => onSelectFile(fileName)}
          className={`flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-all ${
            selectedFile === fileName
              ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
              : "text-gray-400 hover:bg-white/5 hover:text-gray-300"
          }`}
        >
          <FileIcon size={14} className="flex-shrink-0" />
          <span className="truncate text-left flex-1">{fileName}</span>
        </button>
      ))}
    </div>
  );
}
