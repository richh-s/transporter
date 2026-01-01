import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PriceQuoteService } from "@/lib/price-quote-api";
import { toast } from "sonner";
import { priceQuoteKeys } from "./price-quote-keys";

/**
 * Hook to delete a price quote
 */
export function useDeletePriceQuote() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => PriceQuoteService.deleteQuote(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: priceQuoteKeys.lists() });
            queryClient.removeQueries({ queryKey: priceQuoteKeys.details() });
            toast.success("Price quote deleted successfully");
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to delete price quote");
        },
    });
}

