import { useMutation, useQueryClient } from "@tanstack/react-query";
import { truckApi } from "@/lib/api/trucks";
import type { CreateTruckRequest, Truck } from "@/lib/api/trucks";

// Custom error class for API errors with status codes
export class ApiError extends Error {
  status: number;
  
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export function useCreateTruck() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateTruckRequest) => {
      // Automatically set registration_date to the date it is submitted
      const submissionData = {
        ...data,
        registration_date: new Date().toISOString().split("T")[0],
      };

      const response = await truckApi.createTruck(submissionData);

      // Log response for debugging
      if (process.env.NODE_ENV === "development") {
        console.log("🚛 Create truck response:", {
          status: response.status,
          hasData: !!response.data,
          error: response.error,
        });
      }

      // Check for error status codes first (even if data might exist)
      // Status 409 means conflict - truck already exists
      if (response.status === 409) {
        throw new ApiError(
          "A truck with this plate number already exists. Please use a unique plate number.",
          409
        );
      }
      
      // Status 422 means validation error
      if (response.status === 422) {
        throw new ApiError(
          response.error || "Validation failed. Please check your input.",
          422
        );
      }

      // If we have data and status is success (200-299), return it
      if (response.data && response.status >= 200 && response.status < 300) {
        return response.data;
      }

      // Otherwise, it's an error
      throw new ApiError(
        response.error || "Failed to create truck",
        response.status || 500
      );
    },
    onMutate: async (newTruckData) => {
      // Cancel any outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: ["trucks"] });

      // Snapshot the previous value for rollback
      const previousQueries = queryClient.getQueriesData({ queryKey: ["trucks"] });

      // Create a temporary ID for optimistic update
      const tempId = `temp-${Date.now()}`;

      // Optimistically create a temporary truck object
      const optimisticTruck: Truck = {
        id: tempId as any, // Temporary ID (will be replaced by server response)
        ...newTruckData,
        registration_date: new Date().toISOString().split("T")[0],
      } as Truck;

      // Update all truck queries optimistically
      queryClient.setQueriesData<{ trucks: Truck[]; total: number; page: number; per_page: number; pages: number }>(
        { queryKey: ["trucks"] },
        (old) => {
          if (!old) return old;
          
          // Add the new truck to the beginning of the list
          const updatedTrucks = [optimisticTruck, ...old.trucks];
          
          return {
            ...old,
            trucks: updatedTrucks,
            total: old.total + 1,
          };
        }
      );

      // Return context with snapshot for potential rollback
      return { previousQueries, tempId };
    },
    onError: (err, newTruckData, context) => {
      // Rollback on error
      if (context?.previousQueries) {
        context.previousQueries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      // Ensure error is properly set and doesn't break the app
      // The error will be caught in the component's try-catch
    },
    onSuccess: (data, variables, context) => {
      // Replace optimistic truck with real data from server
      if (context?.tempId) {
        queryClient.setQueriesData<{ trucks: Truck[]; total: number; page: number; per_page: number; pages: number }>(
          { queryKey: ["trucks"] },
          (old) => {
            if (!old) return old;
            
            // Replace optimistic truck with real data
            const updatedTrucks = old.trucks.map((truck) =>
              String(truck.id) === String(context.tempId) ? data : truck
            );
            
            return {
              ...old,
              trucks: updatedTrucks,
            };
          }
        );
      }
      
      // Invalidate to ensure consistency
      queryClient.invalidateQueries({ queryKey: ["trucks"] });
    },
  });
}
