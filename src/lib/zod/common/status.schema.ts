import { z } from "zod";

export const StatusSchema = z.enum([
  "active",
  "inactive",
  "suspended",
]);

export type Status = z.infer<typeof StatusSchema>;
