/* =====================================================
   API TRANSPORT LAYER (SINGLE SOURCE OF TRUTH)
===================================================== */

import { tokenStorage } from "./api-client";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_BASE_URL) {
  throw new Error("NEXT_PUBLIC_API_URL is not defined");
}

export type RequestOptions = RequestInit & {
  requireAuth?: boolean;
};

/* ================= ERROR ================= */

export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    message: string,
    public fields?: Record<string, string>,
    public code?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/* ================= CORE REQUEST ================= */

export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const { requireAuth = true, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    ...(fetchOptions.headers as Record<string, string>),
  };

  // ✅ Handle JSON vs FormData automatically
  const isFormData =
    typeof FormData !== "undefined" && fetchOptions.body instanceof FormData;

  if (!isFormData) {
    headers["Content-Type"] ??= "application/json";
  }

  // ✅ Auth header - use tokenStorage (localStorage) for consistency
  if (requireAuth && typeof window !== "undefined") {
    const token = tokenStorage.getAccessToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
    credentials: "include",
  });

  const contentType = response.headers.get("content-type");
  const isJson = contentType?.includes("application/json");

  if (!response.ok) {
    const errorBody = isJson ? await response.json() : null;

    throw new ApiError(
      response.status,
      response.statusText,
      errorBody?.detail ||
      errorBody?.error ||
      errorBody?.message ||
      response.statusText ||
      "Request failed",
      errorBody?.fields,
      errorBody?.code || errorBody?.status_code?.toString()
    );
  }

  return isJson ? await response.json() : ({} as T);
}

/* ================= AUTH API =================
   (Auth is global, stays here)
============================================= */

export const authApi = {
  login: (email: string, password: string) =>
    apiRequest<{
      access_token: string;
      refresh_token: string;
      token_type: "bearer";
      expires_in: number;
      role: "transporter";
    }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password, role: "transporter" }),
      requireAuth: false,
    }),

  logout: () =>
    apiRequest<{ message: string }>("/auth/logout", {
      method: "POST",
    }),

  me: () =>
    apiRequest<{
      id: number;
      email: string;
      first_name: string | null;
      last_name: string | null;
      transporter_id: number;
      organization_id: number | null;
    }>("/auth/me"),

  refresh: (refreshToken: string) =>
    apiRequest<{
      access_token: string;
      expires_in: number;
      token_type: "bearer";
    }>("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refresh_token: refreshToken }),
      requireAuth: false,
    }),
};
