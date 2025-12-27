import { useMutation, useQueryClient } from "@tanstack/react-query";
import { truckApi } from "@/lib/api/trucks";

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
    onSuccess: () => {
      // Invalidate and refetch trucks list automatically
      queryClient.invalidateQueries({ queryKey: ["trucks"] });
    },
  });
}

