import { useEffect, useRef } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Copy } from "lucide-react";
import { toast } from "sonner";

interface CopyModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    text: string;
}

export function CopyModal({ open, onOpenChange, text }: CopyModalProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (open && textareaRef.current) {
            // Auto-seleciona o texto quando o modal abre
            setTimeout(() => {
                textareaRef.current?.select();
            }, 100);
        }
    }, [open]);

    const handleCopy = () => {
        if (textareaRef.current) {
            textareaRef.current.select();

            try {
                const successful = document.execCommand("copy");
                if (successful) {
                    toast.success("Copied!");
                    onOpenChange(false);
                } else {
                    toast.error("Copy failed - please copy manually");
                }
            } catch (err) {
                toast.error("Copy failed - please copy manually");
            }
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[625px]">
                <DialogHeader>
                    <DialogTitle>Copy JSON</DialogTitle>
                    <DialogDescription>
                        Select and copy the JSON below, or click the copy
                        button.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <Textarea
                        ref={textareaRef}
                        value={text}
                        readOnly
                        className="font-mono text-sm min-h-[300px] max-h-[500px]"
                        onClick={(e) => e.currentTarget.select()}
                    />

                    <div className="flex justify-end gap-2">
                        <Button
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Close
                        </Button>
                        <Button onClick={handleCopy}>
                            <Copy className="h-4 w-4 mr-2" />
                            Copy
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
