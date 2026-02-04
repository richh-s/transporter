import { request, tokenStorage } from "../api-client";
import { apiRequest } from "../api";
import {
  Ship,
  ShipDocument,
  ShipItem,
  ShipItemDocument,
  PaymentResponse,
  CreateOrderRequest,
  CreateOrderResponse,
  ShipDocumentsResponse,
} from "@/types/ship";

/**
 * Get authorization headers with Bearer token
 */
function getAuthHeaders(): Record<string, string> {
  const token = tokenStorage.getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export interface BaseResponse {
  status: boolean;
  message: string;
}

export interface GetShipsParams {
  page?: number;
  per_page?: number;
  ship_id?: number | string;
  transporter_id?: number | string;
  truck_id?: number | string;
  driver_id?: number | string;
}

export interface GetShipItemsParams {
  page?: number;
  per_page?: number;
  ship_id?: number | string;
  transporter_id?: number | string;
  truck_id?: number | string;
  driver_id?: number | string;
}

export interface PaginatedShipItemsResponse {
  status: boolean;
  message: string;
  total: number;
  page: number;
  pages: number;
  per_page: number;
  items: ShipItem[];
}

export interface PaginatedShipsResponse {
  status: boolean;
  message: string;
  total: number;
  page: number;
  pages: number;
  per_page: number;
  items: Ship[];
}

export interface AssignTruckRequest {
  truck_id: number;
}

export interface AssignDriverRequest {
  driver_id: number;
}

export interface PaginatedDocumentsResponse {
  status: boolean;
  message: string;
  total: number;
  page: number;
  pages: number;
  per_page: number;
  items: ShipDocument[];
}

export interface ShipperInfo {
  name: string;
  email: string;
  phone: string;
}

export interface ShipperInfoResponse {
  status: boolean;
  error_message: string | null;
  success_message: string;
  result: ShipperInfo;
}

export interface GetShipperInfoParams {
  ship_id: number | string;
  payment_id: number | string;
}

export const shipApi = {
  /**
   * Get assigned ships for transporter
   */
  getShips: async (params?: GetShipsParams) => {
    const queryParams = new URLSearchParams();
    if (params) {
      if (params.page) queryParams.append("page", params.page.toString());
      if (params.per_page)
        queryParams.append("per_page", params.per_page.toString());
    }
    const queryString = queryParams.toString();
    const endpoint = queryString
      ? `/ship/transporter/?${queryString}`
      : "/ship/transporter/";

    return request<PaginatedShipsResponse>(endpoint);
  },

  /**
   * Get ship items (assignments)
   */
  getShipItems: async (params?: GetShipItemsParams) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          queryParams.append(key, String(value));
        }
      });
    }
    const queryString = queryParams.toString();
    const endpoint = queryString
      ? `/transporter/ship-item/?${queryString}`
      : "/transporter/ship-item/";
    return request<PaginatedShipItemsResponse>(endpoint);
  },

  /**
   * Get ship details for transporter
   */
  getShip: async (id: number | string) => {
    return request<Ship>(`/ship/transporter/${id}/?per_page=100`);
  },

  /**
   * Get specific ship item details
   */
  getShipItem: async (id: number | string) => {
    return request<ShipItem>(`/ship-item/${id}/`);
  },

  /**
   * Assign truck to ship item
   */
  assignTruck: async (
    shipItemId: number | string,
    data: AssignTruckRequest,
  ) => {
    return request<BaseResponse>(
      `/ship-item/${shipItemId}/assign_truck?truck_id=${data.truck_id}`,
      {
        method: "PATCH",
      },
    );
  },

  /**
   * Assign driver to ship item
   */
  assignDriver: async (
    shipItemId: number | string,
    data: AssignDriverRequest,
  ) => {
    return request<BaseResponse>(
      `/ship-item/${shipItemId}/assign_driver?driver_id=${data.driver_id}`,
      {
        method: "PATCH",
      },
    );
  },

  /**
   * @deprecated Use assignTruck and assignDriver instead
   * Assign driver and truck to ship item
   */
  assignResources: async (
    shipItemId: number | string,
    data: { driver_id?: number; truck_id?: number },
  ) => {
    return request<BaseResponse>(`/ship-item/${shipItemId}/assign`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  /**
   * Get ship documents
   */
  getDocuments: async (shipId: number | string) => {
    return request<ShipDocumentsResponse>(`/ship/transporter/${shipId}/documents`);
  },

  /**
   * Get document download URL (or handle download)
   * Note: The API returns a binary stream. For simplicity in frontend, we might just open the URL.
   * But if we need to authenticate via headers, we use this.
   */
  downloadDocument: async (
    shipId: number | string,
    documentId: number | string,
  ) => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    return `${API_URL}/ship/${shipId}/documents/${documentId}/download`;
  },

  /**
   * Get list of payments for a ship
   * GET /api/v1/ship/transporter/{ship_id}/payment
   */
  getPayments: async (shipId: number | string) => {
    return request<PaymentResponse[]>(`/ship/transporter/${shipId}/payment`);
  },

  /**
   * Create Telebirr payment order
   * POST /api/v1/transporter/createOrder
   */
  createPaymentOrder: async (data: CreateOrderRequest) => {
    return request<CreateOrderResponse>(`/transporter/createOrder`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * Get invoice PDF for a ship
   * GET /api/v1/transporter/ship/{ship_id}/invoice
   * Returns a PDF blob
   */
  getInvoice: async (shipId: number | string): Promise<Blob> => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    const response = await fetch(
      `${API_URL}/transporter/ship/${shipId}/invoice`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          ...getAuthHeaders(),
          Accept: "application/pdf",
        },
      },
    );

    if (!response.ok) {
      // Try to parse error response as JSON
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        try {
          const errorData = await response.json() as Record<string, unknown>;
          // Throw a structured error with the API error message
          const error = new Error((errorData.error as string) || (errorData.message as string) || "Failed to fetch invoice");
          (error as Error & { code?: string }).code = errorData.code as string;
          (error as Error & { status_code?: number }).status_code = (errorData.status_code as number) || response.status;
          throw error;
        } catch (parseError) {
          // If JSON parsing fails, throw the original error
          if (parseError instanceof Error && parseError.message !== "Failed to fetch invoice") {
            throw parseError;
          }
        }
      }
      throw new Error(`Failed to fetch invoice: ${response.statusText}`);
    }

    return response.blob();
  },

  /**
   * Get documents for a specific ship item
   */
  getShipItemDocuments: async (
    shipItemId: number | string,
    params?: { container_id?: number },
  ) => {
    const queryParams = new URLSearchParams();
    if (params?.container_id) {
      queryParams.append("container_id", params.container_id.toString());
    }
    const queryString = queryParams.toString();
    const endpoint = queryString
      ? `/ship-item/${shipItemId}/documents/?${queryString}`
      : `/ship-item/${shipItemId}/documents/`;

    return request<ShipItemDocument[]>(endpoint);
  },

  /**
   * Upload a document for a ship item
   */
  uploadShipItemDocument: async (
    shipItemId: number | string,
    formData: FormData,
  ) => {
    const endpoint = `/ship-item/${shipItemId}/documents/`;

    // Log the endpoint and form data
    console.log("📤 POD Upload - Endpoint:", endpoint);
    console.log("📤 POD Upload - FormData contents:");
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`  ${key}:`, value.name, `(${value.size} bytes, ${value.type})`);
      } else {
        console.log(`  ${key}:`, value);
      }
    }

    // Use apiRequest which handles JWT authentication automatically
    return apiRequest<Record<string, unknown>>(endpoint, {
      method: "POST",
      body: formData,
    });
  },

  /**
   * Delete a ship item document
   */
  deleteShipItemDocument: async (
    shipItemId: number | string,
    documentId: number | string,
  ) => {
    return request<void>(`/ship-item/${shipItemId}/documents/${documentId}/`, {
      method: "DELETE",
    });
  },

  getShipItemDetail: async (shipId: number | string) => {
    return request<Ship>(`/ship/transporter/${shipId}/?per_page=100`);
  },

  /**
   * Get shipper info after payment
   */
  getShipperInfo: async (params: GetShipperInfoParams) => {
    const queryParams = new URLSearchParams();
    queryParams.append("ship_id", params.ship_id.toString());
    queryParams.append("payment_id", params.payment_id.toString());

    return request<ShipperInfoResponse>(`/transporter/shipper-info?${queryParams.toString()}`);
  },
};
