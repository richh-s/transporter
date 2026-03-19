import { request } from "../api-client";
import { Driver } from "@/types/ship";

export interface GetDriversParams {
  page?: number;
  per_page?: number;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  email?: string;
  driver_license_number?: string;
  status?: string;
}

export interface PaginatedDriversResponse {
  status: boolean;
  message: string;
  total: number;
  page: number;
  pages: number;
  per_page: number;
  items: Driver[];
}

export const driverApi = {
  /**
   * Get a single driver by ID
   */
  getDriver: async (id: number | string) => {
    return request<Driver>(`/driver/${id}`);
  },

  /**
   * Get drivers with pagination and filtering
   */
  getDrivers: async (params?: GetDriversParams) => {
    const queryParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          queryParams.append(key, String(value));
        }
      });
    }

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/driver/?${queryString}` : "/driver/";

    return request<PaginatedDriversResponse>(endpoint);
  },
};
