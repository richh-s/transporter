import { apiRequest } from "@/lib/api";
import type {
  DriversResponse,
  Driver,
  DriverDocument,
  CreateDriverPayload,
  UpdateDriverPayload,
  ApiResult,
} from "../types";

/* =========================
   Helpers
========================= */
function toQueryString(params?: Record<string, any>) {
  if (!params) return "";
  const search = new URLSearchParams(
    Object.entries(params).filter(
      ([_, v]) => v !== undefined && v !== ""
    )
  );
  return search.toString() ? `?${search}` : "";
}

/* =========================
   Driver API (FINAL - Updated)
========================= */
export const driverApi = {
  /* ---------- Drivers ---------- */
  getDrivers: (params?: Record<string, any>) =>
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

  /* ---------- Documents ---------- */

  // LIST: returns array wrapped in ApiResult
  getDriverDocuments: (driverId: number) =>
    apiRequest<ApiResult<DriverDocument[]>>(
      `/driver/${driverId}/documents`
    ),

  // GET SINGLE: returns raw DriverDocument directly (NOT wrapped in ApiResult)
  getDriverDocument: (driverId: number, documentId: number) =>
    apiRequest<DriverDocument>( // ← Changed from ApiResult<DriverDocument>
      `/driver/${driverId}/documents/${documentId}`
    ),

  // UPLOAD: returns wrapped in ApiResult
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

  // DELETE: returns null wrapped in ApiResult
  deleteDriverDocument: (driverId: number, documentId: number) =>
    apiRequest<ApiResult<null>>(
      `/driver/${driverId}/documents/${documentId}`,
      { method: "DELETE" }
    ),
};