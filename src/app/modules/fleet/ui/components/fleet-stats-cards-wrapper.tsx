"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { truckApi, type GetTrucksParams, type Truck } from "@/lib/api/trucks";
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
      
      if (
        data &&
        typeof data === "object" &&
        "items" in data &&
        "total" in data &&
        "page" in data &&
        "status" in data
      ) {
        const paginatedData = data as {
          items?: Truck[];
          total?: number;
          page?: number;
          per_page?: number;
          pages?: number;
          status?: boolean;
          message?: string;
        };
        
        if (!paginatedData.status) {
          throw new Error(paginatedData.message || "Failed to fetch trucks");
        }
        
        return {
          trucks: (paginatedData.items || []) as Truck[],
          total: paginatedData.total || 0,
          page: paginatedData.page || 1,
          per_page: paginatedData.per_page || perPage,
          pages: paginatedData.pages || 1,
        };
      }
      
      // Handle array response (fallback)
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
      
      return {
        trucks: [] as Truck[],
        total: 0,
        page: 1,
        per_page: perPage,
        pages: 0,
      };
    },
    staleTime: 1000 * 60 * 5,
  });

  const trucks = (trucksData?.trucks || []) as Truck[];
  const total = trucksData?.total || 0;

  return <FleetStatsCards total={total} trucks={trucks} />;
}

