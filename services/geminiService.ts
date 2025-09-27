
import { GoogleGenAI, Type } from "@google/genai";
import { GeminiResponse } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

function extractJson(text: string): string | null {
    const match = text.match(/```json\n([\s\S]*?)\n```/);
    return match ? match[1] : null;
}

export const generateApp = async (userPrompt: string): Promise<GeminiResponse> => {
    const model = 'gemini-2.5-flash';

    const masterPrompt = `
You are a world-class senior frontend React engineer with deep expertise in UI/UX design. Your primary goal is to generate a complete and functional React web application based on the user's request.

User's Request: "${userPrompt}"

You MUST generate a complete React web application using TypeScript, Tailwind CSS, and React 18.

Your entire response MUST be a single JSON object inside a \`\`\`json markdown block.
The JSON object must have two top-level keys: "previewHtml" and "files".

1.  **"previewHtml"**: A string containing a single, self-contained "index.html" file. This file is for instant preview and MUST:
    - Be a complete HTML5 document.
    - Include CDN script tags in the <head> for:
        - Tailwind CSS (v3): <script src="https://cdn.tailwindcss.com"></script>
        - React 18: <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
        - ReactDOM 18: <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
        - Babel Standalone: <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    - Contain a <div id="root"></div> in the <body>.
    - Have ALL JavaScript and React TSX code inside a SINGLE <script type="text/babel" data-type="module"> tag.
    - Inside this script, all components must be defined. Helper components must be defined before they are used by parent components to avoid reference errors.
    - DO NOT use import/export statements within this preview script tag. All code must be self-contained in that single script.
    - Ensure the final line of the script renders the App to the root div, e.g., \`const root = ReactDOM.createRoot(document.getElementById('root')); root.render(<App />);\`.

2.  **"files"**: An array of objects, where each object represents a file in a standard React project structure. This is for the code viewer.
    - Each object must have two keys: "path" (e.g., "index.html", "index.tsx", "App.tsx", "components/Button.tsx") and "content" (the full string content of the file).
    - This structure should include at a minimum: "index.html", "index.tsx", and "App.tsx".
    - The "index.html" here should be a standard project file, without inlined code.
    - The "index.tsx" file MUST use the React 18 'createRoot' API.
    - All .tsx files should use modern React with hooks and functional components, and include necessary imports.

Generate the application based on the user's request, following these instructions precisely.
`;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: masterPrompt,
            config: {
                temperature: 0.1,
                topP: 0.95,
            }
        });
        
        const rawText = response.text;
        const jsonString = extractJson(rawText);

        if (!jsonString) {
            console.error("Raw response from Gemini:", rawText);
            throw new Error("Failed to parse the response from the AI. The format was incorrect.");
        }

        const parsedResponse: GeminiResponse = JSON.parse(jsonString);

        if (!parsedResponse.previewHtml || !parsedResponse.files || parsedResponse.files.length === 0) {
            throw new Error("The AI response was missing required 'previewHtml' or 'files' data.");
        }

        return parsedResponse;
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error("There was a problem communicating with the AI service.");
    }
};
