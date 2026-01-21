export type PaymentStatus = "unpaid" | "paid";

export interface ShipPayment {
  id: number;
  total: number;
  vat: number;
  status: PaymentStatus;
  currency: string;
  created_at?: string;
}
