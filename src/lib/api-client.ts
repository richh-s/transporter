const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error(
    "NEXT_PUBLIC_API_URL is not defined. Check your .env.local file.",
  );
}

export type ApiResponse<T> = {
  data?: T;
  error?: string;
  status: number;
  errorCode?: string; // Error code from backend (e.g., "MISSING_DOCUMENTS")
  code?: string;
  fields?: Record<string, string>;
};

// Token storage keys
const ACCESS_TOKEN_KEY = "wetruck_access_token";
const REFRESH_TOKEN_KEY = "wetruck_refresh_token";

/**
 * Token management utilities for Capacitor app
 * Uses localStorage instead of cookies for cross-origin compatibility
 */
export const tokenStorage = {
  getAccessToken: (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  getRefreshToken: (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  setTokens: (accessToken: string, refreshToken: string) => {
    if (typeof window === "undefined") return;
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  },

  setAccessToken: (accessToken: string) => {
    if (typeof window === "undefined") return;
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  },

  clearTokens: () => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};

/**
 * Logs out the user by clearing local data and redirecting
 */
async function logout() {
  if (typeof window !== "undefined") {
    // Clear tokens and user data
    tokenStorage.clearTokens();
    localStorage.removeItem("wetruck_user");

    // Only redirect if not already on sign-in page (prevent infinite loop)
    if (!window.location.pathname.includes("/sign-in")) {
      window.location.href = "/sign-in";
    }
  }
}

/**
 * Attempts to refresh the access token using the stored refresh token
 * @returns true if refresh successful, false otherwise
 */
async function tryRefreshToken(): Promise<boolean> {
  try {
    console.log("🔄 Attempting to refresh access token...");

    const refreshToken = tokenStorage.getRefreshToken();

    if (!refreshToken) {
      console.warn("❌ No refresh token available");
      return false;
    }

    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (response.ok) {
      const data = await response.json();
      // Store the new access token (and refresh token if provided)
      if (data.access_token) {
        tokenStorage.setAccessToken(data.access_token);
        if (data.refresh_token) {
          tokenStorage.setTokens(data.access_token, data.refresh_token);
        }
      }
      console.log("✅ Token refreshed successfully");
      return true;
    } else {
      console.warn("❌ Token refresh failed:", response.status);
      return false;
    }
  } catch (error) {
    console.error("❌ Token refresh error:", error);
    return false;
  }
}

/**
 * Makes an authenticated API request with automatic token refresh
 * Uses Bearer token from localStorage for Capacitor app compatibility
 */
export async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  isRetry = false,
): Promise<ApiResponse<T>> {
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  // Only set Content-Type for non-FormData requests
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  // Add Authorization header if we have a token (except for login/register endpoints)
  const isPublicEndpoint =
    endpoint === "/auth/login" || endpoint === "/auth/register";
  const accessToken = tokenStorage.getAccessToken();

  if (!isPublicEndpoint && accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  try {
    const url = `${API_URL}${endpoint}`;

    // Debug logging in development
    if (process.env.NODE_ENV === "development") {
      console.log("📡 Request:", options.method || "GET", url);
    }

    const response = await fetch(url, {
      ...options,
      headers,
      credentials: "include", // Still include for backwards compatibility
    });

    const status = response.status;

    // Handle 401 Unauthorized - Try to refresh token first
    if (status === 401 && !isRetry) {
      console.warn("⚠️ Received 401 - Access token expired or invalid");

      // Don't try refresh on login/refresh endpoints (that's just invalid credentials)
      const isAuthEndpoint =
        endpoint === "/auth/login" || endpoint === "/auth/refresh";

      if (!isAuthEndpoint) {
        // Try to refresh the token
        const refreshed = await tryRefreshToken();

        if (refreshed) {
          // Token refreshed! Retry the original request
          console.log("🔁 Retrying original request with new token...");
          return request<T>(endpoint, options, true); // Set isRetry = true
        } else {
          // Refresh failed - logout
          console.log("🚪 Refresh failed - logging out...");
          await logout();
        }
      }
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
      return {
        error:
          ((result as unknown) as Record<string, unknown>)?.error as string ||
          ((result as unknown) as Record<string, unknown>)?.detail as string ||
          ((result as unknown) as Record<string, unknown>)?.message as string ||
          (typeof result === "string" ? result : "Something went wrong"),
        status,
        errorCode: ((result as unknown) as Record<string, unknown>)?.code as string || undefined,
        code: (((result as unknown) as Record<string, unknown>)?.code as string) || (((result as unknown) as Record<string, unknown>)?.status_code as string)?.toString(),
        fields: ((result as unknown) as Record<string, unknown>)?.fields as Record<string, string>,
      };
    }

    return { data: (result ?? { status: true }) as T, status };
  } catch (error) {
    console.error("❌ API Request Failed:", error);

    let errorMessage = "Network error - Unable to connect to server";

    if (error instanceof TypeError) {
      errorMessage = "Cannot connect to backend. Is the server running?";
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    return {
      error: errorMessage,
      status: 500,
    };
  }
}
