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
      try {
        console.log(`🔍 Fetching driver details for ID: ${id}`);
        const res = await driverApi.getDriver(id!);
        console.log("📦 Raw Driver API Response:", res);

        if (!res.status || !res.result) {
          throw new Error(res.error_message || "Driver not found API returned status false");
        }

        const parsed = driverSchema.parse(res.result);
        console.log("✅ Parsed Driver Data:", parsed);
        return parsed;
      } catch (error) {
        console.error("❌ Driver Detail Fetch Error:", error);
        throw error;
      }
    },
  });
}
