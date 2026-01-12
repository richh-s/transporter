import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { shipApi, GetShipsParams, AssignTruckRequest, AssignDriverRequest } from "@/lib/api/ships";
import { toast } from "sonner";

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

export function useAssignTruck(shipId: string | number) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ shipItemId, data }: { shipItemId: number | string; data: AssignTruckRequest }) =>
            shipApi.assignTruck(shipItemId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: shipKeys.detail(shipId) });
            toast.success("Truck assigned successfully");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to assign truck");
        },
    });
}

export function useAssignDriver(shipId: string | number) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ shipItemId, data }: { shipItemId: number | string; data: AssignDriverRequest }) =>
            shipApi.assignDriver(shipItemId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: shipKeys.detail(shipId) });
            toast.success("Driver assigned successfully");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to assign driver");
        },
    });
}
