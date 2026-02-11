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

      let data: unknown = null;
      if (Array.isArray(response)) {
        data = response;
      } else if (response && typeof response === "object") {
        const resObj = response as unknown as Record<string, unknown>;
        data = resObj.result || resObj.items || resObj.data;
        if (resObj.status === false && !data) return [];
      }

      if (!data || !Array.isArray(data)) {
        return [];
      }

      const documents = listSchema.parse(data) as DriverDocument[];

      // Filter to show only the latest document of each type
      const latestDocs: Record<string, DriverDocument> = {};

      documents.forEach((doc) => {
        const type = doc.document_type;
        // Use created_at to determine which document is the latest
        const docDate = doc.created_at ? new Date(doc.created_at).getTime() : 0;
        const currentLatestDate = latestDocs[type]?.created_at
          ? new Date(latestDocs[type].created_at!).getTime()
          : -1;

        if (docDate > currentLatestDate) {
          latestDocs[type] = doc;
        }
      });

      return Object.values(latestDocs);
    },
  });
}
