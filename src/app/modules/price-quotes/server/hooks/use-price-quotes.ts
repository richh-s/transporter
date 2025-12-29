import { useQuery } from "@tanstack/react-query";
import { PriceQuoteService } from "@/lib/price-quote-api";
import type {
    PriceQuoteFilters
} from "@/types/price-quote";
import { priceQuoteKeys } from "./price-quote-keys";

/**
 * Hook to fetch price quotes list with pagination and filters
 */
export function usePriceQuotes(
    page: number = 1,
    perPage: number = 20,
    filters: PriceQuoteFilters = {}
) {
    return useQuery({
        queryKey: priceQuoteKeys.list(filters, page, perPage),
        queryFn: () => PriceQuoteService.listQuotes(page, perPage, filters),
        staleTime: 0,
        refetchInterval: 60 * 1000,
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
    });
}

