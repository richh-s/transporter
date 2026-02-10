import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { GPSDeviceService } from "@/lib/gps-device-api";
import type {
  GPSDevice,
  CreateGPSDeviceRequest,
  UpdateGPSDeviceRequest,
  GPSDeviceFilters,
  GPSDeviceListResponse,
} from "@/types/gps-device";
import { toast } from "sonner";
import { truckKeys } from "./use-trucks";

// Query keys
export const gpsDeviceKeys = {
  all: ["gps-devices"] as const,
  lists: () => [...gpsDeviceKeys.all, "list"] as const,
  list: (filters: GPSDeviceFilters, page: number, perPage: number) =>
    [...gpsDeviceKeys.lists(), filters, page, perPage] as const,
  details: () => [...gpsDeviceKeys.all, "detail"] as const,
  detail: (id: number) => [...gpsDeviceKeys.details(), id] as const,
};

/**
 * Hook to fetch GPS devices list with pagination and filters
 */
export function useGPSDevices(
  page: number = 1,
  perPage: number = 10,
  filters: GPSDeviceFilters = {}
) {
  return useQuery({
    queryKey: gpsDeviceKeys.list(filters, page, perPage),
    queryFn: () => GPSDeviceService.listDevices(page, perPage, filters),
    staleTime: 0, // Data is immediately stale, will refetch when needed
    refetchInterval: 60 * 1000, // Refetch every 60 seconds
    refetchOnWindowFocus: true, // Refetch when window regains focus
    refetchOnReconnect: true, // Refetch when network reconnects
  });
}

/**
 * Hook to fetch a single GPS device
 */
export function useGPSDevice(id: number) {
  return useQuery({
    queryKey: gpsDeviceKeys.detail(id),
    queryFn: () => GPSDeviceService.getDevice(id),
    enabled: !!id,
    staleTime: 0, // Data is immediately stale, will refetch when needed
    refetchInterval: 60 * 1000, // Refetch every 60 seconds
    refetchOnWindowFocus: true, // Refetch when window regains focus
    refetchOnReconnect: true, // Refetch when network reconnects
  });
}

/**
 * Hook to create a new GPS device
 */
export function useCreateGPSDevice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateGPSDeviceRequest) =>
      GPSDeviceService.createDevice(data),
    onSuccess: (device) => {
      // Invalidate and refetch GPS devices list
      queryClient.invalidateQueries({ queryKey: gpsDeviceKeys.lists() });
      // Add the new device to cache
      queryClient.setQueryData(gpsDeviceKeys.detail(device.id), device);
      // Invalidate unassigned trucks cache since a truck was just assigned
      queryClient.invalidateQueries({
        queryKey: truckKeys.unassigned(),
        refetchType: 'active'
      });
      toast.success("GPS device created successfully");
    },
    onError: (error: unknown) => {
      toast.error((error as Error).message || "Failed to create GPS device");
    },
  });
}

/**
 * Hook to update a GPS device
 */
export function useUpdateGPSDevice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: UpdateGPSDeviceRequest;
    }) => GPSDeviceService.updateDevice(id, data),
    onSuccess: (device) => {
      // Update the device in cache
      queryClient.setQueryData(gpsDeviceKeys.detail(device.id), device);

      // Update all list queries in cache with the new device data
      // This ensures truck_id and status are immediately visible even if list API doesn't return them
      queryClient.setQueriesData(
        { queryKey: gpsDeviceKeys.lists() },
        (oldData: GPSDeviceListResponse | undefined) => {
          if (!oldData) return oldData;

          // Find and update the device in the items array
          const updatedItems = oldData.items.map((item: GPSDevice) =>
            item.id === device.id
              ? {
                ...item,
                truck_id: device.truck_id,
                status: device.status,
              }
              : item
          );

          return {
            ...oldData,
            items: updatedItems,
          };
        }
      );

      // Also invalidate to refetch in background (in case backend adds truck_id later)
      queryClient.invalidateQueries({
        queryKey: gpsDeviceKeys.lists(),
        refetchType: 'active'
      });

      // Invalidate unassigned trucks cache since assignment changed
      // Force refetch immediately (don't use cache)
      queryClient.invalidateQueries({
        queryKey: truckKeys.unassigned(),
        refetchType: 'active'
      });

      // Also remove from cache to force fresh fetch
      queryClient.removeQueries({
        queryKey: truckKeys.unassigned()
      });

      toast.success("GPS device updated successfully");
    },
    onError: (error: unknown) => {
      toast.error((error as Error).message || "Failed to update GPS device");
    },
  });
}

/**
 * Hook to deactivate a GPS device
 */
export function useDeactivateGPSDevice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => GPSDeviceService.deactivateDevice(id),
    onSuccess: (device) => {
      // Update the device in cache
      queryClient.setQueryData(gpsDeviceKeys.detail(device.id), device);
      // Invalidate lists to refetch
      queryClient.invalidateQueries({ queryKey: gpsDeviceKeys.lists() });
      toast.success("GPS device deactivated successfully");
    },
    onError: (error: unknown) => {
      toast.error((error as Error).message || "Failed to deactivate GPS device");
    },
  });
}

