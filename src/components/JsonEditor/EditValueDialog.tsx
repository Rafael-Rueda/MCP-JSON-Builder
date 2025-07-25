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
import { EditValueSchema, type EditValueForm } from "@/types";
import { toast } from "sonner";

interface EditValueDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    path: string[];
    currentValue: any;
}

export function EditValueDialog({
    open,
    onOpenChange,
    path,
    currentValue,
}: EditValueDialogProps) {
    const { updateValueAtPath } = useJsonEditorStore();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<EditValueForm>({
        resolver: zodResolver(EditValueSchema),
    });

    useEffect(() => {
        if (open) {
            const valueStr =
                typeof currentValue === "object"
                    ? JSON.stringify(currentValue, null, 2)
                    : String(currentValue);

            reset({ value: valueStr });
        }
    }, [open, currentValue, reset]);

    const onSubmit = (data: EditValueForm) => {
        try {
            let parsedValue: any = data.value;

            // Try to parse as JSON
            try {
                parsedValue = JSON.parse(data.value);
            } catch {
                // If parsing fails, check if it's a number
                if (!isNaN(Number(data.value)) && data.value !== "") {
                    parsedValue = Number(data.value);
                }
                // Otherwise keep as string
            }

            updateValueAtPath(path, parsedValue);
            toast.success("Value updated successfully");
            onOpenChange(false);
        } catch (error) {
            toast.error("Failed to update value");
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                    <DialogTitle>Edit Value</DialogTitle>
                    <DialogDescription>
                        Editing: {path.length > 0 ? path.join(" > ") : "root"}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="value">Value</Label>
                        <Textarea
                            id="value"
                            {...register("value")}
                            rows={10}
                            className="font-mono text-sm"
                            placeholder="Enter value (JSON will be auto-detected)"
                        />
                        {errors.value && (
                            <p className="text-sm text-destructive">
                                {errors.value.message}
                            </p>
                        )}
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit">Save Changes</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
