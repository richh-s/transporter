import { useMutation, useQueryClient } from "@tanstack/react-query";
import { truckApi } from "@/lib/api/trucks";
import type { UpdateTruckRequest, Truck } from "@/lib/api/trucks";

// Custom error class for API errors with status codes
export class ApiError extends Error {
  status: number;
  code?: string;
  fields?: Record<string, string>;

  constructor(message: string, status: number, fields?: Record<string, string>, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fields = fields;
    this.code = code;
  }
}

export function useUpdateTruck() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number | string;
      data: UpdateTruckRequest;
    }) => {
      const response = await truckApi.updateTruck(String(id), data);

      if (!response.data) {
        // Handle 409 Conflict - Duplicate plate number
        if (response.status === 409) {
          throw new ApiError(
            response.error || "A truck with this plate number already exists. Please use a unique plate number.",
            409,
            response.fields,
            response.code
          );
        }

        // Handle 422 Validation Error
        if (response.status === 422) {
          throw new ApiError(
            response.error || "Validation error. Please check your input.",
            422,
            response.fields,
            response.code
          );
        }

        throw new ApiError(
          response.error || "Failed to update truck",
          response.status || 500,
          response.fields,
          response.code
        );
      }

      return response.data;
    },
    onMutate: async ({ id, data }) => {
      // Cancel any outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: ["trucks"] });

      // Snapshot the previous value for rollback
      const previousQueries = queryClient.getQueriesData({ queryKey: ["trucks"] });

      // Optimistically update the truck in all queries
      queryClient.setQueriesData<{ trucks: Truck[]; total: number; page: number; per_page: number; pages: number }>(
        { queryKey: ["trucks"] },
        (old) => {
          if (!old) return old;

          // Update the truck with optimistic data
          const updatedTrucks = old.trucks.map((truck) =>
            truck.id === Number(id) ? { ...truck, ...data } : truck
          );

          return {
            ...old,
            trucks: updatedTrucks,
          };
        }
      );

      // Return context with snapshot for potential rollback
      return { previousQueries };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousQueries) {
        context.previousQueries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSuccess: (data) => {
      // Replace optimistic update with real data from server
      queryClient.setQueriesData<{ trucks: Truck[]; total: number; page: number; per_page: number; pages: number }>(
        { queryKey: ["trucks"] },
        (old) => {
          if (!old) return old;

          // Replace optimistic truck with real data
          const updatedTrucks = old.trucks.map((truck) =>
            truck.id === data.id ? data : truck
          );

          return {
            ...old,
            trucks: updatedTrucks,
          };
        }
      );

      // Invalidate to ensure consistency
      queryClient.invalidateQueries({ queryKey: ["trucks"] });
    },
  });
}

