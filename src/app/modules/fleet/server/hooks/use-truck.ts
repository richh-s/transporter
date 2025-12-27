import { useSuspenseQuery } from "@tanstack/react-query";
import { truckApi } from "@/lib/api/trucks";
import type { Truck } from "@/lib/api/trucks";

export function useTruck(id: string | number) {
  return useSuspenseQuery({
    queryKey: ["truck", id],
    queryFn: async () => {
      const response = await truckApi.getTruck(String(id));
      
      if (!response.data) {
        throw new Error(response.error || "Failed to fetch truck");
      }
      
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // Data is fresh for 5 minutes
  });
}

