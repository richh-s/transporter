// src/zod/driver/update-driver.schema.ts

import { z } from "zod";

export const updateDriverSchema = z.object({
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  phone_number: z.string().min(7).optional(),
  email: z.string().email().optional(),
  driver_license_number: z.string().min(3).optional(),
  status: z.enum(["active", "inactive"]).optional(),
});

export type UpdateDriverInput = z.infer<
  typeof updateDriverSchema
>;
