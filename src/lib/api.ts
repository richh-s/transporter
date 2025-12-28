
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error("NEXT_PUBLIC_API_BASE_URL is not defined");
}

interface RequestOptions extends RequestInit {
  requireAuth?: boolean;
}

/* ---------------- ERROR CLASS ---------------- */

export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/* ---------------- CORE REQUEST ---------------- */

async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { requireAuth = true, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(fetchOptions.headers as Record<string, string>),
  };

  // Transporter app uses access token
  if (requireAuth) {
    const token = sessionStorage.getItem("access_token");
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...fetchOptions,
      headers,
      credentials: "include", // important if backend uses cookies
    });
  } catch (error) {
    throw new Error(
      `Network error: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }

  const contentType = response.headers.get("content-type");
  const isJson = contentType?.includes("application/json");

  if (!response.ok) {
    const errorBody = isJson ? await response.json() : null;

    const message =
      errorBody?.detail ||
      errorBody?.message ||
      response.statusText ||
      "Request failed";

    throw new ApiError(response.status, response.statusText, message);
  }

  return isJson ? (await response.json()) : ({} as T);
}

/* ---------------- API METHODS ---------------- */

export const api = {
  /* ---------- AUTH ---------- */

  login: (email: string, password: string) =>
    apiRequest<{
      access_token: string;
      refresh_token: string;
      token_type: "bearer";
      expires_in: number;
      role: "transporter";
    }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email,
        password,
        role: "transporter",
      }),
      requireAuth: false,
    }),

  logout: () =>
    apiRequest<{ message: string }>("/auth/logout", {
      method: "POST",
    }),

  me: () =>
    apiRequest<{
      id: number;
      username: string;
      email: string;
      phone: string | null;
      first_name: string | null;
      last_name: string | null;
      full_name: string;
      user_type: "transporter";
      transporter_id: number;
      organization_id: number | null;
      created_at: string;
      updated_at: string;
    }>("/auth/me"),

  refresh: (refreshToken: string) =>
    apiRequest<{
      access_token: string;
      token_type: "bearer";
      expires_in: number;
    }>("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refresh_token: refreshToken }),
      requireAuth: false,
    }),

//  TRANSPORTER DOMAIN ---------- */

  getTrucks: () =>
    apiRequest("/truck"),

  getDrivers: () =>
    apiRequest("/driver"),

  getOrders: () =>
    apiRequest("/order"),

  getOrderById: (id: string) =>
    apiRequest(`/order/${id}`),

  updateOrderStatus: (id: string, status: string) =>
    apiRequest(`/order/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
};

export default api;
