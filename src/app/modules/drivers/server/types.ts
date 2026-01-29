export type { DriverDocument } from "@/lib/zod/driver";

export type DriverStatus = "active" | "inactive";

export interface Driver {
  id: number;
  first_name: string;
  last_name: string;
  phone_number: string;
  email: string;
  driver_license_number: string;
  status: DriverStatus;
}

export interface DriverListResponse {
  data: Driver[];
  page: number;
  per_page: number;
  total: number;
}

export interface CreateDriverPayload {
  first_name: string;
  last_name: string;
  phone_number: string;
  email: string;
  driver_license_number: string;
}
export type DriversResponse = {
  status: boolean;
  message: string;
  total: number;
  page: number;
  per_page: number;
  pages: number;
  items: Driver[];
};


export interface UpdateDriverPayload extends Partial<CreateDriverPayload> {
  status?: DriverStatus;
}


export interface ApiResult<T> {
    status: boolean;
    success_message?: string;
    error_message?: string | null;
    result: T;
  }
  