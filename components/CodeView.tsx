
import React, { useMemo } from 'react';
import { GeneratedFile } from '../types';

interface CodeViewProps {
    files: GeneratedFile[];
    activeFile: string;
    onFileSelect: (path: string) => void;
}

const FileIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
    </svg>
);


export const CodeView: React.FC<CodeViewProps> = ({ files, activeFile, onFileSelect }) => {
    const activeFileContent = useMemo(() => {
        return files.find(f => f.path === activeFile)?.content || 'Select a file to view its content.';
    }, [files, activeFile]);

    return (
        <div className="flex h-full bg-slate-900 text-slate-300">
            <div className="w-64 flex-shrink-0 border-r border-slate-700 overflow-y-auto">
                <h3 className="text-sm font-semibold p-3 border-b border-slate-700 text-slate-400">Files</h3>
                <ul>
                    {files.map(file => (
                        <li key={file.path}>
                            <button
                                onClick={() => onFileSelect(file.path)}
                                className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 ${
                                    activeFile === file.path ? 'bg-sky-900/50 text-sky-300' : 'hover:bg-slate-800'
                                }`}
                            >
                                <FileIcon className="w-4 h-4 text-slate-500" />
                                {file.path}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="flex-1 overflow-auto">
                <pre className="p-4 text-sm font-mono whitespace-pre-wrap break-words h-full">
                    <code>
                        {activeFileContent}
                    </code>
                </pre>
            </div>
        </div>
    );
};
