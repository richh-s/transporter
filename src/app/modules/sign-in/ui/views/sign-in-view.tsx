"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { OctagonAlert, Loader2, Mail, Lock, Eye, EyeOff } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/providers/AuthProvider";
import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import CaptchaComponent from "@/components/captcha/CaptchaComponent";

const formSchema = z.object({
  email: z.string().email("validation:email_invalid"),
  password: z
    .string()
    .min(6, "validation:password_min"),
});

export const SignInView = () => {
  const { login, isAuthenticated, isLoading } = useAuth();
  const { t } = useTranslation(["auth", "common"]);
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [captchaId, setCaptchaId] = useState<string>("");
  const [captchaSolution, setCaptchaSolution] = useState<string>("");
  const refreshCaptchaRef = useRef<(() => void) | null>(null);

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, isLoading, router]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleCaptchaVerified = useCallback((id: string, solution: string) => {
    setCaptchaId(id);
    setCaptchaSolution(solution);
  }, []);

  const handleCaptchaError = useCallback((msg: string) => {
    // Make captcha errors more user-friendly
    const lowerMsg = msg.toLowerCase();
    if (lowerMsg.includes("captcha") || lowerMsg.includes("security code")) {
      setError(t("auth:errors.captcha_load_error"));
    } else {
      setError(msg);
    }
  }, [t]);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      setPending(true);
      setError(null);
      await login(data.email, data.password, captchaId, captchaSolution);
      router.push("/");
    } catch (err) {
      // Map backend errors to user-friendly messages
      const errorMessage = err instanceof Error ? err.message : "";
      const lowerErrorMessage = errorMessage.toLowerCase();

      // CAPTCHA errors - check first and refresh captcha
      if (
        lowerErrorMessage.includes("captcha") ||
        lowerErrorMessage.includes("security code") ||
        lowerErrorMessage.includes("incorrect captcha") ||
        lowerErrorMessage.includes("invalid captcha") ||
        lowerErrorMessage.includes("captcha expired") ||
        lowerErrorMessage.includes("captcha verification") ||
        (lowerErrorMessage.includes("400") &&
          (lowerErrorMessage.includes("captcha") ||
            lowerErrorMessage.includes("code")))
      ) {
        setError(t("auth:errors.captcha_incorrect"));
        // Refresh captcha on error
        setCaptchaSolution("");
        setCaptchaId("");
        // Trigger captcha refresh
        if (refreshCaptchaRef.current) {
          refreshCaptchaRef.current();
        }
        return;
      }

      // Network/Connection errors
      if (
        lowerErrorMessage.includes("failed to fetch") ||
        lowerErrorMessage.includes("network error") ||
        lowerErrorMessage.includes("cannot connect") ||
        lowerErrorMessage.includes("connection")
      ) {
        setError(t("auth:errors.network_error"));
      }
      // Invalid credentials (but not captcha)
      else if (
        lowerErrorMessage.includes("invalid email") ||
        lowerErrorMessage.includes("invalid password") ||
        lowerErrorMessage.includes("incorrect password") ||
        lowerErrorMessage.includes("wrong password") ||
        lowerErrorMessage.includes("credentials") ||
        (lowerErrorMessage.includes("invalid") &&
          !lowerErrorMessage.includes("captcha")) ||
        (lowerErrorMessage.includes("incorrect") &&
          !lowerErrorMessage.includes("captcha")) ||
        lowerErrorMessage.includes("401")
      ) {
        setError(t("auth:errors.invalid_credentials"));
      }
      // Account-related errors
      else if (
        lowerErrorMessage.includes("not found") ||
        lowerErrorMessage.includes("doesn't exist") ||
        lowerErrorMessage.includes("user not found")
      ) {
        setError(t("auth:errors.account_not_found"));
      } else if (
        lowerErrorMessage.includes("disabled") ||
        lowerErrorMessage.includes("suspended") ||
        lowerErrorMessage.includes("inactive")
      ) {
        setError(t("auth:errors.account_disabled"));
      }
      // Server errors
      else if (
        lowerErrorMessage.includes("500") ||
        lowerErrorMessage.includes("server error") ||
        lowerErrorMessage.includes("internal server")
      ) {
        setError(t("auth:errors.server_error"));
      }
      // Rate limiting
      else if (
        lowerErrorMessage.includes("too many") ||
        lowerErrorMessage.includes("rate limit") ||
        lowerErrorMessage.includes("429")
      ) {
        setError(t("auth:errors.rate_limit"));
      }
      // Generic fallback
      else {
        setError(t("auth:errors.generic_login_failed"));
      }
    } finally {
      setPending(false);
    }
  };

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">{t("common:buttons.loading")}</p>
        </div>
      </div>
    );
  }

  // Don't render login form if already authenticated (will redirect)
  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">
            {t("common:buttons.loading")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="light-theme-only min-h-screen flex items-center justify-center bg-background p-0 sm:p-4 sm:px-6 sm:py-8 text-foreground">
      <div className="flex flex-col gap-6 w-full max-w-[450px] md:max-w-[900px] mx-auto">
        <Card className="overflow-hidden border-none shadow-none sm:shadow-sm bg-white p-0 gap-0">
          <CardContent className="grid p-0 md:grid-cols-2 min-h-[500px] md:min-h-[550px]">
            {/* Left Side: Form */}
            <div className="p-6 sm:p-8 md:p-12 flex flex-col justify-center">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-5 sm:space-y-6"
                >
                  <div className="space-y-2">
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-primary text-center md:text-left">
                      {t("auth:sign_in.title")}
                    </h1>
                    <p className="text-muted-foreground text-sm text-center md:text-left">
                      {t("auth:sign_in.subtitle")}
                    </p>
                  </div>
                  <div className="space-y-3 sm:space-y-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel
                            required
                            className="text-xs font-semibold uppercase tracking-wider text-gray-500"
                          >
                            {t("auth:sign_in.email_label")}
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                              <Input
                                placeholder={t("auth:sign_in.email_placeholder")}
                                {...field}
                                className="pl-9 h-11 border border-gray-200 focus-visible:border-brand-secondary focus-visible:ring-1 focus-visible:ring-brand-secondary focus-visible:ring-offset-0"
                              />
                            </div>
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center justify-between">
                            <FormLabel
                              required
                              className="text-xs font-semibold uppercase tracking-wider text-gray-500"
                            >
                              {t("auth:sign_in.password_label")}
                            </FormLabel>
                            <Link
                              href="/forgot-password"
                              className="text-xs text-primary hover:text-primary/80 hover:underline"
                            >
                              {t("auth:sign_in.forgot_password")}
                            </Link>
                          </div>
                          <FormControl>
                            <div className="relative">
                              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                              <Input
                                type={showPassword ? "text" : "password"}
                                placeholder={t("auth:sign_in.password_placeholder")}
                                {...field}
                                className="pl-9 pr-10 h-11 border border-gray-200 focus-visible:border-brand-secondary focus-visible:ring-1 focus-visible:ring-brand-secondary focus-visible:ring-offset-0 transition-all"
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-primary transition-colors"
                                tabIndex={-1}
                              >
                                {showPassword ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                  </div>
                  {/* CAPTCHA Component */}
                  <div className="pt-2">
                    <CaptchaComponent
                      onCaptchaVerified={handleCaptchaVerified}
                      onError={handleCaptchaError}
                      disabled={pending}
                      deferVerification={true}
                      onRefreshReady={(refreshFn) => {
                        refreshCaptchaRef.current = refreshFn;
                      }}
                    />
                  </div>
                  {error && (
                    <Alert
                      variant="destructive"
                      className="py-2 px-3 border-red-100 bg-red-50"
                    >
                      <div className="flex items-center gap-2">
                        <OctagonAlert className="h-4 w-4" />
                        <AlertDescription className="text-xs font-medium text-destructive">
                          {error}
                        </AlertDescription>
                      </div>
                    </Alert>
                  )}
                  <Button
                    type="submit"
                    className="w-full h-11 bg-primary hover:bg-primary/90 text-white transition-all shadow-md active:scale-[0.98]"
                    disabled={
                      pending ||
                      !captchaId ||
                      captchaSolution.trim().length === 0
                    }
                  >
                    {pending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t("auth:sign_in.authenticating")}
                      </>
                    ) : (
                      t("auth:sign_in.submit")
                    )}
                  </Button>{" "}
                </form>
              </Form>
            </div>

            {/* Right Side: Visual/Brand */}
            <div className="relative hidden md:flex flex-col items-center justify-center p-12 overflow-hidden bg-primary">
              {/* Truck Image Background with Overlay */}
              <div className="absolute inset-0">
                <Image
                  src="/images/truck.png"
                  alt="Background Truck"
                  fill
                  className="object-cover opacity-60 brightness-75 grayscale"
                />
                <div className="absolute inset-0 bg-linear-to-br from-primary/20 via-primary/40 to-primary/60" />
              </div>

              {/* Background Decorative Shapes */}
              <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-[-10%] left-[-10%] w-80 h-80 bg-white/5 rounded-full blur-3xl animate-pulse delay-700" />

              <div className="relative z-10 flex flex-col items-center justify-center text-center space-y-8 w-full h-full">
                <div className="group relative">
                  <div className="absolute -inset-1 bg-linear-to-r from-white/30 to-white/10 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                </div>

                <div className="space-y-4">
                  <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight">
                    {t("auth:sign_in.hero_title")} <br />
                    <span>{t("auth:sign_in.hero_subtitle")}</span>
                  </h2>
                  <div className="h-1 w-20 bg-white mx-auto rounded-full" />
                </div>

                <p className="text-white/80 text-base max-w-[300px] leading-relaxed font-medium italic">
                  &quot;{t("auth:sign_in.hero_description")}&quot;
                </p>
              </div>

              {/* Bottom Accent */}
              <div className="absolute bottom-8 left-8 right-8 z-10">
                <div className="flex justify-between items-center text-[10px] text-white/40 uppercase tracking-[0.2em]">
                  <span className="font-bold text-xl text-white/70">
                    {t("auth:sign_in.accents.logistics")}
                  </span>
                  <span className="text-xl text-brand-accent">•</span>
                  <span className="font-bold text-xl text-white/70">
                    {t("auth:sign_in.accents.efficiency")}
                  </span>
                  <span className="text-xl text-brand-accent">•</span>
                  <span className="font-bold text-xl text-white/70">
                    {t("auth:sign_in.accents.control")}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer Links */}
        <p className="text-center text-xs text-gray-400">
          &copy; {new Date().getFullYear()}{" "}
          <span className="text-primary font-medium">WeTruck</span> TechEnable
          Solutions PLC.
          <a
            href="#"
            className="ml-2 text-primary hover:text-primary/80 underline underline-offset-4 transition-colors"
          >
            Terms
          </a>
          <span className="mx-2 text-primary">•</span>
          <a
            href="#"
            className="text-primary hover:text-primary/80 underline underline-offset-4 transition-colors"
          >
            Privacy
          </a>
        </p>
      </div>
    </div>
  );
};
