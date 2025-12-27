import { useMutation, useQueryClient } from "@tanstack/react-query";
import { truckApi } from "@/lib/api/trucks";
import type { CreateTruckRequest } from "@/lib/api/trucks";

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

      if (!response.data) {
        // Handle 409 Conflict - Duplicate plate number
        if (response.status === 409) {
          throw new ApiError(
            "A truck with this plate number already exists. Please use a unique plate number.",
            409
          );
        }
        
        // Handle 422 Validation Error
        if (response.status === 422) {
          throw new ApiError(
            response.error || "Validation failed. Please check your input.",
            422
          );
        }
        
        throw new ApiError(
          response.error || "Failed to create truck",
          response.status
        );
      }

      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch trucks list automatically
      queryClient.invalidateQueries({ queryKey: ["trucks"] });
    },
  });
}
