import { useQuery } from "@tanstack/react-query";
import { paymentsApi } from "../api/payments.api";
import { paymentQueryKeys } from "../query-keys";
import { ShipPayment } from "../types";

export function useShipPayment(shipId?: number | string) {
  return useQuery<ShipPayment[]>({
    queryKey: paymentQueryKeys.ship(shipId ?? "unknown"),
    queryFn: () => paymentsApi.getShipPayment(shipId!),
    enabled: !!shipId,
    retry: false,
  });
}
