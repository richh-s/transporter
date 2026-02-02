import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { driverApi } from "../api/driver.api";
import { driverKeys } from "../query-keys";
import type { DriverDocument } from "../types";
import { driverDocumentSchema } from "@/lib/zod/driver/driver-document.schema";

const listSchema = z.array(driverDocumentSchema);

export function useDriverDocuments(driverId?: number) {
  return useQuery({
    queryKey: driverId
      ? driverKeys.documents(driverId)
      : ["drivers", "documents", "missing"],

    enabled: !!driverId,
    staleTime: 0,
    queryFn: async () => {
      const response = await driverApi.getDriverDocuments(driverId!);

      let data: any = null;
      if (Array.isArray(response)) {
        data = response;
      } else if (response && typeof response === "object") {
        data = (response as any).result || (response as any).items || (response as any).data;
        if ((response as any).status === false && !data) return [];
      }

      if (!data || !Array.isArray(data)) {
        return [];
      }

      return listSchema.parse(data) as DriverDocument[];
    },
  });
}
