"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  OctagonAlert,
  Loader2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
} from "lucide-react";

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
import { useRouter } from "next/navigation";
import CaptchaComponent from "@/components/captcha/CaptchaComponent";

const formSchema = z.object({
  email: z.string().email("Please enter a valid business email"),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

export const SignInView = () => {
  const { login, isAuthenticated, isLoading } = useAuth();
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
      setError(
        "Unable to load security code. Please refresh the page and try again."
      );
    } else {
      setError(msg);
    }
  }, []);

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
        setError(
          "The security code you entered is incorrect. Please enter the code from the new image below."
        );
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
        setError(
          "Unable to connect to the server. Please check your internet connection and try again."
        );
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
        setError(
          "The email or password you entered is incorrect. Please check your credentials and try again."
        );
      }
      // Account-related errors
      else if (
        lowerErrorMessage.includes("not found") ||
        lowerErrorMessage.includes("doesn't exist") ||
        lowerErrorMessage.includes("user not found")
      ) {
        setError(
          "No account found with this email address. Please check your email or contact support."
        );
      } else if (
        lowerErrorMessage.includes("disabled") ||
        lowerErrorMessage.includes("suspended") ||
        lowerErrorMessage.includes("inactive")
      ) {
        setError(
          "Your account has been disabled. Please contact support for assistance."
        );
      }
      // Server errors
      else if (
        lowerErrorMessage.includes("500") ||
        lowerErrorMessage.includes("server error") ||
        lowerErrorMessage.includes("internal server")
      ) {
        setError("A server error occurred. Please try again in a few moments.");
      }
      // Rate limiting
      else if (
        lowerErrorMessage.includes("too many") ||
        lowerErrorMessage.includes("rate limit") ||
        lowerErrorMessage.includes("429")
      ) {
        setError(
          "Too many login attempts. Please wait a few minutes before trying again."
        );
      }
      // Generic fallback
      else {
        setError(
          "Login failed. Please check your credentials and try again. If the problem persists, contact support."
        );
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
          <p className="text-sm text-muted-foreground">Loading...</p>
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
            Redirecting to dashboard...
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
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-brand-primary text-center md:text-left">
                      <span className="text-brand-accent">WeTruck</span> Sign In
                    </h1>
                    <p className="text-muted-foreground text-sm text-center md:text-left">
                      Enter your credentials to manage freight operations.
                    </p>
                  </div>

                  <div className="space-y-3 sm:space-y-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel required className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                            Work Email
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                              <Input
                                placeholder="name@wetruck.com"
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
                            <FormLabel required className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                              Password
                            </FormLabel>
                            <a
                              href="#"
                              className="text-xs text-brand-accent hover:text-brand-accent/80 hover:underline"
                            >
                              Forgot?
                            </a>
                          </div>
                          <FormControl>
                            <div className="relative">
                              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                              <Input
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
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
                    className="w-full h-11 bg-brand-primary hover:bg-brand-secondary text-white transition-all shadow-md active:scale-[0.98]"
                    disabled={
                      pending ||
                      !captchaId ||
                      captchaSolution.trim().length === 0
                    }
                  >
                    {pending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Authenticating...
                      </>
                    ) : (
                      "Sign In to Dashboard"
                    )}
                  </Button>

                  <div className="text-center text-sm">
                    <span className="text-muted-foreground">
                      Contact support to request access to the platform.
                    </span>
                  </div>

                  {/* Mock Credentials Hint */}
                  <div className="rounded-lg border border-dashed border-brand-accent/50 bg-brand-accent/5 p-3 text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <ShieldCheck className="h-3 w-3 text-brand-primary" />
                      <p className="text-[10px] uppercase tracking-widest font-bold text-brand-primary/60">
                        Dev Access
                      </p>
                    </div>
                    <p className="text-xs text-brand-primary/80">
                      <span className="font-semibold">Email:</span>{" "}
                      transporter@wetruck.ai <br />
                      <span className="font-semibold">Password:</span>{" "}
                      transporter123
                    </p>
                  </div>
                </form>
              </Form>
            </div>

            {/* Right Side: Visual/Brand */}
            <div className="relative hidden md:flex flex-col items-center justify-center p-12 overflow-hidden bg-slate-900">
              {/* Truck Image Background with Overlay */}
              <div className="absolute inset-0">
                <Image
                  src="/images/truck.png"
                  alt="Background Truck"
                  fill
                  className="object-cover opacity-60 brightness-75 grayscale"
                />
                <div className="absolute inset-0 bg-linear-to-br from-blue-600/20 via-slate-900/40 to-slate-900/60" />
              </div>

              {/* Background Decorative Shapes */}
              <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-blue-600/10 rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-[-10%] left-[-10%] w-80 h-80 bg-brand-accent/5 rounded-full blur-3xl animate-pulse delay-700" />

              <div className="relative z-10 flex flex-col items-center justify-center text-center space-y-8 w-full h-full">
                <div className="group relative">
                  <div className="absolute -inset-1 bg-linear-to-r from-brand-accent/30 to-blue-500/10 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                </div>

                <div className="space-y-4">
                  <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight">
                    Move Forward, <br />
                    <span className="text-brand-accent">Go Wide!</span>
                  </h2>
                  <div className="h-1 w-20 bg-brand-accent mx-auto rounded-full" />
                </div>

                <p className="text-white/80 text-base max-w-[300px] leading-relaxed font-medium italic">
                  &quot;Streamline your logistics operations with the most
                  powerful transport dashboard.&quot;
                </p>
              </div>


              {/* Bottom Accent */}
              <div className="absolute bottom-8 left-8 right-8 z-10">
                <div className="flex justify-between items-center text-[10px] text-white/40 uppercase tracking-[0.2em]">
                  <span className="font-bold text-xl text-white/70">
                    Logistics
                  </span>
                  <span className="text-xl text-brand-accent">•</span>
                  <span className="font-bold text-xl text-white/70">
                    Efficiency
                  </span>
                  <span className="text-xl text-brand-accent">•</span>
                  <span className="font-bold text-xl text-white/70">
                    Control
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer Links */}
        <p className="text-center text-xs text-gray-400">
          &copy; {new Date().getFullYear()}{" "}
          <span className="text-brand-accent font-medium">WeTruck</span>{" "}
          TechEnable Solutions PLC.
          <a
            href="#"
            className="ml-2 text-brand-accent hover:text-brand-accent/80 underline underline-offset-4 transition-colors"
          >
            Terms
          </a>
          <span className="mx-2 text-brand-accent">•</span>
          <a
            href="#"
            className="text-brand-accent hover:text-brand-accent/80 underline underline-offset-4 transition-colors"
          >
            Privacy
          </a>
        </p>
      </div>
    </div>
  );
};

