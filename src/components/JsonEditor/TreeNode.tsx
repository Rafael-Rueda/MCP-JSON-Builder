import React, { useMemo, useEffect, useState } from "react";
import {
    ChevronRight,
    ChevronDown,
    Edit2,
    Plus,
    Trash2,
    Copy,
    Check,
} from "lucide-react";
import { useJsonEditorStore } from "@/store/json-editor-store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { type TreeNodeProps } from "@/types";
import { toast } from "sonner";

// Função auxiliar movida para fora do componente
function matchesSearchRecursive(
    data: any,
    path: string[],
    searchLower: string
): boolean {
    if (!searchLower) return true;

    const keyMatch = path[path.length - 1]
        ?.toString()
        .toLowerCase()
        .includes(searchLower);
    if (keyMatch) return true;

    if (data === null || typeof data !== "object") {
        return data?.toString().toLowerCase().includes(searchLower);
    }

    const entries = Array.isArray(data)
        ? data.map((v, i) => [i.toString(), v])
        : Object.entries(data);

    return entries.some(([key, value]) => {
        return matchesSearchRecursive(value, [...path, key], searchLower);
    });
}

const CopyButton = ({ data }: { data: any }) => {
    const [copied, setCopied] = useState(false);

    const handleCopyClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Previne que o clique propague

        const text = JSON.stringify(data, null, 2);

        // Método simples e confiável
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.setAttribute("readonly", "");
        textarea.style.position = "absolute";
        textarea.style.left = "-9999px";
        document.body.appendChild(textarea);

        // Seleciona o texto
        const selected =
            document.getSelection()!.rangeCount > 0
                ? document.getSelection()!.getRangeAt(0)
                : false;

        textarea.select();

        let success = false;
        try {
            success = document.execCommand("copy");
        } catch (err) {
            console.error("Copy error:", err);
        }

        document.body.removeChild(textarea);

        if (selected) {
            document.getSelection()!.removeAllRanges();
            document.getSelection()!.addRange(selected);
        }

        if (success) {
            setCopied(true);
            toast.success("Copied!");
            setTimeout(() => setCopied(false), 2000);
        } else {
            // Fallback: mostra o modal
            window.dispatchEvent(
                new CustomEvent("show-copy-modal", { detail: { text } })
            );
        }
    };

    return (
        <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 opacity-0 group-hover:opacity-100"
            onClick={handleCopyClick}
            title="Copy this value"
        >
            {copied ? (
                <Check className="h-3 w-3 text-green-500" />
            ) : (
                <Copy className="h-3 w-3" />
            )}
        </Button>
    );
};

