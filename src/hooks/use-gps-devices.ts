import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { GPSDeviceService } from "@/lib/gps-device-api";
import type {
  GPSDevice,
  CreateGPSDeviceRequest,
  UpdateGPSDeviceRequest,
  GPSDeviceFilters,
} from "@/types/gps-device";
import { toast } from "sonner";

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
  perPage: number = 20,
  filters: GPSDeviceFilters = {}
) {
  return useQuery({
    queryKey: gpsDeviceKeys.list(filters, page, perPage),
    queryFn: () => GPSDeviceService.listDevices(page, perPage, filters),
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
      toast.success("GPS device created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create GPS device");
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
      // Invalidate lists to refetch
      queryClient.invalidateQueries({ queryKey: gpsDeviceKeys.lists() });
      toast.success("GPS device updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update GPS device");
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
    onError: (error: Error) => {
      toast.error(error.message || "Failed to deactivate GPS device");
    },
  });
}

