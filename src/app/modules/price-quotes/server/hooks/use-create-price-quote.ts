import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PriceQuoteService } from "@/lib/price-quote-api";
import type { CreatePriceQuoteRequest } from "@/types/price-quote";
import { toast } from "sonner";
import { priceQuoteKeys } from "./price-quote-keys";

/**
 * Hook to create a new price quote
 */
export function useCreatePriceQuote() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreatePriceQuoteRequest) =>
            PriceQuoteService.createQuote(data),
        onSuccess: (quote) => {
            queryClient.invalidateQueries({ queryKey: priceQuoteKeys.lists() });
            queryClient.setQueryData(priceQuoteKeys.detail(quote.id), quote);
            toast.success("Price quote created successfully");
        },
        onError: (error: Error & { code?: string }) => {
            // Handle specific error codes with user-friendly messages
            if (error.code === "MISSING_DOCUMENTS") {
                toast.error(
                    "Cannot create price quote: Trade License document is required and must be approved. Please upload and get your Trade License approved first.",
                    {
                        duration: 6000,
                        action: {
                            label: "Go to Documents",
                            onClick: () => {
                                window.location.href = "/organization/documents";
                            },
                        },
                    }
                );
            } else {
                toast.error(error.message || "Failed to create price quote");
            }
        },
    });
}

