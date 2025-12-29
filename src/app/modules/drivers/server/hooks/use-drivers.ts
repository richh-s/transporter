import { useQuery } from "@tanstack/react-query";
import { driverApi } from "../api/driver.api";
import { driverKeys } from "../query-keys";
import type { DriversResponse } from "../types";

export function useDrivers(params?: Record<string, any>) {
  return useQuery<DriversResponse>({
    queryKey: driverKeys.list(params ?? {}),
    queryFn: () => driverApi.getDrivers(params),
    placeholderData: (prev) => prev,
    staleTime: 0,
  });
}