// Removendo o memo temporariamente para garantir re-renders
export const TreeNode = ({ data, path, searchTerm = "" }: TreeNodeProps) => {
    const expandedNodes = useJsonEditorStore((state) => state.expandedNodes);
    const toggleNode = useJsonEditorStore((state) => state.toggleNode);
    const deleteAtPath = useJsonEditorStore((state) => state.deleteAtPath);

    const pathStr = path.join(".");

    // Força re-render quando expandedNodes muda
    const [, forceUpdate] = React.useReducer((x) => x + 1, 0);

    useEffect(() => {
        forceUpdate();
    }, [expandedNodes]);

    const isExpanded = expandedNodes.includes(pathStr);

    const isObject =
        data !== null && typeof data === "object" && !Array.isArray(data);
    const isArray = Array.isArray(data);
    const isPrimitive = !isObject && !isArray;

    const entries = useMemo(() => {
        if (!isObject && !isArray) return [];
        return isArray
            ? data.map((v, i) => [i.toString(), v] as const)
            : Object.entries(data);
    }, [data, isObject, isArray]);

    // Verifica se este nó ou seus filhos correspondem à busca
    const matchesSearch = useMemo(() => {
        return matchesSearchRecursive(data, path, searchTerm.toLowerCase());
    }, [data, path, searchTerm]);

    // Se não corresponde à busca, não renderiza
    if (searchTerm && !matchesSearch) return null;

    const handleCopy = () => {
        const text = JSON.stringify(data, null, 2);

        // Cria um elemento textarea invisível
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "absolute";
        textarea.style.left = "-9999px";
        textarea.style.top = "0";
        document.body.appendChild(textarea);

        // Seleciona e copia o texto
        textarea.select();
        textarea.setSelectionRange(0, 99999); // Para mobile

        try {
            const successful = document.execCommand("copy");
            if (successful) {
                toast.success("Copied to clipboard");
            } else {
                // Se falhar, usa o modal como fallback
                showCopyModal(text);
            }
        } catch (err) {
            console.error("Copy failed:", err);
            // Se falhar, usa o modal como fallback
            showCopyModal(text);
        }

        // Remove o textarea
        document.body.removeChild(textarea);
    };

    // Função auxiliar para mostrar um modal com o texto
    const showCopyModal = (text: string) => {
        // Cria um evento customizado para abrir um modal de cópia
        window.dispatchEvent(
            new CustomEvent("show-copy-modal", { detail: { text } })
        );
        toast.info("Select and copy the text from the modal");
    };

    const handleDelete = () => {
        deleteAtPath(path);
        toast.success("Deleted successfully");
    };

    const getValueColor = (value: any) => {
        if (value === null) return "text-gray-500";
        if (typeof value === "string")
            return "text-green-600 dark:text-green-400";
        if (typeof value === "number")
            return "text-blue-600 dark:text-blue-400";
        if (typeof value === "boolean")
            return "text-purple-600 dark:text-purple-400";
        return "text-gray-600 dark:text-gray-400";
    };

    const getValueDisplay = (value: any) => {
        if (value === null) return "null";
        if (typeof value === "string") return `"${value}"`;
        return String(value);
    };

    const key = path[path.length - 1];

    // Expande automaticamente se houver busca e este nó tem filhos que correspondem
    const shouldAutoExpand =
        searchTerm &&
        !isPrimitive &&
        entries.some(([entryKey, value]) => {
            return matchesSearchRecursive(
                value,
                [...path, entryKey],
                searchTerm.toLowerCase()
            );
        });

    const isActuallyExpanded = isExpanded || shouldAutoExpand;

    // Log para debug
    if (path.length > 0 && entries.length > 0) {
        // console.log(
        //     `Node ${pathStr}: expanded=${isExpanded}, actuallyExpanded=${isActuallyExpanded}`
        // );
    }

    return (
        <div className="group">
            <div className="flex items-center gap-1 hover:bg-accent/50 rounded px-1 py-0.5">
                {(isObject || isArray) && entries.length > 0 && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 p-0"
                        onClick={() => {
                            console.log("Toggling node:", pathStr);
                            toggleNode(pathStr);
                        }}
                    >
                        {isActuallyExpanded ? (
                            <ChevronDown className="h-3 w-3" />
                        ) : (
                            <ChevronRight className="h-3 w-3" />
                        )}
                    </Button>
                )}

                {(!isObject && !isArray) || entries.length === 0 ? (
                    <span className="w-5" />
                ) : null}

                {key !== undefined && (
                    <span className="font-medium text-foreground">
                        {isArray ? `[${key}]` : `"${key}"`}:
                    </span>
                )}

                {isPrimitive && (
                    <span className={cn("ml-1", getValueColor(data))}>
                        {getValueDisplay(data)}
                    </span>
                )}

                {(isObject || isArray) && !isActuallyExpanded && (
                    <span className="text-muted-foreground ml-1">
                        {isArray
                            ? `[${entries.length}]`
                            : `{${entries.length}}`}
                    </span>
                )}

                <div className="ml-auto flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <CopyButton data={data} />

                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5"
                        onClick={() =>
                            window.dispatchEvent(
                                new CustomEvent("edit-json-value", {
                                    detail: { path, value: data },
                                })
                            )
                        }
                        title="Edit value"
                    >
                        <Edit2 className="h-3 w-3" />
                    </Button>

                    {(isObject || isArray) && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5"
                            onClick={() =>
                                window.dispatchEvent(
                                    new CustomEvent("add-json-field", {
                                        detail: { path },
                                    })
                                )
                            }
                            title="Add field"
                        >
                            <Plus className="h-3 w-3" />
                        </Button>
                    )}

                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 text-destructive hover:text-destructive"
                        onClick={handleDelete}
                        title="Delete"
                    >
                        <Trash2 className="h-3 w-3" />
                    </Button>
                </div>
            </div>

            {(isObject || isArray) && isActuallyExpanded && (
                <div className="ml-4 border-l pl-2 mt-1">
                    {entries.map(([entryKey, value]) => (
                        <TreeNode
                            key={`${pathStr}.${entryKey}`} // Chave mais específica
                            data={value}
                            path={[...path, entryKey]}
                            searchTerm={searchTerm}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

TreeNode.displayName = "TreeNode";
