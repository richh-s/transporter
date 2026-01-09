"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { driverDocumentSchema } from "@/lib/zod/driver";
import { driverKeys } from "../query-keys";
import type { DriverDocument } from "../types";
import { driverApi } from "../api/driver.api";

const API_BASE = process.env.NEXT_PUBLIC_API_URL!;

type UploadInput = {
  document_type: string;
  file: File;
  replace_document_id?: number;
};

export function useUploadDriverDocument(driverId: number) {
  const qc = useQueryClient();

  return useMutation<DriverDocument, unknown, UploadInput>({
    mutationFn: async (payload) => {
      const formData = new FormData();
      formData.append("document_type", payload.document_type);
      formData.append("file", payload.file);

      if (payload.replace_document_id !== undefined) {
        formData.append(
          "replace_document_id",
          String(payload.replace_document_id)
        );
      }

      const res = await fetch(`${API_BASE}/driver/${driverId}/documents`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!res.ok) throw await res.json();

      const data = await res.json();
      return driverDocumentSchema.parse(data);
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
      // 🔥 HARD DELETE OLD DOCUMENT
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
