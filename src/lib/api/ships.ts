import { request } from "../api-client";
import { apiRequest } from "../api";
import { Ship, ShipDocument, ShipItem, PaymentResponse, CreateOrderRequest, CreateOrderResponse, ShipItemDocument } from "@/types/ship";

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
            if (params.per_page) queryParams.append("per_page", params.per_page.toString());
        }
        const queryString = queryParams.toString();
        const endpoint = queryString ? `/ship/transporter/?${queryString}` : "/ship/transporter/";

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
        const endpoint = queryString ? `/transporter/ship-item/?${queryString}` : "/transporter/ship-item/";
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
    assignTruck: async (shipItemId: number | string, data: AssignTruckRequest) => {
        return request<BaseResponse>(`/ship-item/${shipItemId}/assign_truck?truck_id=${data.truck_id}`, {
            method: "PATCH",
        });
    },

    /**
     * Assign driver to ship item
     */
    assignDriver: async (shipItemId: number | string, data: AssignDriverRequest) => {
        return request<BaseResponse>(`/ship-item/${shipItemId}/assign_driver?driver_id=${data.driver_id}`, {
            method: "PATCH",
        });
    },

    /**
     * @deprecated Use assignTruck and assignDriver instead
     * Assign driver and truck to ship item
     */
    assignResources: async (shipItemId: number | string, data: { driver_id?: number; truck_id?: number }) => {
        return request<BaseResponse>(`/ship-item/${shipItemId}/assign`, {
            method: "PATCH",
            body: JSON.stringify(data),
        });
    },

    /**
     * Get ship documents
     */
    getDocuments: async (shipId: number | string, params?: { page?: number; per_page?: number }) => {
        const queryParams = new URLSearchParams();
        if (params) {
            if (params.page) queryParams.append("page", params.page.toString());
            if (params.per_page) queryParams.append("per_page", params.per_page.toString());
        }
        const queryString = queryParams.toString();
        const endpoint = queryString ? `/ship/${shipId}/documents?${queryString}` : `/ship/${shipId}/documents`;
        return request<PaginatedDocumentsResponse>(endpoint);
    },

    /**
     * Get document download URL (or handle download)
     * Note: The API returns a binary stream. For simplicity in frontend, we might just open the URL.
     * But if we need to authenticate via headers, we use this.
     */
    downloadDocument: async (shipId: number | string, documentId: number | string) => {
        // Since it's a binary stream, we might need a blob. 
        // api-client.ts request assumes JSON response.
        // We might need a custom fetch here or just construct the URL if cookies are used.
        // The docs say "Response: Binary file stream".
        // Let's assume we can just point to the URL if cookies handle auth? 
        // "Uses HttpOnly cookies for authentication" -> Yes.
        // So window.open(`${API_URL}/ship/${shipId}/documents/${documentId}/download`) should work.
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
        const response = await fetch(`${API_URL}/transporter/ship/${shipId}/invoice`, {
            method: "GET",
            credentials: "include", // Include cookies for authentication
            headers: {
                "Accept": "application/pdf",
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch invoice: ${response.statusText}`);
        }

        return response.blob();
    },

    /**
     * Get documents for a specific ship item
     */
    getShipItemDocuments: async (shipItemId: number | string, params?: { container_id?: number }) => {
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
        formData: FormData
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
        return apiRequest<any>(endpoint, {
            method: "POST",
            body: formData,
        });
    },

    /**
     * Delete a ship item document
     */
    deleteShipItemDocument: async (shipItemId: number | string, documentId: number | string) => {
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
