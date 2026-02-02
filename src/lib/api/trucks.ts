import { request } from "../api-client";

export interface Truck {
  id: number;
  vin: string;
  plate_number: string;
  status: "active" | "inactive" | "maintenance" | "out_of_service";
  truck_type: "flatbed" | "trailer";
  registration_date: string;
  gov_id: string | null;
  make: string | null;
  model: string | null;
  year: number | null;
  color: string | null;
  capacity_quintal: number;
  libre_key: string | null;
  gps_device_id: number | null;
  created_at?: string;
}

export interface TruckDocument {
  id: number;
  document_type: string;
  file_url?: string;
  presigned_url?: string;
  created_at?: string;
}

export interface CreateTruckRequest {
  vin: string;
  plate_number: string;
  status: "active" | "inactive" | "maintenance" | "out_of_service";
  truck_type: "flatbed" | "trailer";
  registration_date: string;
  gov_id?: string | null;
  make?: string | null;
  model?: string | null;
  year?: number | null;
  color?: string | null;
  capacity_quintal: number;
  libre_key?: string | null;
  gps_device_id?: number | null;
}

export type UpdateTruckRequest = Partial<CreateTruckRequest>;

export interface GetTrucksParams {
  page?: number;
  per_page?: number;
  status?: string | null;
  truck_type?: "flatbed" | "trailer" | null;
  vin?: string | null;
  plate_number?: string | null;
  make?: string | null;
  model?: string | null;
  year?: number | null;
  color?: string | null;
  capacity_quintal?: number | null;
  registration_date?: string | null;
  gov_id?: string | null;
  gps_device_id?: number | null;
}

export interface PaginatedTrucksResponse {
  status: boolean;
  message: string;
  total: number;
  page: number;
  per_page: number;
  pages: number;
  items: Truck[];
}

export const truckApi = {
  /**
   * Get trucks with pagination and filtering
   */
  getTrucks: async (params?: GetTrucksParams) => {
    const queryParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          queryParams.append(key, String(value));
        }
      });
    }

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/truck/?${queryString}` : "/truck/";

    return request<PaginatedTrucksResponse>(endpoint);
  },

  /**
   * Get a single truck by ID
   */
  getTruck: async (id: string) => {
    return request<Truck>(`/truck/${id}/`);
  },

  /**
   * Create a new truck
   */
  createTruck: async (data: CreateTruckRequest) => {
    return request<Truck>("/truck/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * Update an existing truck
   */
  updateTruck: async (id: string, data: UpdateTruckRequest) => {
    return request<Truck>(`/truck/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete a truck
   */
  deleteTruck: async (id: string) => {
    return request<{ message: string }>(`/truck/${id}/`, {
      method: "DELETE",
    });
  },

  /**
   * Upload a document for a truck
   */
  uploadDocument: async (id: string, file: File, documentType: string) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("document_type", documentType);

    return request<string>(`/truck/${id}/documents`, {
      method: "POST",
      body: formData,
    });
  },

  /**
   * Get documents for a truck
   */
  getDocuments: async (id: string) => {
    return request<TruckDocument[]>(`/truck/${id}/documents`);
  },

  /**
   * Get a specific document for a truck
   */
  getDocument: async (id: string, documentId: string) => {
    return request<TruckDocument>(`/truck/${id}/documents/${documentId}`);
  },

  /**
   * Update a document for a truck
   */
  updateDocument: async (id: string, documentId: string, updateData: { document_type?: string; file?: File }) => {
    const formData = new FormData();
    if (updateData.document_type) {
      formData.append("document_type", updateData.document_type);
    }
    if (updateData.file) {
      formData.append("file", updateData.file);
    }

    return request<TruckDocument>(`/truck/${id}/documents/${documentId}`, {
      method: "PATCH",
      body: formData,
    });
  },

  /**
   * Delete a document for a truck
   */
  deleteDocument: async (id: string, documentId: string) => {
    return request<{ success: true }>(`/truck/${id}/documents/${documentId}`, {
      method: "DELETE",
    });
  },
};


