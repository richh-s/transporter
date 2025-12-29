import { useQuery } from "@tanstack/react-query";
import { driverApi } from "../api/driver.api";
import { driverDocumentSchema } from "@/lib/zod/driver";
import { z } from "zod";
import { driverKeys } from "../query-keys";

const listSchema = z.array(driverDocumentSchema);

export function useDriverDocuments(driverId?: number) {
  return useQuery({
    queryKey: driverId
      ? driverKeys.documents(driverId)
      : ["drivers", "documents", "missing"],
    enabled: !!driverId,
    staleTime: 0,
    queryFn: async () => {
      const data = await driverApi.getDriverDocuments(driverId!);
      return listSchema.parse(data);
    },
  });
}
