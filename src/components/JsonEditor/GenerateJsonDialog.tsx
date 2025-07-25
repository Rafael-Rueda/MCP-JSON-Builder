import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useJsonEditorStore } from "@/store/json-editor-store";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { GenerateJsonSchema, type GenerateJsonForm } from "@/types";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { generateJson } from "@/api/generate-json";

interface GenerateJsonDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    path: string[];
    currentValue: any;
}

export function GenerateJsonDialog({
    open,
    onOpenChange,
    path,
    currentValue,
}: GenerateJsonDialogProps) {
    const { updateValueAtPath, setJsonData, jsonData } = useJsonEditorStore();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<GenerateJsonForm>({
        resolver: zodResolver(GenerateJsonSchema),
    });

    const { mutateAsync, isPending } = useMutation({
        mutationKey: ["generateJson"],
        mutationFn: (input: string) => generateJson(input),
    });

    useEffect(() => {
        if (open) {
            reset({ input: "" }); // Limpa o campo ao abrir
        }
    }, [open, reset]);

    const onSubmit = async (data: GenerateJsonForm) => {
        try {
            // Executa o webhook
            const result = await mutateAsync(data.input);

            //console.log("API Response:", result);
            //console.log("Current path:", path);

            // Se estamos editando a raiz (path vazio) ou gerando novo JSON
            if (path.length === 0) {
                // Substitui todo o JSON
                setJsonData(result);
            } else {
                // Atualiza apenas o caminho específico
                updateValueAtPath(path, result);
            }

            toast.success("JSON generated successfully!");
            onOpenChange(false);
        } catch (error) {
            console.error("Error generating JSON:", error);
            toast.error("Failed to generate JSON");
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                    <DialogTitle>Generate JSON with AI</DialogTitle>
                    <DialogDescription>
                        Describe your business rules and requirements to
                        generate a structured JSON for your application.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="input">
                            Describe your business rules
                        </Label>
                        <Textarea
                            id="input"
                            {...register("input")}
                            rows={10}
                            className="font-mono text-sm"
                            placeholder="Ex: Create an application to sell items to clients, with user registration, payment processing, etc."
                            disabled={isPending}
                        />
                        {errors.input && (
                            <p className="text-sm text-destructive">
                                {errors.input.message}
                            </p>
                        )}
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isPending}
                        >
                            Cancel
                        </Button>
                        <Button disabled={isPending} type="submit">
                            {isPending ? "Generating..." : "Generate JSON"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
