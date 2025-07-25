import { useEffect } from "react";
import { useForm, type FieldErrors } from "react-hook-form";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    AddFieldToObjectSchema,
    AddFieldToArraySchema,
    type AddFieldToObjectForm,
    type AddFieldToArrayForm,
    type FieldType,
} from "@/types";
import { toast } from "sonner";

interface AddFieldDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    path: string[];
}

export function AddFieldDialog({
    open,
    onOpenChange,
    path,
}: AddFieldDialogProps) {
    const { jsonData, addFieldAtPath } = useJsonEditorStore();

    const currentValue = path.reduce((acc, key) => acc?.[key], jsonData as any);
    const isArray = Array.isArray(currentValue);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors },
    } = useForm<AddFieldToObjectForm | AddFieldToArrayForm>({
        resolver: zodResolver(
            isArray ? AddFieldToArraySchema : AddFieldToObjectSchema
        ),
        defaultValues: {
            key: "",
            type: "string",
            value: "",
        },
    });

    const selectedType = watch("type");

    useEffect(() => {
        if (open) {
            reset({
                key: "",
                type: "string",
                value: "",
            });
        }
    }, [open, reset]);

    const onSubmit = (data: AddFieldToObjectForm | AddFieldToArrayForm) => {
        try {
            let value: any;

            switch (data.type) {
                case "string":
                    value = data.value || "";
                    break;
                case "number":
                    value = data.value ? parseFloat(data.value) : 0;
                    break;
                case "boolean":
                    value = data.value === "true";
                    break;
                case "null":
                    value = null;
                    break;
                case "array":
                    value = [];
                    break;
                case "object":
                    value = {};
                    break;
            }

            if (isArray) {
                // Para arrays, passamos uma key vazia
                addFieldAtPath(path, "", value);
            } else {
                // Para objetos, usamos a key fornecida
                const key = (data as AddFieldToObjectForm).key;
                addFieldAtPath(path, key, value);
            }

            toast.success("Field added successfully");
            onOpenChange(false);
        } catch (error) {
            console.error("Error adding field:", error);
            toast.error("Failed to add field");
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add New Field</DialogTitle>
                    <DialogDescription>
                        Add a new field to{" "}
                        {path.length > 0 ? path.join(" > ") : "root"}
                        {isArray && " (Array)"}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {!isArray && (
                        <div className="space-y-2">
                            <Label htmlFor="key">Field Key</Label>
                            <Input
                                id="key"
                                {...register("key")}
                                placeholder="Enter field key"
                            />
                            {(errors as FieldErrors<AddFieldToObjectForm>)
                                .key && (
                                <p className="text-sm text-destructive">
                                    {
                                        (
                                            errors as FieldErrors<AddFieldToObjectForm>
                                        ).key?.message
                                    }
                                </p>
                            )}
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="type">Field Type</Label>
                        <Select
                            value={selectedType}
                            onValueChange={(value) =>
                                setValue("type", value as FieldType)
                            }
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="string">String</SelectItem>
                                <SelectItem value="number">Number</SelectItem>
                                <SelectItem value="boolean">Boolean</SelectItem>
                                <SelectItem value="null">Null</SelectItem>
                                <SelectItem value="array">Array</SelectItem>
                                <SelectItem value="object">Object</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {selectedType !== "array" &&
                        selectedType !== "object" &&
                        selectedType !== "null" && (
                            <div className="space-y-2">
                                <Label htmlFor="value">
                                    Initial Value (optional)
                                </Label>
                                <Input
                                    id="value"
                                    {...register("value")}
                                    placeholder={
                                        selectedType === "boolean"
                                            ? "true or false"
                                            : "Enter initial value"
                                    }
                                />
                            </div>
                        )}

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit">
                            Add {isArray ? "Item" : "Field"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
