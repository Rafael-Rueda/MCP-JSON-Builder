import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface JsonValue {
    [key: string]: any;
}

export interface HistoryItem {
    id: string;
    data: JsonValue;
    timestamp: number;
    name?: string;
}

interface JsonEditorStore {
    jsonData: JsonValue;
    history: HistoryItem[];
    expandedNodes: string[];
    searchTerm: string;
    darkMode: boolean;

    setJsonData: (data: JsonValue) => void;
    addToHistory: (name?: string) => void;
    loadFromHistory: (id: string) => void;
    deleteFromHistory: (id: string) => void;

    toggleNode: (path: string) => void;
    setExpandedNodes: (nodes: string[]) => void;
    expandAll: () => void;
    collapseAll: () => void;

    setSearchTerm: (term: string) => void;
    toggleDarkMode: () => void;

    updateValueAtPath: (path: string[], value: any) => void;
    deleteAtPath: (path: string[]) => void;
    addFieldAtPath: (path: string[], key: string, value: any) => void;
}

// Função para coletar TODOS os paths que podem ser expandidos
function collectAllPaths(obj: any, currentPath: string[] = []): string[] {
    const paths: string[] = [];

    if (obj === null || typeof obj !== "object") {
        return paths;
    }

    // Para cada propriedade do objeto/array
    Object.keys(obj).forEach((key) => {
        const newPath = [...currentPath, key];
        const value = obj[key];

        // Se o valor é um objeto ou array com conteúdo, adiciona o path
        if (value !== null && typeof value === "object") {
            const hasContent = Array.isArray(value)
                ? value.length > 0
                : Object.keys(value).length > 0;

            if (hasContent) {
                // Adiciona o path string
                paths.push(newPath.join("."));

                // Recursivamente busca paths filhos
                const childPaths = collectAllPaths(value, newPath);
                paths.push(...childPaths);
            }
        }
    });

    return paths;
}

export const useJsonEditorStore = create<JsonEditorStore>()(
    persist(
        (set, get) => ({
            jsonData: {},
            history: [],
            expandedNodes: [],
            searchTerm: "",
            darkMode: false,

            setJsonData: (data) => set({ jsonData: data }),

            addToHistory: (name) =>
                set((state) => ({
                    history: [
                        ...state.history.slice(-9),
                        {
                            id: Date.now().toString(),
                            data: state.jsonData,
                            timestamp: Date.now(),
                            name,
                        },
                    ],
                })),

            loadFromHistory: (id) =>
                set((state) => {
                    const item = state.history.find((h) => h.id === id);
                    return item ? { jsonData: item.data } : {};
                }),

            deleteFromHistory: (id) =>
                set((state) => ({
                    history: state.history.filter((h) => h.id !== id),
                })),

            toggleNode: (path) =>
                set((state) => {
                    const newExpanded = [...state.expandedNodes];
                    const index = newExpanded.indexOf(path);

                    if (index > -1) {
                        // Remove se já está expandido
                        newExpanded.splice(index, 1);
                    } else {
                        // Adiciona se não está expandido
                        newExpanded.push(path);
                    }

                    // console.log(
                    //     "Toggle node:",
                    //     path,
                    //     "New expanded:",
                    //     newExpanded
                    // );

                    return { expandedNodes: newExpanded };
                }),

            setExpandedNodes: (nodes) => set({ expandedNodes: nodes }),

            expandAll: () => {
                const state = get();
                const allPaths = collectAllPaths(state.jsonData);
                const expandedWithRoot = ["", ...allPaths];
                //console.log("Expand all - collected paths:", allPaths);
                set({ expandedNodes: expandedWithRoot });
            },

            collapseAll: () => {
                //console.log("Collapse all");
                set({ expandedNodes: [] });
            },

            setSearchTerm: (term) => set({ searchTerm: term }),

            toggleDarkMode: () =>
                set((state) => ({ darkMode: !state.darkMode })),

            updateValueAtPath: (path, value) =>
                set((state) => {
                    const newData = JSON.parse(JSON.stringify(state.jsonData));
                    let current = newData;

                    for (let i = 0; i < path.length - 1; i++) {
                        current = current[path[i]];
                    }

                    if (path.length > 0) {
                        current[path[path.length - 1]] = value;
                    } else {
                        return { jsonData: value };
                    }

                    return { jsonData: newData };
                }),

            deleteAtPath: (path) =>
                set((state) => {
                    const newData = JSON.parse(JSON.stringify(state.jsonData));
                    let current = newData;

                    for (let i = 0; i < path.length - 1; i++) {
                        current = current[path[i]];
                    }

                    if (Array.isArray(current)) {
                        current.splice(Number(path[path.length - 1]), 1);
                    } else {
                        delete current[path[path.length - 1]];
                    }

                    return { jsonData: newData };
                }),

            addFieldAtPath: (path, key, value) =>
                set((state) => {
                    const newData = JSON.parse(JSON.stringify(state.jsonData));

                    if (path.length === 0) {
                        if (key) {
                            newData[key] = value;
                        }
                    } else {
                        let current = newData;
                        for (const p of path) {
                            current = current[p];
                        }

                        if (Array.isArray(current)) {
                            current.push(value);
                        } else if (
                            typeof current === "object" &&
                            current !== null
                        ) {
                            if (key) {
                                current[key] = value;
                            }
                        }
                    }

                    return { jsonData: newData };
                }),
        }),
        {
            name: "json-editor-storage",
            partialize: (state) => ({
                jsonData: state.jsonData,
                history: state.history,
                darkMode: state.darkMode,
                expandedNodes: state.expandedNodes,
            }),
        }
    )
);
