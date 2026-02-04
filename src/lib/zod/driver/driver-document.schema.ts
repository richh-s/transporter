import { z } from "zod";

export const driverDocumentSchema = z.object({
  id: z.number(),

  document_type: z.enum(["driver_id", "driver_license", "other"]),

  status: z.enum(["pending", "approved", "rejected"]).optional().nullable(),

  file_path: z.string().optional().nullable(),

  // backend sends this for viewing
  presigned_url: z.string().optional().nullable(),

  created_at: z.string().optional().nullable(),
});

export type DriverDocument = z.infer<typeof driverDocumentSchema>;


