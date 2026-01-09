import { driverDocumentSchema } from "@/lib/zod/driver";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export async function useUpdateDriverDocument(
  driverId: number,
  documentId: number,
  payload: {
    document_type?: string;
    file?: File;
  }
) {
  const formData = new FormData();

  if (payload.document_type) {
    formData.append("document_type", payload.document_type);
  }
  if (payload.file) {
    formData.append("file", payload.file);
  }

  const res = await fetch(
    `${API_BASE}/driver/${driverId}/documents/${documentId}`,
    {
      method: "PATCH",
      credentials: "include",
      body: formData,
    }
  );

  if (!res.ok) throw await res.json();

  const data = await res.json();
  return driverDocumentSchema.parse(data);
}
