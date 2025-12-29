// src/zod/driver/list-drivers.schema.ts

import { z } from "zod";
import { driverSchema } from "./driver.schema";

export const listDriversSchema = z.object({
  data: z.array(driverSchema),
  page: z.number(),
  per_page: z.number(),
  total: z.number(),
});

export type ListDriversResponse = z.infer<
  typeof listDriversSchema
>;
