// src/zod/driver/update-driver.schema.ts

import { z } from "zod";

export const updateDriverSchema = z.object({
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  phone_number: z
    .string()
    .regex(/^\+251\d{9}$/, "Must be in format like +251XXXXXXXXX")
    .optional(),
  email: z.string().email().optional(),
  driver_license_number: z.string().min(3).optional(),
  status: z.enum(["active", "suspended"]).optional(),
});

export type UpdateDriverInput = z.infer<
  typeof updateDriverSchema
>;
