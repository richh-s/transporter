import { z } from "zod";

export const RefreshTokenResponseSchema = z.object({
  access_token: z.string(),
  token_type: z.literal("bearer"),
  expires_in: z.number(),
});

export type RefreshTokenResponse = z.infer<
  typeof RefreshTokenResponseSchema
>;
