import { useQuery } from "@tanstack/react-query";
import { driverApi } from "../api/driver.api";
import { driverKeys } from "../query-keys";
import { driverDocumentSchema } from "@/lib/zod/driver";
import type { DriverDocument } from "../types";

export function useDriverDocument(
  driverId?: number,
  documentId?: number
) {
  return useQuery({
    queryKey:
      driverId && documentId
        ? driverKeys.document(driverId, documentId)
        : ["drivers", "document", "missing"],

    enabled: !!driverId && !!documentId,
    staleTime: 0,

    queryFn: async (): Promise<DriverDocument> => {
      const data = await driverApi.getDriverDocument(
        driverId!,
        documentId!
      );
      return driverDocumentSchema.parse(data);
    },
  });
}
