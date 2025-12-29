"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { driverDocumentSchema } from "@/lib/zod/driver";
import { driverKeys } from "../query-keys";

const API_BASE = process.env.NEXT_PUBLIC_API_URL!;

type UploadDriverDocumentInput = {
  document_type: string;
  file: File;
  replace_document_id?: number;
};

export function useUploadDriverDocument(driverId: number) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UploadDriverDocumentInput) => {
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

    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: driverKeys.documents(driverId),
      });
    },
  });
}
