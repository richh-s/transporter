import { useQuery } from "@tanstack/react-query";
import { truckApi, type GetTrucksParams, type PaginatedTrucksResponse } from "@/lib/api/trucks";
import type { Truck } from "@/lib/api/trucks";

export interface UseTrucksOptions extends GetTrucksParams {
  enabled?: boolean;
}

export interface UseTrucksResult {
  trucks: Truck[];
  total: number;
  page: number;
  per_page: number;
  pages: number;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useTrucks(options: UseTrucksOptions = {}) {
  const {
    page = 1,
    per_page = 20,
    enabled = true,
    ...filters
  } = options;

  return useQuery({
    queryKey: ["trucks", { page, per_page, ...filters }],
    queryFn: async () => {
      const params: GetTrucksParams = {
        page,
        per_page,
        ...filters,
      };

      const response = await truckApi.getTrucks(params);
      
      if (!response.data) {
        throw new Error(response.error || "Failed to fetch trucks");
      }
      
      // Debug: Log the response structure in development
      if (process.env.NODE_ENV === "development") {
        console.log("🚛 Trucks API response:", response.data);
      }
      
      const data = response.data;
      
      // Handle paginated response (matches API structure)
      if (
        data &&
        typeof data === "object" &&
        "items" in data &&
        "total" in data &&
        "page" in data &&
        "status" in data
      ) {
        const paginatedData = data as PaginatedTrucksResponse;
        
        // Check if API returned success status
        if (!paginatedData.status) {
          throw new Error(paginatedData.message || "Failed to fetch trucks");
        }
        
        return {
          trucks: paginatedData.items || [],
          total: paginatedData.total || 0,
          page: paginatedData.page || 1,
          per_page: paginatedData.per_page || per_page,
          pages: paginatedData.pages || 1,
        };
      }
      
      // Handle array response (non-paginated fallback)
      if (Array.isArray(data)) {
        const trucksArray = data as Truck[];
        return {
          trucks: trucksArray,
          total: trucksArray.length,
          page: 1,
          per_page: trucksArray.length,
          pages: 1,
        };
      }
      
      // Default to empty
      return {
        trucks: [],
        total: 0,
        page: 1,
        per_page: per_page,
        pages: 0,
      };
    },
    enabled,
    staleTime: 1000 * 60 * 5, // Data is fresh for 5 minutes
    refetchOnWindowFocus: true, // Refetch when user comes back to the tab
  });
}

