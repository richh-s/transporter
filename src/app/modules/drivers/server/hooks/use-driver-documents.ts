import { useQuery } from "@tanstack/react-query";
import { driverApi } from "../api/driver.api";
import { driverKeys } from "../query-keys";
import type { DriverDocument } from "../types";

export function useDriverDocuments(driverId?: number) {
  return useQuery<DriverDocument[]>({
    queryKey: driverId
      ? driverKeys.documents(driverId)
      : ["drivers", "documents", "missing"],

    enabled: !!driverId,
    staleTime: 0,

    queryFn: async () => {
      return await driverApi.getDriverDocuments(driverId!);
    },
  });
}
