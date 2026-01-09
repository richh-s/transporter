// src/zod/driver/create-driver.schema.ts

import { z } from "zod";

export const createDriverSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  phone_number: z.string().min(7, "Invalid phone number"),
  email: z.string().email("Invalid email"),
  driver_license_number: z.string().min(3, "License number is required"),
});

export type CreateDriverInput = z.infer<
  typeof createDriverSchema
>;
