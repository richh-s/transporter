"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ResetPasswordForm } from "../components/reset-password-form";

export function ResetPasswordView() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-6 space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-bold tracking-tight text-primary">
              Transporter Portal
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter the code sent to your email and choose a new password.
            </p>
          </div>

          <ResetPasswordForm />
        </CardContent>
      </Card>
    </div>
  );
}
