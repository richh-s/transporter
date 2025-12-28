import { z } from "zod";

export const TransporterRoleSchema = z.enum(["transporter"]);

export type TransporterRole = z.infer<typeof TransporterRoleSchema>;
