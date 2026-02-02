import { useQuery } from "@tanstack/react-query";
import { shipApi } from "@/lib/api/ships";

interface UseShipperInfoParams {
    ship_id: number | string;
    payment_id: number | string | null;
    enabled?: boolean;
}

export const useShipperInfo = ({ ship_id, payment_id, enabled = true }: UseShipperInfoParams) => {
    return useQuery({
        queryKey: ["shipper-info", ship_id, payment_id],
        queryFn: async () => {
            if (!payment_id) throw new Error("Payment ID is required");
            const response = await shipApi.getShipperInfo({ ship_id, payment_id });

            // The API client returns { data: ShipperInfoResponse, status: number }
            // The data contains { status: true, result: { name, email, phone } }
            if (response.data) {
                return response.data;
            }

            throw new Error(response.error || "Failed to fetch shipper info");
        },
        enabled: enabled && !!payment_id && !!ship_id,
        retry: 1,
    });
};
