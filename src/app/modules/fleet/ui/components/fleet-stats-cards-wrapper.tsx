"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { truckApi, type GetTrucksParams } from "@/lib/api/trucks";
import { FleetStatsCards } from "./fleet-stats-cards";

interface FleetStatsCardsWrapperProps {
  page: number;
  perPage: number;
  filters: {
    status?: "active" | "inactive" | "maintenance" | "out_of_service" | null;
    truck_type?: "flatbed" | "trailer" | null;
    vin?: string | null;
    plate_number?: string | null;
    make?: string | null;
    model?: string | null;
  };
}

export function FleetStatsCardsWrapper({
  page,
  perPage,
  filters,
}: FleetStatsCardsWrapperProps) {
  const { data: trucksData } = useSuspenseQuery({
    queryKey: ["trucks", { page, per_page: perPage, ...filters }],
    queryFn: async () => {
      const params: GetTrucksParams = {
        page,
        per_page: perPage,
        ...filters,
      };

      const response = await truckApi.getTrucks(params);
      
      if (!response.data) {
        throw new Error(response.error || "Failed to fetch trucks");
      }
      
      const data = response.data;
      
      // Handle paginated response
      if (
        data &&
        typeof data === "object" &&
        "items" in data &&
        "total" in data &&
        "page" in data &&
        "status" in data
      ) {
        const paginatedData = data as any;
        
        if (!paginatedData.status) {
          throw new Error(paginatedData.message || "Failed to fetch trucks");
        }
        
        return {
          trucks: paginatedData.items || [],
          total: paginatedData.total || 0,
          page: paginatedData.page || 1,
          per_page: paginatedData.per_page || perPage,
          pages: paginatedData.pages || 1,
        };
      }
      
      // Handle array response (fallback)
      if (Array.isArray(data)) {
        return {
          trucks: data,
          total: data.length,
          page: 1,
          per_page: data.length,
          pages: 1,
        };
      }
      
      return {
        trucks: [],
        total: 0,
        page: 1,
        per_page: perPage,
        pages: 0,
      };
    },
    staleTime: 1000 * 60 * 5,
  });

  const trucks = trucksData?.trucks || [];
  const total = trucksData?.total || 0;

  return <FleetStatsCards total={total} trucks={trucks} />;
}

