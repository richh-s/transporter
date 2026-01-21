export const paymentQueryKeys = {
    all: ["payments"] as const,
    ship: (shipId: number | string) =>
      [...paymentQueryKeys.all, "ship", shipId] as const,
  };
  