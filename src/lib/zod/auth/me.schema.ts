import { z } from "zod";
import { TransporterRoleSchema } from "../common/role.schema";
import { StatusSchema } from "../common/status.schema";

export const MeSchema = z.object({
  id: z.number(),
  username: z.string(),
  email: z.string().email(),
  phone: z.string().nullable(),

  first_name: z.string().nullable(),
  last_name: z.string().nullable(),
  full_name: z.string(),

  user_type: TransporterRoleSchema, 
  status: StatusSchema,

  transporter_id: z.number(), 
  organization_id: z.number().nullable(),

  created_at: z.string(),
  updated_at: z.string(),
});

export type Me = z.infer<typeof MeSchema>;
