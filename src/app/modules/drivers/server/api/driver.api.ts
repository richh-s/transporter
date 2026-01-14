import { apiRequest } from "@/lib/api";
import type {
  DriversResponse,
  Driver,
  DriverDocument,
  CreateDriverPayload,
  UpdateDriverPayload,
  ApiResult,
} from "../types";

// helpers
function toQueryString(params?: Record<string, unknown>) {
  if (!params) return "";
  const search = new URLSearchParams(
    Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== "")
      .map(([k, v]) => [k, String(v)])
  );
  return search.toString() ? `?${search}` : "";
}
// driver api
export const driverApi = {
  // drivers
  getDrivers: (params?: Record<string, unknown>) =>
    apiRequest<DriversResponse>(`/driver${toQueryString(params)}`),

  getDriver: (id: number) =>
    apiRequest<ApiResult<Driver>>(`/driver/${id}`),

  createDriver: (payload: CreateDriverPayload) =>
    apiRequest<ApiResult<Driver>>(`/driver`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  updateDriver: (id: number, payload: UpdateDriverPayload) =>
    apiRequest<ApiResult<Driver>>(`/driver/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  deleteDriver: (id: number) =>
    apiRequest<ApiResult<null>>(`/driver/${id}`, {
      method: "DELETE",
    }),

  // docs

  // list
  getDriverDocuments: (driverId: number) =>
    apiRequest<ApiResult<DriverDocument[]>>(
      `/driver/${driverId}/documents`
    ),

  // get single
  getDriverDocument: (driverId: number, documentId: number) =>
    apiRequest<DriverDocument>(
      `/driver/${driverId}/documents/${documentId}`
    ),

  //upload
  uploadDriverDocument: (
    driverId: number,
    payload: { document_type: string; file: File }
  ) => {
    const formData = new FormData();
    formData.append("document_type", payload.document_type);
    formData.append("file", payload.file);

    return apiRequest<ApiResult<DriverDocument>>(
      `/driver/${driverId}/documents`,
      {
        method: "POST",
        body: formData,
      }
    );
  },

  // delete
  deleteDriverDocument: (driverId: number, documentId: number) =>
    apiRequest<ApiResult<null>>(
      `/driver/${driverId}/documents/${documentId}`,
      { method: "DELETE" }
    ),
};