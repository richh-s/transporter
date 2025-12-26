// GPS Device Types based on API documentation

export interface GPSDevice {
  id: number;
  organization_id: number;
  external_device_id: string;
  imei_number: string;
  device_name: string | null;
  device_model: string | null;
  expire_date: string; // ISO 8601 datetime
  last_synced_at: string; // ISO 8601 datetime
  status: boolean;
  created_at: string; // ISO 8601 datetime
  updated_at: string; // ISO 8601 datetime
  truck_id?: number; // Optional, may be present in some responses
}

export interface CreateGPSDeviceRequest {
  external_device_id: string;
  imei_number: string;
  device_name?: string;
  device_model?: string;
  expire_date: string; // ISO 8601 datetime
  last_synced_at: string; // ISO 8601 datetime
  status?: boolean;
  truck_id: number;
}

export interface UpdateGPSDeviceRequest {
  external_device_id?: string;
  imei_number?: string;
  device_name?: string;
  device_model?: string;
  expire_date?: string; // ISO 8601 datetime
  last_synced_at?: string; // ISO 8601 datetime
  status?: boolean;
  truck_id?: number; // Use 0 to unlink, or truck_id to assign
}

export interface GPSDeviceListResponse {
  status: boolean;
  message: string;
  items: GPSDevice[];
  total: number;
  page: number;
  per_page: number;
  pages: number;
}

export interface GPSDeviceCreateResponse {
  status: boolean;
  success_message: string;
  result: GPSDevice;
}

export interface GPSDeviceUpdateResponse {
  status: boolean;
  success_message: string;
  result: GPSDevice;
}

export interface GPSDeviceDeactivateResponse {
  status: boolean;
  success_message: string;
  result: GPSDevice;
}

export interface GPSDeviceFilters {
  external_device_id?: string;
  imei_number?: string;
  device_name?: string;
  device_model?: string;
  status?: boolean;
}

export interface Truck {
  id: number;
  license_plate: string;
  // Add other truck fields as needed
}

