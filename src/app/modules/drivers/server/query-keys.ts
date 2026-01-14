export const driverKeys = {
  all: ["drivers"] as const,

  list: (params: Record<string, unknown>) =>
    ["drivers", "list", params] as const,

  detail: (id: number | string) =>
    ["drivers", "detail", id] as const,

  documents: (driverId: number | string) =>
    ["drivers", "documents", driverId] as const,

  document: (driverId: number | string, documentId: number | string) =>
    ["drivers", "documents", driverId, documentId] as const,
};
