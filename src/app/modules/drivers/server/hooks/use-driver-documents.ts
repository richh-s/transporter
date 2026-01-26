import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { driverApi } from "../api/driver.api";
import { driverKeys } from "../query-keys";
import { driverDocumentSchema } from "@/lib/zod/driver";
import type { DriverDocument } from "../types";

const listSchema = z.array(driverDocumentSchema);

export function useDriverDocuments(driverId?: number) {
  return useQuery({
    queryKey: driverId
      ? driverKeys.documents(driverId)
      : ["drivers", "documents", "missing"],

    enabled: !!driverId,
    staleTime: 0,

    queryFn: async (): Promise<DriverDocument[]> => {
      const data = await driverApi.getDriverDocuments(driverId!);
      return listSchema.parse(data);
    },
  });
}
