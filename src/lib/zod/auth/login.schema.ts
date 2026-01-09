import { z } from "zod";
import { TransporterRoleSchema } from "../common/role.schema";

export const LoginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: TransporterRoleSchema, 
});

export const LoginResponseSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
  token_type: z.literal("bearer"),
  expires_in: z.number(),
  role: TransporterRoleSchema,
});

export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type LoginResponse = z.infer<typeof LoginResponseSchema>;
