import { useQuery } from "@tanstack/react-query";
import { driverApi } from "../api/driver.api";
import { driverSchema } from "@/lib/zod/driver";
import { driverKeys } from "../query-keys";

export function useDriver(id?: number) {
  return useQuery({
    queryKey: id
      ? driverKeys.detail(id)
      : ["drivers", "detail", "missing"],
    enabled: !!id,
    staleTime: 0,
    queryFn: async () => {
      const res = await driverApi.getDriver(id!);
      return driverSchema.parse(res.result);
    },
  });
}
