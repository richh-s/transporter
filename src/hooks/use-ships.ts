import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { shipApi, GetShipsParams, AssignTruckRequest, AssignDriverRequest } from "@/lib/api/ships";
import { CreateOrderRequest } from "@/types/ship";
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
    },
    payments: (shipId: string | number) => [...shipKeys.all, "payments", shipId] as const,
    documents: (shipId: string | number) => [...shipKeys.all, "documents", shipId] as const,
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

            // Handle API-level error (from ApiResponse wrapper)
            if (response.error) {
                throw new Error(response.error);
            }

            // Handle structured error responses in data
            if (response.data) {
                const data = response.data as unknown as Record<string, unknown>;
                if (data.status === false) {
                    throw new Error((data.error as string) || (data.message as string) || "Failed to assign truck");
                }
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

            // Handle API-level error (from ApiResponse wrapper)
            if (response.error) {
                throw new Error(response.error);
            }

            // Handle structured error responses in data
            if (response.data) {
                const data = response.data as unknown as Record<string, unknown>;
                if (data.status === false) {
                    throw new Error((data.error as string) || (data.message as string) || "Failed to assign driver");
                }
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

/**
 * Hook to fetch payments for a ship
 */
export function useShipPayments(shipId: string | number) {
    return useQuery({
        queryKey: shipKeys.payments(shipId),
        queryFn: async () => {
            if (!shipId) return null;
            const response = await shipApi.getPayments(shipId);
            if (response.error) throw new Error(response.error);
            return response.data;
        },
        enabled: !!shipId,
    });
}

/**
 * Hook to create a payment order
 */
export function useCreatePaymentOrder(shipId: string | number) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: CreateOrderRequest) => {
            const response = await shipApi.createPaymentOrder(data);
            if (response.error) {
                throw new Error(response.error);
            }
            if (response.data && response.data.status === false) {
                throw new Error(response.data.error_message || "Failed to create payment order");
            }
            return response.data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: shipKeys.payments(shipId) });
            queryClient.invalidateQueries({ queryKey: shipKeys.detail(shipId) });

            // Open payment URL in new tab
            if (data?.result?.payment_url) {
                toast.success("Opening payment gateway in new tab...");
                window.open(data.result.payment_url, '_blank');
            } else {
                toast.error("Payment URL not received from server");
            }
        },
        onError: (error: Error) => {
            const errorMsg = error.message;
            if (errorMsg.includes("NO_UNPAID_PAYMENT") || errorMsg.includes("No unpaid payment")) {
                toast.error("This payment has already been paid or does not exist");
            } else if (errorMsg.includes("Telebirr")) {
                toast.error("Payment gateway is temporarily unavailable. Please try again later.");
            } else if (errorMsg.includes("Not authenticated")) {
                toast.error("Please log in to continue");
            } else {
                toast.error(errorMsg || "Failed to create payment order");
            }
        },
    });
}
/**
 * Hook to fetch documents for a ship
 */
export function useShipDocuments(shipId: string | number) {
    return useQuery({
        queryKey: shipKeys.documents(shipId),
        queryFn: async () => {
            if (!shipId) return null;
            const response = await shipApi.getDocuments(shipId);
            if (response.error) throw new Error(response.error);
            return response.data;
        },
        enabled: !!shipId,
    });
}
