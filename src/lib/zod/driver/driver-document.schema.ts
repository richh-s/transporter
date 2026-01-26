import { z } from "zod";

export const driverDocumentSchema = z.object({
  id: z.number(),

  entity_type: z.literal("driver"),

  document_type: z.enum([
    "driver_id",
    "driver_license",
    "trade_licence",
    "libre",          // 🔥 MISSING BEFORE
    "other",
  ]),

  status: z.enum(["pending", "approved", "rejected"]),

  file_path: z.string(),
  file_ext: z.string(),

  presigned_url: z.string().url().optional(),

  driver_id: z.number(),
  truck_id: z.number().nullable(),
  organization_id: z.number(),

  deleted: z.boolean(),
  rejection_reason: z.string().nullable(),
  expired_at: z.string().nullable(),

  created_at: z.string(),
  updated_at: z.string(),
});

export type DriverDocument = z.infer<typeof driverDocumentSchema>;


