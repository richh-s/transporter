import { useQuery } from "@tanstack/react-query";
import { truckApi, GetTrucksParams } from "@/lib/api/trucks";

export const truckQueryKeys = {
    all: ["trucks-query"] as const,
    lists: () => [...truckQueryKeys.all, "list"] as const,
    list: (params: GetTrucksParams) => [...truckQueryKeys.lists(), params] as const,
};

export function useTrucksQuery(params: GetTrucksParams = {}) {
    return useQuery({
        queryKey: truckQueryKeys.list(params),
        queryFn: async () => {
            const response = await truckApi.getTrucks(params);
            if (response.error) throw new Error(response.error);
            return response.data;
        },
    });
}
