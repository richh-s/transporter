import { useMutation } from "@tanstack/react-query";
import { paymentsApi } from "../api/payments.api";

export function useShipInvoice() {
  return useMutation({
    mutationFn: async (shipId: number | string) => {
      const blob = await paymentsApi.downloadInvoice(shipId);

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");

      a.href = url;
      a.download = `invoice-ship-${shipId}.pdf`;

      document.body.appendChild(a);
      a.click();

      a.remove();
      window.URL.revokeObjectURL(url);
    },
  });
}
