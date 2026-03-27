/* =====================================================
   API TRANSPORT LAYER (SINGLE SOURCE OF TRUTH)
===================================================== */

import { tokenStorage } from "./api-client";
import i18n from "@/i18n";

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
    public code?: string,
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
    "Accept-Language": i18n.language || "en",
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

  if (response.status === 204) {
    return { status: true } as T;
  }

  const text = await response.text();
  let result: unknown;

  if (text) {
    try {
      result = JSON.parse(text);
    } catch {
      result = text;
    }
  }

  if (!response.ok) {
    throw new ApiError(
      response.status,
      response.statusText,
      ((result as unknown as Record<string, unknown>)?.detail as string) ||
        ((result as unknown as Record<string, unknown>)?.error as string) ||
        ((result as unknown as Record<string, unknown>)?.message as string) ||
        (typeof result === "string" ? result : response.statusText) ||
        "Request failed",
      (result as unknown as Record<string, unknown>)?.fields as Record<
        string,
        string
      >,
      ((result as unknown as Record<string, unknown>)?.code as string) ||
        (
          (result as unknown as Record<string, unknown>)?.status_code as string
        )?.toString(),
    );
  }

  return (result ?? { status: true }) as T;
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
