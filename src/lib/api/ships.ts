import { request } from "../api-client";
import { Ship, ShipDocument } from "@/types/ship";

export interface BaseResponse {
    status: boolean;
    message: string;
}

export interface GetShipsParams {
    page?: number;
    per_page?: number;
    origin?: string;
    destination?: string;
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

export const shipApi = {
    /**
     * Get assigned ships for transporter
     */
    getShips: async (params?: GetShipsParams) => {
        const queryParams = new URLSearchParams();

        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== "") {
                    queryParams.append(key, String(value));
                }
            });
        }

        const queryString = queryParams.toString();
        const endpoint = queryString ? `/ship/transporter/?${queryString}` : "/ship/transporter/";

        return request<PaginatedShipsResponse>(endpoint);
    },

    /**
     * Get ship details for transporter
     */
    getShip: async (id: number | string) => {
        return request<Ship>(`/ship/transporter/${id}/`);
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
        return request<any>(`/ship-item/${shipItemId}/assign`, {
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
    }
};
