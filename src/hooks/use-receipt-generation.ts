import { useState, useCallback } from "react";
import { ReceiptValidationService } from "@/services/receiptValidationService";
import { shipApi } from "@/lib/api/ships";
import { PaymentResponse } from "@/types/ship";
import { toast } from "sonner";
import { Capacitor } from "@capacitor/core";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { FileOpener } from "@capacitor-community/file-opener";

export const useReceiptGeneration = () => {
    const [isGenerating, setIsGenerating] = useState(false);

    const generateReceipt = useCallback(async (payment: PaymentResponse) => {
        setIsGenerating(true);

        try {
            // Validate payment before generating receipt
            const validation = ReceiptValidationService.validatePaymentForReceipt(payment);

            if (!validation.isValid) {
                toast.error(validation.errors.join(", "));
                setIsGenerating(false);
                return;
            }

            // Generate receipt
            toast.loading("Generating receipt...");
            const blob = await shipApi.getReceipt(payment.id);
            const fileName = `receipt_${payment.id}.pdf`;

            // Download PDF
            if (Capacitor.isNativePlatform()) {
                // Convert blob to base64
                const reader = new FileReader();
                const base64Data = await new Promise<string>((resolve, reject) => {
                    reader.onloadend = () => {
                        const result = reader.result as string;
                        const base64 = result.split(",")[1];
                        resolve(base64);
                    };
                    reader.onerror = () => reject(new Error("Failed to read file"));
                    reader.readAsDataURL(blob);
                });

                // Save file to device cache
                const savedFile = await Filesystem.writeFile({
                    path: fileName,
                    data: base64Data,
                    directory: Directory.Cache,
                });

                toast.dismiss();

                // Open the file directly with the device's PDF viewer
                await FileOpener.open({
                    filePath: savedFile.uri,
                    contentType: "application/pdf",
                });

                toast.success("Receipt opened");
            } else {
                // Web fallback
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = fileName;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);

                toast.dismiss();
                toast.success("Receipt downloaded successfully!");
            }
        } catch (err) {
            toast.dismiss();
            toast.error(err instanceof Error ? err.message : "Failed to generate receipt");
        } finally {
            setIsGenerating(false);
        }
    }, []);

    return {
        generateReceipt,
        isGenerating,
    };
};
