import { request } from "@/lib/api-client";
import { ShipPayment } from "../types";

export const paymentsApi = {

  async getShipPayment(
    shipId: number | string
  ): Promise<ShipPayment[]> {
    const res = await request<ShipPayment[]>(
      `/ship/transporter/${shipId}/payment`
    );

    if (res.error) {
      throw new Error(res.error);
    }

    return res.data ?? [];
  },

  async downloadInvoice(shipId: number | string): Promise<Blob> {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/transporter/ship/${shipId}/invoice`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          Accept: "application/pdf",
        },
      }
    );

    if (!res.ok) {
      throw new Error("Failed to download invoice");
    }

    return await res.blob();
  },
};
