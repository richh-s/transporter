"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { driverKeys } from "../query-keys";
import { driverDocumentSchema } from "@/lib/zod/driver";
import type { DriverDocument } from "../types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL!;

type UpdateInput = {
  documentId: number;
  document_type?: DriverDocument["document_type"];
  file?: File;
};

export function useUpdateDriverDocument(driverId: number) {
  const qc = useQueryClient();

  return useMutation<DriverDocument, unknown, UpdateInput>({
    mutationFn: async ({ documentId, document_type, file }) => {
      const formData = new FormData();

      if (document_type) formData.append("document_type", document_type);
      if (file) formData.append("file", file);

      const res = await fetch(
        `${API_BASE}/driver/${driverId}/documents/${documentId}`,
        {
          method: "PATCH",
          credentials: "include",
          body: formData,
        }
      );

      if (!res.ok) throw await res.json();

      return driverDocumentSchema.parse(await res.json());
    },

    onSuccess: (updatedDoc) => {
      qc.setQueryData(
        driverKeys.documents(driverId),
        (old: DriverDocument[] = []) =>
          old.map((doc) =>
            doc.id === updatedDoc.id ? updatedDoc : doc
          )
      );
    },
  });
}
