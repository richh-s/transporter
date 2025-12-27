import { useMutation, useQueryClient } from "@tanstack/react-query";
import { truckApi } from "@/lib/api/trucks";
import type { Truck } from "@/lib/api/trucks";

export function useDeleteTruck() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number | string) => {
      const response = await truckApi.deleteTruck(String(id));

      if (response.status !== 200 && response.status !== 204) {
        throw new Error(response.error || "Failed to delete truck");
      }

      return id; // Return the ID of the deleted truck
    },
    onMutate: async (id) => {
      // Cancel any outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: ["trucks"] });

      // Snapshot the previous value for rollback
      const previousQueries = queryClient.getQueriesData({ queryKey: ["trucks"] });

      // Optimistically remove the truck from all queries
      queryClient.setQueriesData<{ trucks: Truck[]; total: number; page: number; per_page: number; pages: number }>(
        { queryKey: ["trucks"] },
        (old) => {
          if (!old) return old;
          
          // Remove the truck from the list
          const updatedTrucks = old.trucks.filter((truck) => truck.id !== Number(id));
          
          return {
            ...old,
            trucks: updatedTrucks,
            total: Math.max(0, old.total - 1),
          };
        }
      );

      // Return context with snapshot for potential rollback
      return { previousQueries };
    },
    onError: (err, id, context) => {
      // Rollback on error
      if (context?.previousQueries) {
        context.previousQueries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSuccess: () => {
      // Invalidate to ensure consistency
      queryClient.invalidateQueries({ queryKey: ["trucks"] });
    },
  });
}

