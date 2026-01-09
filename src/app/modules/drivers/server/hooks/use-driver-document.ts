import { useQuery } from "@tanstack/react-query";
import { driverApi } from "../api/driver.api";
import { driverDocumentSchema } from "@/lib/zod/driver";
import { driverKeys } from "../query-keys";

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
      const data = await driverApi.getDriverDocument(
        driverId!,
        documentId!
      );
      return driverDocumentSchema.parse(data);
    },
  });
}
