import React, { useState } from 'react';
import {
  FolderTree,
  FileCode,
  Copy,
  Check,
  Download,
  ExternalLink,
  Code
} from 'lucide-react';
import { MONOREPO_FILES, MonorepoFile } from '../data/monorepoFiles';

export const MonorepoExplorerView: React.FC<{
  initialSelectedPath?: string;
}> = ({ initialSelectedPath }) => {
  const [selectedPath, setSelectedPath] = useState<string>(
    initialSelectedPath || MONOREPO_FILES[0].path
  );
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [copiedCode, setCopiedCode] = useState(false);

  const categories = ['All', 'Frontend', 'Backend', 'Infra', 'CI/CD', 'Config', 'Docs'];

  const filteredFiles = MONOREPO_FILES.filter((f) =>
    activeCategory === 'All' ? true : f.category === activeCategory
  );

  const selectedFile: MonorepoFile =
    MONOREPO_FILES.find((f) => f.path === selectedPath) || MONOREPO_FILES[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([selectedFile.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = selectedFile.path.split('/').pop() || 'file.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const lines = selectedFile.content.split('\n');

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-white">Monorepo Codebase Explorer</h2>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-blue-950/60 text-blue-400 border border-blue-800/40">
              cerebrocentral.com
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Browse the source code for Next.js 15, Python FastAPI Workers, D1 SQL schema, and CI/CD automation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const bundle = MONOREPO_FILES.filter((f) => f.fileNumber)
                .map((f) => `### Arquivo ${f.fileNumber}: \`${f.path}\`\n\n\`\`\`${f.language}\n${f.content}\n\`\`\`\n`)
                .join('\n---\n\n');
              navigator.clipboard.writeText(bundle);
              setCopiedCode(true);
              setTimeout(() => setCopiedCode(false), 2000);
            }}
            className="px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white text-xs font-medium rounded-md flex items-center gap-1.5 transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Copiar 15 Arquivos Base</span>
          </button>
          <button
            onClick={handleDownload}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium rounded-md flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Arquivo</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: File Tree Directory */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
          {/* Category Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-2.5 py-1 rounded text-xs whitespace-nowrap transition-colors ${
                  activeCategory === cat
                    ? 'bg-slate-800 text-orange-400 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* File List */}
          <div className="space-y-1.5 max-h-[560px] overflow-y-auto pr-1">
            {filteredFiles.map((file) => {
              const isSelected = selectedFile.path === file.path;
              return (
                <button
                  key={file.path}
                  onClick={() => setSelectedPath(file.path)}
                  className={`w-full p-2.5 rounded-lg text-left text-xs transition-colors border flex items-center justify-between ${
                    isSelected
                      ? 'bg-slate-800 border-orange-500/80 shadow-xs'
                      : 'bg-slate-950/40 border-slate-800/80 hover:bg-slate-800/40 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    {file.fileNumber ? (
                      <span className="w-5 h-5 rounded-md bg-orange-950/80 text-orange-400 border border-orange-800/60 flex items-center justify-center font-mono text-[10px] font-bold shrink-0">
                        {file.fileNumber}
                      </span>
                    ) : (
                      <FileCode
                        className={`w-4 h-4 shrink-0 ${
                          isSelected ? 'text-orange-400' : 'text-slate-500'
                        }`}
                      />
                    )}
                    <span className="font-mono text-slate-200 truncate">{file.path}</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 uppercase ml-2 shrink-0">
                    {file.language}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Code Viewer */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-start justify-between pb-3 border-b border-slate-800 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-semibold text-sm text-white">
                  {selectedFile.path}
                </span>
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                  {selectedFile.category}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">{selectedFile.description}</p>
            </div>

            <button
              onClick={handleCopy}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium rounded-md flex items-center gap-1.5 transition-colors shrink-0"
            >
              {copiedCode ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>

          {/* Code Viewer with Line Numbers */}
          <div className="border border-slate-800 rounded-lg bg-slate-950 overflow-hidden">
            <div className="max-h-[500px] overflow-y-auto overflow-x-auto text-xs font-mono leading-relaxed p-4 divide-y divide-transparent">
              {lines.map((line, idx) => (
                <div key={idx} className="flex hover:bg-slate-900/40">
                  <span className="w-10 select-none text-slate-600 text-right pr-4 shrink-0 tabular-nums">
                    {idx + 1}
                  </span>
                  <span className="text-slate-200 whitespace-pre">{line}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
