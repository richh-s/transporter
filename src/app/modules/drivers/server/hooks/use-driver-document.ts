import { useQuery } from "@tanstack/react-query";
import { driverApi } from "../api/driver.api";
import { driverKeys } from "../query-keys";
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

    queryFn: async () => {
      const response = await driverApi.getDriverDocument(
        driverId!,
        documentId!
      );
      // Assuming it might return ApiResult or direct object
      const docData = (response as any).result || response;
      return driverDocumentSchema.parse(docData) as DriverDocument;
    },
  });
}
