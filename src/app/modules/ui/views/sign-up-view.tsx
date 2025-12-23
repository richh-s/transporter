"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2, Mail, Lock, User } from "lucide-react";

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
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email("Please enter a valid business email"),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

export default function SignUpView() {
  const { signup } = useAuth();
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      setPending(true);
      await signup(data.email, data.name);
      router.push("/");
    } catch (err) {
      console.error(err);
    } finally {
      setPending(false);
    }
  };

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
                      Join <span className="text-brand-accent">WeTruck</span>
                    </h1>
                    <p className="text-muted-foreground text-sm text-center md:text-left">
                      Create your transporter account to get started.
                    </p>
                  </div>

                  <div className="space-y-3 sm:space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                            Full Name
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                              <Input
                                placeholder="John Doe"
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
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold uppercase tracking-wider text-gray-500">
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
                          <FormLabel className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                            Password
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                              <Input
                                type="password"
                                placeholder="••••••••"
                                {...field}
                                className="pl-9 h-11 border border-gray-200 focus-visible:border-brand-secondary focus-visible:ring-1 focus-visible:ring-brand-secondary focus-visible:ring-offset-0"
                              />
                            </div>
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-11 bg-brand-primary hover:bg-brand-secondary text-white transition-all shadow-md active:scale-[0.98]"
                    disabled={pending}
                  >
                    {pending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      "Register as Transporter"
                    )}
                  </Button>

                  <div className="text-center text-sm">
                    <span className="text-muted-foreground">
                      Already have an account?{" "}
                    </span>
                    <a
                      href="/sign-in"
                      className="text-brand-accent font-semibold hover:underline"
                    >
                      Sign In
                    </a>
                  </div>
                </form>
              </Form>
            </div>

            {/* Right Side: Visual/Brand */}
            <div className="relative hidden md:flex flex-col items-center justify-center px-12 overflow-hidden bg-slate-900">
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

              <div className="relative z-10 flex flex-col items-center justify-center text-center space-y-8 w-full h-full">
                <div className="group relative">
                  <div className="absolute -inset-1 bg-linear-to-r from-brand-accent/30 to-blue-500/10 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                </div>
                <div className="space-y-4">
                  <div className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                    Start Your Journey
                  </div>
                  <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight">
                    Join the <br />
                    <span className="text-brand-accent">Fleet</span>
                  </h2>
                  <div className="h-1 w-20 bg-brand-accent mx-auto rounded-full" />
                </div>
                <p className="text-white/80 text-base max-w-[300px] leading-relaxed font-medium italic">
                  &quot;Join the most efficient logistics network in the region
                  and transform your transport business.&quot;
                </p>
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
}
