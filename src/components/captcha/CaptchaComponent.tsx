'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useCaptcha } from '@/hooks/useCaptcha';
import { RefreshCw, Loader2 } from 'lucide-react';

interface CaptchaComponentProps {
  onCaptchaVerified?: (captchaId: string, solution: string) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
  showRefreshButton?: boolean;
  deferVerification?: boolean;
  onRefreshReady?: (refreshFn: () => void) => void;
}

const CaptchaComponent: React.FC<CaptchaComponentProps> = ({
  onCaptchaVerified,
  onError,
  disabled = false,
  showRefreshButton = true,
  deferVerification = false,
  onRefreshReady,
}) => {
  const [userInput, setUserInput] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);
  const {
    captchaData,
    isLoading,
    error: hookError,
    isVerified,
    fetchCaptcha,
    verifyCaptcha,
    cleanup,
  } = useCaptcha();

  // Initial fetch - only run once on mount
  useEffect(() => {
    fetchCaptcha();

    // Auto-refresh every 55 seconds if not verified
    const interval = setInterval(() => {
      fetchCaptcha();
    }, 55000);

    return () => {
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  // Expose refresh function to parent
  useEffect(() => {
    if (onRefreshReady) {
      onRefreshReady(() => {
        fetchCaptcha();
        setUserInput('');
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onRefreshReady]); // Only when onRefreshReady changes

  // Handle errors
  useEffect(() => {
    if (hookError && onError) {
      onError(hookError);
    }
  }, [hookError, onError]);

  // Focus input after loading new captcha
  useEffect(() => {
    if (captchaData?.imageUrl && !isLoading && !isVerified) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [captchaData, isLoading, isVerified]);

  // Handle verification success
  useEffect(() => {
    if (isVerified && captchaData && onCaptchaVerified) {
      onCaptchaVerified(captchaData.captchaId, userInput);
    }
  }, [isVerified, captchaData, userInput, onCaptchaVerified]);

  // Call onCaptchaVerified when captcha loads and user has input (for deferVerification)
  // Only trigger when userInput changes and has valid length (not on captchaData change)
  useEffect(() => {
    if (deferVerification && captchaData && userInput.trim().length >= 6 && onCaptchaVerified) {
      onCaptchaVerified(captchaData.captchaId, userInput);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userInput]); // Only trigger on userInput changes, not captchaData

  // Clear input when captcha refreshes (only when captchaId actually changes)
  const prevCaptchaIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (captchaData?.captchaId && captchaData.captchaId !== prevCaptchaIdRef.current) {
      prevCaptchaIdRef.current = captchaData.captchaId;
      setUserInput('');
    }
  }, [captchaData?.captchaId]);

  const handleVerify = async () => {
    if (!userInput.trim()) {
      return;
    }

    if (deferVerification && captchaData && onCaptchaVerified) {
      onCaptchaVerified(captchaData.captchaId, userInput);
      return;
    }

    await verifyCaptcha(userInput);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    setUserInput(value);

    // If deferVerification is true, call onCaptchaVerified when user completes 6 characters
    if (deferVerification && captchaData && value.trim().length >= 6 && onCaptchaVerified) {
      onCaptchaVerified(captchaData.captchaId, value);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !disabled && !isVerified) {
      handleVerify();
    }
  };


  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label htmlFor="captcha-input" className="text-xs font-semibold uppercase tracking-wider text-gray-500">
          Security Code
        </label>
        {showRefreshButton && (
          <button
            type="button"
            onClick={() => fetchCaptcha()}
            disabled={isLoading || disabled}
            className="p-1.5 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Refresh CAPTCHA"
            title="Refresh CAPTCHA"
          >
            {isLoading ? (
              <Loader2 className="h-3.5 w-3.5 text-gray-600 animate-spin" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5 text-gray-600" />
            )}
          </button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <div className="flex-1 relative border border-gray-200 rounded-md overflow-hidden bg-gray-50 flex items-center justify-center min-h-[60px]">
          {captchaData?.imageUrl ? (
            <img
              src={captchaData.imageUrl}
              alt="CAPTCHA"
              className="max-h-[60px] w-auto"
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-4">
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
              ) : (
                <span className="text-xs text-gray-400">Loading...</span>
              )}
            </div>
          )}
        </div>
      </div>

      <div>
        <input
          ref={inputRef}
          id="captcha-input"
          type="text"
          value={userInput}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          disabled={disabled || isVerified || isLoading}
          placeholder="Enter code"
          className="w-full h-11 border border-gray-200 rounded-md px-3 focus-visible:ring-primary focus-visible:ring-offset-0 uppercase text-sm focus-visible:border-brand-secondary focus-visible:ring-1 focus-visible:ring-brand-secondary"
          aria-label="CAPTCHA text input"
          maxLength={6}
          autoComplete="off"
        />
      </div>

      {hookError && (
        <div className="text-xs text-red-600 mt-1" role="alert">
          {hookError}
        </div>
      )}
    </div>
  );
};

export default CaptchaComponent;
