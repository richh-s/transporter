import { useQuery } from "@tanstack/react-query";
import { driverApi } from "../api/driver.api";
import { driverKeys } from "../query-keys";
import type { DriverDocument } from "../types";
import { driverDocumentSchema } from "@/lib/zod/driver/driver-document.schema";

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

    queryFn: async () => {
      const response = await driverApi.getDriverDocument(
        driverId!,
        documentId!
      );
      // Assuming it might return ApiResult or direct object
      const docData = (response as unknown as Record<string, unknown>).result || response;
      return driverDocumentSchema.parse(docData) as DriverDocument;
    },
  });
}
