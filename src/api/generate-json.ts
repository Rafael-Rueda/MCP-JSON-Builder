import { env } from "@/env";
import { api } from "@/lib/axios";

export async function generateJson(input: string) {
    const response = await api.post(env.VITE_API_WEBHOOK_URL, {
        message: input,
    });
    return response.data;
}
