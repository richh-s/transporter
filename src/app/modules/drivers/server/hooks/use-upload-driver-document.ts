"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { driverDocumentSchema } from "@/lib/zod/driver";
import { driverKeys } from "../query-keys";
import type { DriverDocument } from "../types";
import { driverApi } from "../api/driver.api";

import { ApiError } from "@/lib/api";

type UploadInput = {
  document_type: string;
  file: File;
  replace_document_id?: number;
};

export function useUploadDriverDocument(driverId: number) {
  const qc = useQueryClient();

  return useMutation<DriverDocument, ApiError, UploadInput>({
    mutationFn: async (payload) => {
      // Use the centralized driverApi instead of raw fetch
      const response = await driverApi.uploadDriverDocument(driverId, {
        document_type: payload.document_type,
        file: payload.file,
      });

      // Try to find the document object in different common fields
      const docData = (response as any).result || (response as any).data || (response as any).item || response;

      // If response.status is explicitly false, it's a backend error
      // Otherwise, as long as we have docData, we proceed
      if ((response as any).status === false || !docData || typeof docData !== 'object') {
        throw new ApiError(
          400,
          "Failed to upload document",
          (response as any).error_message || (response as any).message || "Unknown error"
        );
      }

      // We still validate with schema just in case
      return driverDocumentSchema.parse(docData) as DriverDocument;
    },

    onMutate: async (payload) => {
      await qc.cancelQueries({
        queryKey: driverKeys.documents(driverId),
      });

      if (payload.replace_document_id) {
        qc.setQueryData<DriverDocument[]>(
          driverKeys.documents(driverId),
          (old = []) =>
            old.filter(
              (doc) => doc.id !== payload.replace_document_id
            )
        );
      }
    },

    onSuccess: async (_newDoc, vars) => {
      // 🔥 HARD DELETE OLD DOCUMENT IF REPLACING
      if (vars.replace_document_id) {
        try {
          await driverApi.deleteDriverDocument(
            driverId,
            vars.replace_document_id
          );
        } catch (e) {
          console.error("Failed to delete old document", e);
        }
      }

      qc.invalidateQueries({
        queryKey: driverKeys.documents(driverId),
      });
    },
  });
}
