export interface CaptchaData {
  captchaId: string;
  imageUrl: string;
}

export interface VerifyCaptchaResponse {
  success: boolean;
  message: string;
  detail?: string;
}

import i18n from "@/i18n";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/** Convert blob to base64 data URL so img works in Capacitor WebView (blob URLs can fail there). */
function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

export const captchaService = {
  // Get CAPTCHA image - using fetch for better header access.
  // In Capacitor WebView the request is cross-origin; backend must allow CORS from the app
  // origin (e.g. https://localhost) and expose: Access-Control-Expose-Headers: X-Captcha-Id
  async getCaptcha(): Promise<CaptchaData> {
    try {
      const captchaUrl = `${API_URL}/auth/captcha`;
      console.log("Fetching CAPTCHA from:", captchaUrl);

      const response = await fetch(captchaUrl, {
        method: "GET",
        credentials: "include",
        headers: {
          "Accept-Language": i18n.language || "en",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Try all header name variations
      const captchaId =
        response.headers.get("X-Captcha-Id") ||
        response.headers.get("x-captcha-id") ||
        response.headers.get("X-CAPTCHA-ID") ||
        response.headers.get("Captcha-Id") ||
        response.headers.get("captcha-id");

      console.log("Extracted CAPTCHA ID:", captchaId);

      if (!captchaId) {
        // Log all available headers for debugging
        console.error("Missing x-captcha-id header.");
        console.error("Response status:", response.status);
        console.error("Response statusText:", response.statusText);

        // Log all headers
        const allHeaders: Record<string, string> = {};
        response.headers.forEach((value, key) => {
          allHeaders[key] = value;
          console.log(`Header: ${key} = ${value}`);
        });
        console.error("All response headers:", allHeaders);

        // Check if CORS is blocking the header
        const exposedHeaders = response.headers.get(
          "Access-Control-Expose-Headers",
        );
        console.warn("CORS Exposed Headers:", exposedHeaders);

        if (
          !exposedHeaders?.includes("X-Captcha-Id") &&
          !exposedHeaders?.includes("x-captcha-id")
        ) {
          throw new Error(
            "Unable to load security code. Please refresh the page or contact support if the problem persists.",
          );
        }

        throw new Error("Unable to load security code. Please try again.");
      }

      const imageBlob = await response.blob();
      // Use base64 data URL so the image displays in Capacitor WebView (blob URLs
      // often fail there due to origin/security).
      const imageUrl = await blobToDataUrl(imageBlob);

      return {
        captchaId,
        imageUrl,
      };
    } catch (error: unknown) {
      console.error("CAPTCHA Fetch Error:", error);
      const errorMsg = (error as Error).message || "Unknown error";

      // Make error messages user-friendly
      if (
        errorMsg.toLowerCase().includes("cors") ||
        errorMsg.toLowerCase().includes("header")
      ) {
        throw new Error(
          "Unable to load security code. Please refresh the page and try again.",
        );
      }

      throw new Error("Unable to load security code. Please try again.");
    }
  },

  // Verify CAPTCHA solution
  async verifyCaptcha(
    captchaId: string,
    solution: string,
  ): Promise<VerifyCaptchaResponse> {
    try {
      const formData = new URLSearchParams();
      formData.append("captcha_id", captchaId);
      formData.append("captcha_solution", solution);

      const verifyUrl = `${API_URL}/auth/verify-captcha`;
      const response = await fetch(verifyUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Accept-Language": i18n.language || "en",
        },
        credentials: "include",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.detail ||
            errorData.message ||
            `HTTP ${response.status}: ${response.statusText}`,
        );
      }

      const data = await response.json();
      return data;
    } catch (error: unknown) {
      const errorMessage =
        (error as Error).message || "Network error during CAPTCHA verification";
      const lowerMsg = errorMessage.toLowerCase();

      // Make error messages user-friendly
      if (
        lowerMsg.includes("invalid") ||
        lowerMsg.includes("incorrect") ||
        lowerMsg.includes("wrong")
      ) {
        throw new Error(
          "The security code you entered is incorrect. Please try again.",
        );
      }

      if (lowerMsg.includes("expired") || lowerMsg.includes("timeout")) {
        throw new Error(
          "The security code has expired. Please get a new code and try again.",
        );
      }

      throw new Error("Unable to verify security code. Please try again.");
    }
  },
};
