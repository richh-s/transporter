import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PriceQuoteService } from "@/lib/price-quote-api";
import type { UpdatePriceQuoteRequest } from "@/types/price-quote";
import { toast } from "sonner";
import { priceQuoteKeys } from "./price-quote-keys";

/**
 * Hook to update a price quote
 */
export function useUpdatePriceQuote() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            id,
            data,
        }: {
            id: number;
            data: UpdatePriceQuoteRequest;
        }) => PriceQuoteService.updateQuote(id, data),
        onSuccess: (quote) => {
            queryClient.setQueryData(priceQuoteKeys.detail(quote.id), quote);
            queryClient.invalidateQueries({ queryKey: priceQuoteKeys.lists() });
            toast.success("Price quote updated successfully");
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to update price quote");
        },
    });
}

