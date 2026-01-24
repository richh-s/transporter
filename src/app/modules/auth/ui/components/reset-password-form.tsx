"use client";

import { useState, useEffect } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Loader2,
  CheckCircle,
  Eye,
  EyeOff,
  KeyRound,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useConfirmPasswordReset } from "../../server/hooks/use-confirm-password-reset";

/* ---------------- Schema ---------------- */
const passwordSchema = z
  .object({
    code: z.string().min(1, "Reset code is required"),
    new_password: z
      .string()
      .min(8, "Password must be at least 8 characters"),
    confirm_password: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

type FormData = z.infer<typeof passwordSchema>;

export function ResetPasswordForm() {
  const router = useRouter();
  const mutation = useConfirmPasswordReset();

  const [step, setStep] = useState<"otp" | "password">("otp");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      code: "",
      new_password: "",
      confirm_password: "",
    },
    mode: "onSubmit",
  });

  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors },
  } = form;

  const onSubmit = async (data: FormData) => {
    await mutation.mutateAsync({
      code: data.code,
      new_password: data.new_password,
    });
  };

  /* ---------------- Redirect on success ---------------- */
  useEffect(() => {
    if (mutation.isSuccess) {
      const timer = setTimeout(() => {
        router.push("/sign-in");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [mutation.isSuccess, router]);

  /* ---------------- Success UI ---------------- */
  if (mutation.isSuccess) {
    return (
      <Alert className="bg-green-50 border-green-200">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-sm text-green-700">
          Password reset successful. Redirecting to sign in…
        </AlertDescription>
      </Alert>
    );
  }

  const apiError = mutation.error
    ? (mutation.error as Error).message
    : null;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* ================= OTP STEP ================= */}
      {step === "otp" && (
        <>
          <div className="space-y-1">
            <label className="text-sm font-medium">
              Reset Code <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="Enter the code sent to your email"
              {...register("code")}
              className={errors.code ? "border-red-500" : ""}
            />
            <p className="text-xs text-muted-foreground">
              Check your inbox and spam folder.
            </p>
            {errors.code && (
              <p className="text-sm text-red-500">
                {errors.code.message}
              </p>
            )}
          </div>

          <Button
            type="button"
            className="w-full"
            onClick={async () => {
              const valid = await trigger("code");
              if (valid) setStep("password");
            }}
          >
            <KeyRound className="mr-2 h-4 w-4" />
            Verify Code
          </Button>
        </>
      )}

      {/* ================= PASSWORD STEP ================= */}
      {step === "password" && (
        <>
          {/* New Password */}
          <div className="space-y-1">
            <label className="text-sm font-medium">
              New Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Input
                type={showNew ? "text" : "password"}
                placeholder="Enter new password"
                {...register("new_password")}
                className={`pr-10 ${
                  errors.new_password ? "border-red-500" : ""
                }`}
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                tabIndex={-1}
              >
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.new_password && (
              <p className="text-sm text-red-500">
                {errors.new_password.message}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-1">
            <label className="text-sm font-medium">
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Input
                type={showConfirm ? "text" : "password"}
                placeholder="Confirm password"
                {...register("confirm_password")}
                className={`pr-10 ${
                  errors.confirm_password ? "border-red-500" : ""
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                tabIndex={-1}
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.confirm_password && (
              <p className="text-sm text-red-500">
                {errors.confirm_password.message}
              </p>
            )}
          </div>

          {/* Backend error */}
          {apiError && (
            <Alert variant="destructive">
              <AlertDescription>{apiError}</AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating…
              </>
            ) : (
              "Reset Password"
            )}
          </Button>
        </>
      )}
    </form>
  );
}
