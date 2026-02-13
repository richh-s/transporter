import { z } from "zod";

/* =====================
   Driver Entity
===================== */
export const driverSchema = z.object({
  id: z.number(),
  first_name: z.any(),
  last_name: z.any(),
  phone_number: z.any(),
  email: z.any(),
  driver_license_number: z.any(),
  status: z.enum(["active", "suspended"]),
  assigend: z.any(),
  organization_id: z.any(),
}).passthrough();

export type Driver = z.infer<typeof driverSchema>;
