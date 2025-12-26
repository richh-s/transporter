import { useQuery } from "@tanstack/react-query";
import { fetchTrucks } from "@/lib/trucks-api";

// Query keys
export const truckKeys = {
  all: ["trucks"] as const,
  lists: () => [...truckKeys.all, "list"] as const,
};

/**
 * Hook to fetch trucks list
 */
export function useTrucks() {
  return useQuery({
    queryKey: truckKeys.lists(),
    queryFn: fetchTrucks,
    staleTime: 5 * 60 * 1000, // 5 minutes - trucks don't change often
  });
}

