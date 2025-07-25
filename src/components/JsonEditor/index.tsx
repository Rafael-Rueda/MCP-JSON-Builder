import React, { useState, useEffect } from "react";
import { useJsonEditorStore } from "@/store/json-editor-store";
import { TreeNode } from "./TreeNode";
import { AddFieldDialog } from "./AddFieldDialog";
import { EditValueDialog } from "./EditValueDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Search,
    Plus,
    Download,
    Upload,
    Save,
    History,
    Moon,
    Sun,
    Maximize2,
    Minimize2,
    FileJson,
    Bot,
} from "lucide-react";
import { toast } from "sonner";

import { GenerateJsonDialog } from "./GenerateJsonDialog";

// Debug component - remova depois de testar
const DebugInfo = () => {
    const { expandedNodes, jsonData } = useJsonEditorStore();

    return (
        <div className="fixed bottom-4 right-4 bg-card border rounded-lg p-4 max-w-xs">
            <h3 className="font-bold mb-2">Debug Info</h3>
            <div className="text-xs">
                <p>Expanded nodes: {expandedNodes.length}</p>
                <details>
                    <summary>Paths:</summary>
                    <pre className="mt-2 text-xs">
                        {JSON.stringify(expandedNodes, null, 2)}
                    </pre>
                </details>
            </div>
        </div>
    );
};

