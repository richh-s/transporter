"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ForgotPasswordForm } from "../components/forgot-password-form";

export function ForgotPasswordView() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-6 space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-bold tracking-tight text-primary">
              Transporter Portal
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter your registered email to receive a reset code.
            </p>
          </div>

          <ForgotPasswordForm />
        </CardContent>
      </Card>
    </div>
  );
}
