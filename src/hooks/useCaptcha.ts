import { useState, useCallback, useRef, useEffect } from "react";
import { captchaService, CaptchaData } from "@/services/captchaService";

interface UseCaptchaReturn {
  captchaData: CaptchaData | null;
  isLoading: boolean;
  error: string;
  isVerified: boolean;
  fetchCaptcha: () => Promise<void>;
  verifyCaptcha: (solution: string) => Promise<boolean>;
  resetCaptcha: () => void;
  cleanup: () => void;
}

export const useCaptcha = (): UseCaptchaReturn => {
  const [captchaData, setCaptchaData] = useState<CaptchaData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchCaptcha = useCallback(async () => {
    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setIsLoading(true);
    setError("");

    try {
      const data = await captchaService.getCaptcha();
      setCaptchaData(data);
      setIsVerified(false);
    } catch (err: unknown) {
      if ((err as Error).name !== "AbortError") {
        setError((err as Error).message);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const verifyCaptcha = useCallback(
    async (solution: string) => {
      if (!captchaData?.captchaId) {
        setError("No CAPTCHA available");
        return false;
      }

      setIsLoading(true);
      setError("");

      try {
        await captchaService.verifyCaptcha(captchaData.captchaId, solution);
        setIsVerified(true);
        return true;
      } catch (err: unknown) {
        setError((err as Error).message);
        // Auto-refresh CAPTCHA on failure
        setTimeout(fetchCaptcha, 1500);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [captchaData, fetchCaptcha],
  );

  const resetCaptcha = useCallback(() => {
    setCaptchaData(null);
    setIsVerified(false);
    setError("");
    fetchCaptcha();
  }, [fetchCaptcha]);

  // Store imageUrl in ref to avoid dependency issues
  const imageUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (captchaData?.imageUrl) {
      // Revoke old blob URL only (data URLs are not created by createObjectURL)
      if (imageUrlRef.current?.startsWith("blob:")) {
        URL.revokeObjectURL(imageUrlRef.current);
      }
      imageUrlRef.current = captchaData.imageUrl;
    }
  }, [captchaData?.imageUrl]);

  // Cleanup on unmount
  const cleanup = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (imageUrlRef.current?.startsWith("blob:")) {
      URL.revokeObjectURL(imageUrlRef.current);
    }
    imageUrlRef.current = null;
  }, []);

  return {
    captchaData,
    isLoading,
    error,
    isVerified,
    fetchCaptcha,
    verifyCaptcha,
    resetCaptcha,
    cleanup,
  };
};
