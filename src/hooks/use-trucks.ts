import { useQuery } from "@tanstack/react-query";
import { fetchTrucks, type Truck } from "@/lib/trucks-api";

// Query keys
export const truckKeys = {
    all: ["trucks"] as const,
    lists: () => [...truckKeys.all, "list"] as const,
    unassigned: () => [...truckKeys.all, "unassigned"] as const,
};

/**
 * Hook to fetch trucks list
 */
export function useTrucks() {
    return useQuery({
        queryKey: truckKeys.lists(),
        queryFn: fetchTrucks,
        staleTime: 0, // Data is immediately stale
        gcTime: 0, // Don't cache - always fetch fresh data
        refetchOnMount: true, // Always refetch on mount
        refetchOnWindowFocus: true, // Refetch when window regains focus
        refetchOnReconnect: true, // Refetch when network reconnects
    });
}

/**
 * Hook to fetch unassigned trucks (trucks not assigned to any GPS device)
 * Optionally includes a specific truck ID (e.g., current truck being edited)
 */
export function useUnassignedTrucks(includeTruckId?: number) {
    return useQuery({
        queryKey: [...truckKeys.unassigned(), includeTruckId],
        staleTime: 0, // Data is immediately stale
        gcTime: 0, // Don't cache - always fetch fresh data
        refetchOnMount: true, // Always refetch on mount
        refetchOnWindowFocus: true, // Refetch when window regains focus
        refetchOnReconnect: true, // Refetch when network reconnects
        queryFn: async () => {
            // Fetch all trucks for the organization (fresh, no cache)
            // Each truck has a gps_device_id field - null/undefined means unassigned
            const allTrucks = await fetchTrucks();

            // Debug logging
            if (process.env.NODE_ENV === "development") {
                console.log(`[Unassigned Trucks] Total trucks: ${allTrucks.length}`);
                console.log(`[Unassigned Trucks] Trucks with gps_device_id:`,
                    allTrucks.map(t => ({ id: t.id, gps_device_id: t.gps_device_id }))
                );
                console.log(`[Unassigned Trucks] Include truck ID:`, includeTruckId);
            }

            // Filter trucks where gps_device_id is null/undefined (unassigned)
            // OR include the current truck if it's being edited (so user can keep/reassign it)
            const unassignedTrucks = allTrucks.filter((truck) => {
                const isUnassigned = truck.gps_device_id === null || truck.gps_device_id === undefined;
                const isCurrentTruck = includeTruckId !== undefined && truck.id === includeTruckId;

                // Include if: unassigned (gps_device_id is null/undefined), OR it's the current truck
                const shouldInclude = isUnassigned || isCurrentTruck;

                if (process.env.NODE_ENV === "development") {
                    console.log(`[Unassigned Trucks] Truck ${truck.id}: gps_device_id=${truck.gps_device_id}, isUnassigned=${isUnassigned}, isCurrentTruck=${isCurrentTruck}, shouldInclude=${shouldInclude}`);
                }

                return shouldInclude;
            });

            if (process.env.NODE_ENV === "development") {
                console.log(`[Unassigned Trucks] Final unassigned trucks:`, unassignedTrucks.map(t => ({ id: t.id, gps_device_id: t.gps_device_id })));
            }

            return unassignedTrucks;
        },
    });
}

