
export interface GeneratedFile {
    path: string;
    content: string;
}

export interface GeminiResponse {
    previewHtml: string;
    files: GeneratedFile[];
}
