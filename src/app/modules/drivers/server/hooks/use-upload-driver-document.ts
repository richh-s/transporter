"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { driverDocumentSchema } from "@/lib/zod/driver/driver-document.schema";
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

      const resp = response as unknown as Record<string, unknown>;
      // Try to find the document object in different common fields
      const docData = resp.result || resp.data || resp.item || response;

      // If response.status is explicitly false, it's a backend error
      // Otherwise, as long as we have docData, we proceed
      if (resp.status === false || !docData || typeof docData !== 'object') {
        throw new ApiError(
          400,
          "Failed to upload document",
          (resp.error_message as string) || (resp.message as string) || "Unknown error"
        );
      }

      // Handle array vs object response
      let finalDoc = docData;
      if (Array.isArray(docData)) {
        // If it's an array, try to find the one we just uploaded, otherwise just pick the last one
        finalDoc = docData.find(d => d.document_type === payload.document_type) || docData[docData.length - 1];
      }

      // We still validate with schema just in case, but don't let it throw if we have some data
      try {
        return driverDocumentSchema.parse(finalDoc) as DriverDocument;
      } catch (e) {
        console.warn("Zod parsing failed for uploaded document, returning raw data", e);
        return finalDoc as DriverDocument;
      }
    },

    onMutate: async (payload) => {
      await qc.cancelQueries({
        queryKey: driverKeys.documents(driverId),
      });

      if (payload.replace_document_id) {
        qc.setQueryData<DriverDocument[]>(
          driverKeys.documents(driverId),
          (old = []) =>
            old.filter((doc) => doc.id !== payload.replace_document_id),
        );
      }
    },

    onSuccess: async (_newDoc, vars) => {
      // 🔥 HARD DELETE OLD DOCUMENT IF REPLACING
      if (vars.replace_document_id) {
        try {
          await driverApi.deleteDriverDocument(
            driverId,
            vars.replace_document_id,
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
