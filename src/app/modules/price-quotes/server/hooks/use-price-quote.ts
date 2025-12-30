import { useQuery } from "@tanstack/react-query";
import { PriceQuoteService } from "@/lib/price-quote-api";
import { priceQuoteKeys } from "./price-quote-keys";

/**
 * Hook to fetch a single price quote
 */
export function usePriceQuote(id: number) {
    return useQuery({
        queryKey: priceQuoteKeys.detail(id),
        queryFn: () => PriceQuoteService.getQuote(id),
        enabled: !!id,
        staleTime: 0,
        refetchInterval: 60 * 1000,
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
    });
}

