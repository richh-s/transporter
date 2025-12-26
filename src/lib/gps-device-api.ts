import { request } from "./api-client";
import type {
    GPSDevice,
    CreateGPSDeviceRequest,
    UpdateGPSDeviceRequest,
    GPSDeviceListResponse,
    GPSDeviceCreateResponse,
    GPSDeviceUpdateResponse,
    GPSDeviceDeactivateResponse,
    GPSDeviceFilters,
} from "@/types/gps-device";

/**
 * GPS Device API Service
 * Handles all API calls for GPS device management
 */
export class GPSDeviceService {
    /**
     * Create a new GPS device
     */
    static async createDevice(
        deviceData: CreateGPSDeviceRequest
    ): Promise<GPSDevice> {
        const { data, error } = await request<GPSDeviceCreateResponse>(
            "/gps-devices/",
            {
                method: "POST",
                body: JSON.stringify(deviceData),
            }
        );

        if (error) {
            throw new Error(error);
        }

        if (!data?.result) {
            throw new Error("Failed to create GPS device");
        }

        return data.result;
    }

    /**
     * List GPS devices with pagination and filters
     */
    static async listDevices(
        page: number = 1,
        perPage: number = 20,
        filters: GPSDeviceFilters = {}
    ): Promise<GPSDeviceListResponse> {
        const params = new URLSearchParams({
            page: page.toString(),
            per_page: perPage.toString(),
        });

        // Add filters to query params
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== "") {
                params.append(key, value.toString());
            }
        });

        const { data, error } = await request<GPSDeviceListResponse>(
            `/gps-devices/?${params.toString()}`
        );

        if (error) {
            throw new Error(error);
        }

        if (!data) {
            throw new Error("Failed to fetch GPS devices");
        }

        return data;
    }

    /**
     * Get a single GPS device by ID
     */
    static async getDevice(id: number): Promise<GPSDevice> {
        const { data, error, status } = await request<GPSDevice>(
            `/gps-devices/${id}`
        );

        if (error) {
            if (status === 404) {
                throw new Error("GPS device not found");
            }
            throw new Error(error);
        }

        if (!data) {
            throw new Error("Failed to fetch GPS device");
        }

        return data;
    }

    /**
     * Update GPS device metadata
     */
    static async updateDevice(
        id: number,
        updateData: UpdateGPSDeviceRequest
    ): Promise<GPSDevice> {
        const { data, error } = await request<GPSDeviceUpdateResponse>(
            `/gps-devices/${id}`,
            {
                method: "PUT",
                body: JSON.stringify(updateData),
            }
        );

        if (error) {
            throw new Error(error);
        }

        if (!data?.result) {
            throw new Error("Failed to update GPS device");
        }

        return data.result;
    }

    /**
     * Deactivate a GPS device
     */
    static async deactivateDevice(id: number): Promise<GPSDevice> {
        const { data, error } = await request<GPSDeviceDeactivateResponse>(
            `/gps-devices/${id}/deactivate`,
            {
                method: "PATCH",
            }
        );

        if (error) {
            throw new Error(error);
        }

        if (!data?.result) {
            throw new Error("Failed to deactivate GPS device");
        }

        return data.result;
    }
}

