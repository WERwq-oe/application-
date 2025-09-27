
import React, { useState, useCallback } from 'react';
import { PromptPanel } from './components/PromptPanel';
import { PreviewView } from './components/PreviewView';
import { CodeView } from './components/CodeView';
import { generateApp } from './services/geminiService';
import { GeneratedFile } from './types';

// --- Helper Components defined outside to prevent re-renders ---

const Header: React.FC = () => (
  <header className="bg-slate-900/80 backdrop-blur-sm border-b border-slate-700 p-3 flex items-center gap-3">
    <div className="w-8 h-8 bg-gradient-to-br from-sky-400 to-blue-600 rounded-lg flex items-center justify-center">
       <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white">
          <path d="M12.378 1.602a.75.75 0 0 0-.756 0L3.366 6.352a.75.75 0 0 0-.366.648v9c0 .28.145.54.384.685l8.25 4.87a.75.75 0 0 0 .764 0l8.25-4.87a.75.75 0 0 0 .384-.685v-9a.75.75 0 0 0-.366-.648L12.378 1.602ZM12 16.5a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9Z" />
        </svg>
    </div>
    <h1 className="text-xl font-bold text-slate-200">Gemini App Studio</h1>
  </header>
);

const Loader: React.FC = () => (
    <div className="absolute inset-0 bg-slate-800/50 backdrop-blur-sm flex flex-col items-center justify-center z-20">
        <svg className="animate-spin h-12 w-12 text-sky-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="mt-4 text-slate-300 font-medium">Building your app...</p>
    </div>
);

const DEFAULT_PROMPT = `Create a simple counter application. It should have a number display, an "Increment" button, and a "Decrement" button. The counter should not go below zero. Style it with a clean, modern dark theme.`;

const App: React.FC = () => {
    const [prompt, setPrompt] = useState<string>(DEFAULT_PROMPT);
    const [previewHtml, setPreviewHtml] = useState<string>('');
    const [files, setFiles] = useState<GeneratedFile[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');
    const [activeFile, setActiveFile] = useState<string>('index.html');

    const handleGenerate = useCallback(async () => {
        if (!prompt || isLoading) return;
        
        setIsLoading(true);
        setError(null);
        setPreviewHtml('');
        setFiles([]);

        try {
            const { previewHtml, files } = await generateApp(prompt);
            setPreviewHtml(previewHtml);
            setFiles(files);
            // Default to showing index.html or App.tsx in code view
            const defaultFile = files.find(f => f.path === 'App.tsx') || files.find(f => f.path === 'index.html') || files[0];
            if (defaultFile) {
                setActiveFile(defaultFile.path);
            }
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [prompt, isLoading]);

    return (
        <div className="h-screen w-screen flex flex-col antialiased">
            <Header />
            <div className="flex flex-1 overflow-hidden">
                <PromptPanel 
                    prompt={prompt} 
                    setPrompt={setPrompt} 
                    onGenerate={handleGenerate}
                    isLoading={isLoading} 
                />
                <main className="flex-1 flex flex-col bg-slate-800">
                    <div className="flex-shrink-0 border-b border-slate-700 bg-slate-900 flex items-center justify-between px-4">
                         <div className="flex items-center">
                            <TabButton isActive={activeTab === 'preview'} onClick={() => setActiveTab('preview')}>Preview</TabButton>
                            <TabButton isActive={activeTab === 'code'} onClick={() => setActiveTab('code')}>Code</TabButton>
                         </div>
                    </div>
                    <div className="flex-1 relative overflow-auto">
                        {isLoading && <Loader />}
                        {error && (
                            <div className="p-4 m-4 bg-red-900/50 border border-red-700 rounded-lg text-red-300">
                                <p className="font-bold">Generation Failed</p>
                                <p className="mt-1 text-sm">{error}</p>
                            </div>
                        )}
                        
                        {!isLoading && !error && !previewHtml && (
                            <div className="flex flex-col items-center justify-center h-full text-slate-500">
                               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="m6.75 7.5 3 2.25-3 2.25m4.5 0h3m-9.75 6.75h16.5c.621 0 1.125-.504 1.125-1.125V6.625c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v10.25c0 .621.504 1.125 1.125 1.125Z" />
                                </svg>
                                <h2 className="mt-4 text-xl font-semibold">Welcome to the App Studio</h2>
                                <p className="mt-1">Describe your app and click "Generate App" to begin.</p>
                                <button
                                    onClick={handleGenerate}
                                    className="mt-6 bg-sky-600 hover:bg-sky-500 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
                                >
                                    Generate Example App
                                </button>
                            </div>
                        )}

                        <div className={`${activeTab === 'preview' ? 'block' : 'hidden'} h-full`}>
                           {previewHtml && <PreviewView html={previewHtml} />}
                        </div>
                         <div className={`${activeTab === 'code' ? 'block' : 'hidden'} h-full`}>
                           {files.length > 0 && <CodeView files={files} activeFile={activeFile} onFileSelect={setActiveFile} />}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

interface TabButtonProps {
    isActive: boolean;
    onClick: () => void;
    children: React.ReactNode;
}

const TabButton: React.FC<TabButtonProps> = ({ isActive, onClick, children }) => {
    return (
        <button
            onClick={onClick}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors duration-200 ${
                isActive
                    ? 'border-sky-500 text-sky-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
        >
            {children}
        </button>
    );
}

export default App;
