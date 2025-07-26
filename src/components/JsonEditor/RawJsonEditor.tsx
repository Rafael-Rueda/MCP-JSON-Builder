// components/RawJsonEditor.tsx
import { useState, useMemo, useEffect } from "react";
import Editor from "react-simple-code-editor";
import { highlight, languages } from "prismjs";
import "prismjs/components/prism-json";
import "prismjs/themes/prism-tomorrow.css"; // Tema escuro
import { useJsonEditorStore } from "@/store/json-editor-store";

export function RawJsonEditor() {
    const { jsonData, setJsonData, searchTerm, darkMode } =
        useJsonEditorStore();

    const [code, setCode] = useState(JSON.stringify(jsonData, null, 2));
    const [error, setError] = useState<string | null>(null);

    // Sincroniza o editor quando jsonData muda (ex: ao carregar do histórico)
    useEffect(() => {
        setCode(JSON.stringify(jsonData, null, 2));
        setError(null);
    }, [jsonData]);

    const handleChange = (newCode: string) => {
        setCode(newCode);
        try {
            const parsed = JSON.parse(newCode);
            setError(null);
            setJsonData(parsed);
        } catch (e: any) {
            setError(e.message);
        }
    };

    const highlightedCode = useMemo(() => {
        const raw = highlight(code, languages.json, "json");
        if (!searchTerm) return raw;

        const safeTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const regex = new RegExp(safeTerm, "gi");

        return raw.replace(regex, (match) => {
            return `<mark class="bg-yellow-300 dark:bg-yellow-600 text-black dark:text-white rounded px-0.5">${match}</mark>`;
        });
    }, [code, searchTerm]);

    // Estilos customizados baseados no tema
    const editorStyles = darkMode
        ? {
              backgroundColor: "hsl(var(--muted))",
              color: "hsl(var(--foreground))",
          }
        : {
              backgroundColor: "hsl(var(--muted))",
              color: "hsl(var(--foreground))",
          };

    return (
        <div className="space-y-2">
            <style>{`
                .token.property {
                    color: ${darkMode ? "#9cdcfe" : "#0451a5"};
                }
                .token.string {
                    color: ${darkMode ? "#ce9178" : "#a31515"};
                }
                .token.number {
                    color: ${darkMode ? "#b5cea8" : "#098658"};
                }
                .token.boolean {
                    color: ${darkMode ? "#569cd6" : "#0000ff"};
                }
                .token.null {
                    color: ${darkMode ? "#569cd6" : "#0000ff"};
                }
                .token.punctuation {
                    color: ${darkMode ? "#d4d4d4" : "#000000"};
                }
                .token.operator {
                    color: ${darkMode ? "#d4d4d4" : "#000000"};
                }
            `}</style>

            <Editor
                value={code}
                onValueChange={handleChange}
                highlight={() => highlightedCode}
                padding={16}
                className="font-mono text-sm border rounded-md"
                style={{
                    fontFamily:
                        '"Fira Code", "Fira Mono", "Consolas", monospace',
                    minHeight: "400px",
                    whiteSpace: "pre",
                    overflow: "auto",
                    ...editorStyles,
                }}
            />
            {error && (
                <p className="text-sm text-destructive font-mono bg-destructive/10 p-2 rounded">
                    Error: {error}
                </p>
            )}
        </div>
    );
}
