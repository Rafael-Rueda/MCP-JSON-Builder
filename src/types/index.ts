import { z } from "zod";

export const JsonValueSchema: z.ZodType<any> = z.lazy(() =>
    z.union([
        z.string(),
        z.number(),
        z.boolean(),
        z.null(),
        z.array(JsonValueSchema),
        z.record(z.string(), JsonValueSchema),
    ])
);

export type JsonValue = z.infer<typeof JsonValueSchema>;

export const FieldTypeSchema = z.enum([
    "string",
    "number",
    "boolean",
    "array",
    "object",
    "null",
]);
export type FieldType = z.infer<typeof FieldTypeSchema>;

// Schema para adicionar em objetos (requer key)
export const AddFieldToObjectSchema = z.object({
    key: z.string().min(1, "Key is required"),
    type: FieldTypeSchema,
    value: z.string().optional(),
});

// Schema para adicionar em arrays (não requer key)
export const AddFieldToArraySchema = z.object({
    type: FieldTypeSchema,
    value: z.string().optional(),
});

export type AddFieldToObjectForm = z.infer<typeof AddFieldToObjectSchema>;
export type AddFieldToArrayForm = z.infer<typeof AddFieldToArraySchema>;

export const EditValueSchema = z.object({
    value: z.string(),
});

export type EditValueForm = z.infer<typeof EditValueSchema>;

export const GenerateJsonSchema = z.object({
    input: z.string().min(1, "Please describe your business rules"),
});

export type GenerateJsonForm = z.infer<typeof GenerateJsonSchema>;

export interface TreeNodeProps {
    data: JsonValue;
    path: string[];
    searchTerm?: string;
}