export function JsonEditor() {
    const {
        jsonData,
        expandedNodes,
        searchTerm,
        darkMode,
        history,
        setJsonData,
        setSearchTerm,
        toggleDarkMode,
        addToHistory,
        loadFromHistory,
        deleteFromHistory,
        expandAll,
        collapseAll,
    } = useJsonEditorStore();

    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [addDialogPath, setAddDialogPath] = useState<string[]>([]);

    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editDialogPath, setEditDialogPath] = useState<string[]>([]);
    const [editDialogValue, setEditDialogValue] = useState<any>(null);

    const [generatedJson, setGeneratedJson] = useState<string | null>(null);
    const [generatedDialogOpen, setGeneratedDialogOpen] = useState(false);
    const [treeKey, setTreeKey] = useState(0);

    useEffect(() => {
        // Força re-mount do tree quando expandedNodes muda significativamente
        setTreeKey((prev) => prev + 1);
    }, [expandedNodes.length]);

    // Listen for custom events from TreeNode
    useEffect(() => {
        const handleAddField = (e: CustomEvent) => {
            setAddDialogPath(e.detail.path);
            setAddDialogOpen(true);
        };

        const handleEditValue = (e: CustomEvent) => {
            setEditDialogPath(e.detail.path);
            setEditDialogValue(e.detail.value);
            setEditDialogOpen(true);
        };

        window.addEventListener(
            "add-json-field",
            handleAddField as EventListener
        );
        window.addEventListener(
            "edit-json-value",
            handleEditValue as EventListener
        );

        return () => {
            window.removeEventListener(
                "add-json-field",
                handleAddField as EventListener
            );
            window.removeEventListener(
                "edit-json-value",
                handleEditValue as EventListener
            );
        };
    }, []);

    // Apply dark mode
    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    }, [darkMode]);

    const handleExport = () => {
        const dataStr = JSON.stringify(jsonData, null, 2);
        const dataUri =
            "data:application/json;charset=utf-8," +
            encodeURIComponent(dataStr);

        const exportFileDefaultName = `json-export-${new Date()
            .toISOString()
            .slice(0, 10)}.json`;

        const linkElement = document.createElement("a");
        linkElement.setAttribute("href", dataUri);
        linkElement.setAttribute("download", exportFileDefaultName);
        linkElement.click();

        toast.success("JSON exported successfully");
    };

    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const imported = JSON.parse(event.target?.result as string);
                setJsonData(imported);
                toast.success("JSON imported successfully");
            } catch (error) {
                toast.error("Invalid JSON file");
            }
        };
        reader.readAsText(file);
    };

    const handleSaveToHistory = () => {
        addToHistory(`Version ${new Date().toLocaleString()}`);
        toast.success("Saved to history");
    };

    const handleGenerateJson = async () => {
        setGeneratedDialogOpen(true);
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <FileJson className="h-6 w-6 text-primary" />
                            <h1 className="text-2xl font-bold">
                                MCP JSON Builder
                            </h1>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <Label htmlFor="dark-mode" className="sr-only">
                                    Dark Mode
                                </Label>
                                <Sun className="h-4 w-4" />
                                <Switch
                                    id="dark-mode"
                                    checked={darkMode}
                                    onCheckedChange={toggleDarkMode}
                                />
                                <Moon className="h-4 w-4" />
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Toolbar */}
            <div className="border-b bg-muted/50">
                <div className="container mx-auto px-4 py-3">
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="text"
                                placeholder="Search JSON..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9"
                            />
                        </div>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                setAddDialogPath([]);
                                setAddDialogOpen(true);
                            }}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Field
                        </Button>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleSaveToHistory}
                        >
                            <Save className="h-4 w-4 mr-2" />
                            Save
                        </Button>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm">
                                    <History className="h-4 w-4 mr-2" />
                                    History
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-64">
                                {history.length === 0 ? (
                                    <div className="p-2 text-sm text-muted-foreground">
                                        No history yet
                                    </div>
                                ) : (
                                    history
                                        .slice()
                                        .reverse()
                                        .map((item) => (
                                            <DropdownMenuItem
                                                key={item.id}
                                                onClick={() => {
                                                    loadFromHistory(item.id);
                                                    toast.success(
                                                        "Loaded from history"
                                                    );
                                                }}
                                            >
                                                <div
                                                    className="flex-1 cursor-pointer"
                                                    title="Load from history"
                                                >
                                                    <div className="font-medium">
                                                        {item.name || "Unnamed"}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {new Date(
                                                            item.timestamp
                                                        ).toLocaleString()}
                                                    </div>
                                                </div>
                                            </DropdownMenuItem>
                                        ))
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <Button variant="outline" size="sm" onClick={expandAll}>
                            <Maximize2 className="h-4 w-4 mr-2" />
                            Expand All
                        </Button>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={collapseAll}
                        >
                            <Minimize2 className="h-4 w-4 mr-2" />
                            Collapse All
                        </Button>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleExport}
                        >
                            <Download className="h-4 w-4 mr-2" />
                            Export
                        </Button>

                        <label>
                            <Button variant="outline" size="sm" asChild>
                                <span>
                                    <Upload className="h-4 w-4 mr-2" />
                                    Import
                                </span>
                            </Button>
                            <input
                                type="file"
                                accept=".json"
                                onChange={handleImport}
                                className="hidden"
                            />
                        </label>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleGenerateJson}
                        >
                            <Bot className="h-4 w-4 mr-2" />
                            Generate JSON (AI)
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Editor */}
                    <div className="lg:col-span-2">
                        <div className="rounded-lg border bg-card p-4">
                            <h2 className="text-lg font-semibold mb-4">
                                Editor
                            </h2>

                            <div className="font-mono text-sm" key={treeKey}>
                                {Object.keys(jsonData).length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        Empty JSON. Click "Add Field" to start.
                                    </div>
                                ) : (
                                    <TreeNode
                                        data={jsonData}
                                        path={[]}
                                        searchTerm={searchTerm}
                                    />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Preview */}
                    <div>
                        <div className="rounded-lg border bg-card p-4">
                            <h2 className="text-lg font-semibold mb-4">
                                Preview
                            </h2>

                            <pre className="text-xs font-mono bg-muted p-4 rounded-md overflow-auto max-h-[600px]">
                                {JSON.stringify(jsonData, null, 2)}
                            </pre>
                        </div>
                    </div>
                </div>
            </main>

            {/* Dialogs */}
            <AddFieldDialog
                open={addDialogOpen}
                onOpenChange={setAddDialogOpen}
                path={addDialogPath}
            />

            <EditValueDialog
                open={editDialogOpen}
                onOpenChange={setEditDialogOpen}
                path={editDialogPath}
                currentValue={editDialogValue}
            />

            <GenerateJsonDialog
                open={generatedDialogOpen}
                onOpenChange={setGeneratedDialogOpen}
                path={[]}
                currentValue={
                    "I have an application that sells items to clients. The business rules are as follow..."
                }
            />
        </div>
    );
}
