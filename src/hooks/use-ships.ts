import { useQuery } from "@tanstack/react-query";
import { shipApi, GetShipsParams } from "@/lib/api/ships";

export const shipKeys = {
    all: ["ships"] as const,
    lists: () => [...shipKeys.all, "list"] as const,
    list: (params: GetShipsParams) => [...shipKeys.lists(), params] as const,
    details: () => [...shipKeys.all, "detail"] as const,
    detail: (id: string | number) => [...shipKeys.details(), id] as const,
};

export function useShips(params: GetShipsParams = {}) {
    return useQuery({
        queryKey: shipKeys.list(params),
        queryFn: async () => {
            const response = await shipApi.getShips(params);
            if (response.error) throw new Error(response.error);
            return response.data;
        },
    });
}

export function useShip(id: string | number) {
    return useQuery({
        queryKey: shipKeys.detail(id),
        queryFn: async () => {
            if (!id) return null;
            const response = await shipApi.getShip(id);
            if (response.error) throw new Error(response.error);
            return response.data;
        },
        enabled: !!id,
    });
}
