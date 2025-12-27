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

export interface UpdateTruckRequest extends Partial<CreateTruckRequest> {}

export interface GetTrucksParams {
  page?: number;
  per_page?: number;
  status?: "active" | "inactive" | "maintenance" | "out_of_service" | null;
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
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("document_type", documentType);

    const response = await fetch(`${API_URL}/truck/${id}/documents`, {
      method: "POST",
      body: formData,
      credentials: "include",
    });

    const status = response.status;
    const text = await response.text();
    const result = text ? JSON.parse(text) : undefined;

    if (!response.ok) {
      return {
        error: result?.detail || result?.message || "Failed to upload document",
        status,
      };
    }

    return { data: result as string, status };
  },

  /**
   * Get documents for a truck
   */
  getDocuments: async (id: string) => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    
    const response = await fetch(`${API_URL}/truck/${id}/documents`, {
      method: "GET",
      credentials: "include",
    });

    const status = response.status;
    const text = await response.text();
    const result = text ? JSON.parse(text) : undefined;

    if (!response.ok) {
      return {
        error: result?.detail || result?.message || "Failed to get documents",
        status,
      };
    }

    // API returns an array of documents
    return { data: Array.isArray(result) ? result : [], status };
  },

  /**
   * Delete a document for a truck
   */
  deleteDocument: async (id: string, documentId: string) => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    
    const response = await fetch(`${API_URL}/truck/${id}/documents/${documentId}`, {
      method: "DELETE",
      credentials: "include",
    });

    const status = response.status;

    if (!response.ok) {
      const text = await response.text();
      const result = text ? JSON.parse(text) : undefined;
      return {
        error: result?.detail || result?.message || "Failed to delete document",
        status,
      };
    }

    return { data: { success: true }, status };
  },
};

