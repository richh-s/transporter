import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { shipApi, GetShipsParams, AssignTruckRequest, AssignDriverRequest } from "@/lib/api/ships";
import { toast } from "sonner";

export const shipKeys = {
    all: ["ships"] as const,
    lists: () => [...shipKeys.all, "list"] as const,
    list: (params: GetShipsParams) => [...shipKeys.lists(), params] as const,
    details: () => [...shipKeys.all, "detail"] as const,
    detail: (id: string | number) => [...shipKeys.details(), id] as const,
    items: {
        all: () => [...shipKeys.all, "items"] as const,
        lists: () => [...shipKeys.items.all(), "list"] as const,
        list: (params: Record<string, unknown>) => [...shipKeys.items.lists(), params] as const,
    }
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

export function useShipItems(params: Record<string, unknown> = {}) {
    return useQuery({
        queryKey: shipKeys.items.list(params),
        queryFn: async () => {
            const response = await shipApi.getShipItems(params);
            if (response.error) throw new Error(response.error);
            return response.data;
        },
    });
}

export function useAssignTruck(shipId: string | number) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ shipItemId, data }: { shipItemId: number | string; data: AssignTruckRequest }) => {
            const response = await shipApi.assignTruck(shipItemId, data);
            if (response.error) throw new Error(response.error);
            if (response.data && response.data.status === false) {
                throw new Error(response.data.message || "Failed to assign truck");
            }
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: shipKeys.detail(shipId) });
            queryClient.invalidateQueries({ queryKey: shipKeys.items.all() });
            toast.success("Truck assigned successfully");
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to assign truck");
        },
    });
}

export function useAssignDriver(shipId: string | number) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ shipItemId, data }: { shipItemId: number | string; data: AssignDriverRequest }) => {
            const response = await shipApi.assignDriver(shipItemId, data);
            if (response.error) throw new Error(response.error);
            if (response.data && response.data.status === false) {
                throw new Error(response.data.message || "Failed to assign driver");
            }
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: shipKeys.detail(shipId) });
            queryClient.invalidateQueries({ queryKey: shipKeys.items.all() });
            toast.success("Driver assigned successfully");
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to assign driver");
        },
    });
}
