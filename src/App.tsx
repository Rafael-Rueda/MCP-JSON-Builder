import { JsonEditor } from "@/components/JsonEditor";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";

const queryClient = new QueryClient();

function App() {
    return (
        <>
            <QueryClientProvider client={queryClient}>
                <JsonEditor />
            </QueryClientProvider>
            <Toaster position="top-right" richColors />
        </>
    );
}

export default App;
