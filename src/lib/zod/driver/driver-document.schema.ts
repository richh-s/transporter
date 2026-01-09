import { z } from "zod";

export const driverDocumentSchema = z.object({
  id: z.number(),

  document_type: z.enum([
    "trade_licence",
    "id",
    "other",
  ]),

  status: z.enum([
    "pending",
    "approved",
    "rejected",
  ]),

  file_path: z.string(),

  // backend sends this for viewing
  presigned_url: z.string().url().optional(),

  created_at: z.string(),
});

export type DriverDocument = z.infer<typeof driverDocumentSchema>;
