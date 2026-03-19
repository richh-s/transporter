"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Lock } from "lucide-react";
import { toast } from "sonner";
import { request } from "@/lib/api-client";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

// Validation schema
const getPasswordResetSchema = (t: any) => z
  .object({
    current_password: z
      .string()
      .min(8, t("profile:password_hint")),
    new_password: z.string().min(8, t("profile:password_hint")),
    confirm_password: z
      .string()
      .min(8, t("profile:password_hint")),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: t("validation:passwords_dont_match", { defaultValue: "Passwords don't match" }),
    path: ["confirm_password"],
  });

type PasswordResetFormValues = z.infer<ReturnType<typeof getPasswordResetSchema>>;

interface PasswordResetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PasswordResetDialog({
  open,
  onOpenChange,
}: PasswordResetDialogProps) {
  const { t } = useTranslation(["profile", "common", "validation"]);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  const form = useForm<PasswordResetFormValues>({
    resolver: zodResolver(getPasswordResetSchema(t)),
    defaultValues: {
      current_password: "",
      new_password: "",
      confirm_password: "",
    },
  });

  async function onSubmit(data: PasswordResetFormValues) {
    try {
      const { error, status, fields } = await request<{ message: string }>(
        "/auth/password-reset",
        {
          method: "POST",
          body: JSON.stringify({
            current_password: data.current_password,
            new_password: data.new_password,
          }),
        },
      );

      if (error || status !== 200) {
        // 1. Handle validation errors (422)
        if (status === 422 && fields) {
          Object.entries(fields).forEach(([key, value]) => {
            // Map backend keys to form field names
            if (key === "body" || key === "new_password") {
              form.setError("new_password", {
                type: "manual",
                message: value as string,
              });
            } else if (key === "current_password") {
              form.setError("current_password", {
                type: "manual",
                message: value as string,
              });
            } else {
              form.setError("new_password", {
                type: "manual",
                message: value as string,
              });
            }
          });
          return;
        }

        // 2. Handle specific status cases
        if (status === 403) {
          form.setError("current_password", {
            type: "manual",
            message: t("profile:error_incorrect_password"),
          });
          return;
        }

        if (status === 401) {
          toast.error(t("profile:error_session_expired"));
          router.push("/sign-in");
          return;
        }

        // 3. Fallback for other errors
        toast.error(error || t("profile:error_reset_failed"));
        return;
      }

      toast.success(t("profile:success_password"));

      // Reset form and close dialog
      form.reset();
      onOpenChange(false);
    } catch (err) {
      console.error("Password reset error:", err);
      toast.error(t("profile:error_try_again"));
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            {t("profile:change_password")}
          </DialogTitle>
          <DialogDescription>
            {t("profile:change_password_description")}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="current_password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("profile:current_password")} *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showCurrentPassword ? "text" : "password"}
                        placeholder={t("profile:current_password_placeholder")}
                        {...field}
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() =>
                          setShowCurrentPassword(!showCurrentPassword)
                        }
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="new_password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("profile:new_password")} *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showNewPassword ? "text" : "password"}
                        placeholder={t("profile:new_password_placeholder")}
                        {...field}
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <p className="text-sm text-muted-foreground">
                    {t("profile:password_hint")}
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirm_password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("profile:confirm_password")} *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder={t("profile:confirm_password_placeholder")}
                        {...field}
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  form.reset();
                  onOpenChange(false);
                }}
                disabled={form.formState.isSubmitting}
              >
                {t("common:buttons.cancel")}
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? t("profile:saving") : t("common:buttons.save_changes")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
