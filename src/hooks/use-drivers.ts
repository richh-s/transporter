import { useQuery } from "@tanstack/react-query";
import { driverApi, GetDriversParams } from "@/lib/api/drivers";

export const driverKeys = {
    all: ["drivers"] as const,
    lists: () => [...driverKeys.all, "list"] as const,
    list: (params: GetDriversParams) => [...driverKeys.lists(), params] as const,
};

export function useDrivers(params: GetDriversParams = {}, enabled = true) {
    return useQuery({
        queryKey: driverKeys.list(params),
        queryFn: async () => {
            const response = await driverApi.getDrivers(params);
            if (response.error) throw new Error(response.error);
            return response.data;
        },
        enabled,
    });
}
