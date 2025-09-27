
import React from 'react';

interface PreviewViewProps {
    html: string;
}

export const PreviewView: React.FC<PreviewViewProps> = ({ html }) => {
    return (
        <iframe
            srcDoc={html}
            title="App Preview"
            sandbox="allow-scripts allow-modals"
            className="w-full h-full border-0 bg-white"
        />
    );
};
