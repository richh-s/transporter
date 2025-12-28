import type { PriceQuoteFilters } from "@/types/price-quote";

// Query keys
export const priceQuoteKeys = {
    all: ["price-quotes"] as const,
    lists: () => [...priceQuoteKeys.all, "list"] as const,
    list: (filters: PriceQuoteFilters, page: number, perPage: number) =>
        [...priceQuoteKeys.lists(), filters, page, perPage] as const,
    details: () => [...priceQuoteKeys.all, "detail"] as const,
    detail: (id: number) => [...priceQuoteKeys.details(), id] as const,
};

