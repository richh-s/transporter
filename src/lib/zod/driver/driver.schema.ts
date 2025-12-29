import { z } from "zod";

/* =====================
   Driver Entity
===================== */
export const driverSchema = z.object({
  id: z.number(),
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  phone_number: z.string().min(7),
  email: z.string().email(),
  driver_license_number: z.string().min(3),
  status: z.enum(["active", "inactive"]),
});

export type Driver = z.infer<typeof driverSchema>;
