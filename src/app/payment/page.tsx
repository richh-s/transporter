"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Browser } from "@capacitor/browser";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Loader2,
  ArrowLeft,
  CreditCard,
  AlertCircle,
  ExternalLink,
  CheckCircle,
} from "lucide-react";

function PaymentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const paymentUrl = searchParams.get("url");
  const [isOpening, setIsOpening] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);

  console.log("💳 [Payment Page] Payment URL:", paymentUrl);

  // Parse URL parameters for debugging
  const parseUrlParams = (urlString: string) => {
    const params: Record<string, string> = {};
    try {
      const queryString = urlString.split("?")[1];
      if (!queryString) return params;
      for (const pair of queryString.split("&")) {
        const eqIndex = pair.indexOf("=");
        if (eqIndex === -1) {
          params[decodeURIComponent(pair)] = "";
          continue;
        }
        const key = decodeURIComponent(pair.substring(0, eqIndex));
        const value = decodeURIComponent(pair.substring(eqIndex + 1));
        params[key] = value;
      }
    } catch (e) {
      console.error("Error parsing URL:", e);
    }
    return params;
  };

  const openPayment = async () => {
    if (!paymentUrl) return;

    setIsOpening(true);
    console.log("💳 [Payment Page] Opening payment URL...");
    console.log("💳 [Payment Page] URL:", paymentUrl);
    console.log("💳 [Payment Page] Params:", parseUrlParams(paymentUrl));

    try {
      // Try Capacitor Browser first (works better on mobile for http URLs)
      console.log("💳 [Payment Page] Trying Capacitor Browser...");
      await Browser.open({ url: paymentUrl });
      console.log("💳 [Payment Page] Capacitor Browser opened successfully");
    } catch (error) {
      console.log(
        "💳 [Payment Page] Capacitor Browser failed, using window.open():",
        error,
      );
      // Fallback to window.open for web
      window.open(paymentUrl, "_blank");
    }

    setTimeout(() => {
      setIsOpening(false);
      setHasOpened(true);
    }, 1000);
  };

  // Auto-open on first load
  useEffect(() => {
    if (paymentUrl && !hasOpened) {
      const timer = setTimeout(() => {
        openPayment();
      }, 300);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentUrl]);

  if (!paymentUrl) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
        <Card className="max-w-sm w-full">
          <CardContent className="p-6 text-center space-y-4">
            <div className="p-4 rounded-full bg-red-100 w-fit mx-auto">
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
            <h1 className="text-xl font-bold">No Payment URL</h1>
            <p className="text-muted-foreground text-sm">
              No payment URL was provided. Please try again from the ship
              details page.
            </p>
            <Button onClick={() => router.push("/ships")} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go to Ships
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b bg-background sticky top-0 z-10">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="shrink-0"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-primary" />
          <h1 className="font-semibold">Telebirr Payment</h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="max-w-sm w-full">
          <CardContent className="p-6 space-y-6">
            {/* Status Icon */}
            <div className="flex justify-center">
              <div
                className={`p-4 rounded-full ${hasOpened ? "bg-emerald-100" : "bg-primary/10"}`}
              >
                {hasOpened ? (
                  <CheckCircle className="h-10 w-10 text-emerald-600" />
                ) : (
                  <CreditCard className="h-10 w-10 text-primary" />
                )}
              </div>
            </div>

            {/* Instructions */}
            <div className="text-center space-y-2">
              <h2 className="text-lg font-semibold">
                {hasOpened ? "Payment Page Opened" : "Complete Your Payment"}
              </h2>
              <p className="text-sm text-muted-foreground">
                {hasOpened
                  ? "Scan the QR code in the payment page with your Telebirr app to complete the payment."
                  : "Click the button below to open the Telebirr payment page."}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={openPayment}
                disabled={isOpening}
                className="w-full bg-primary hover:bg-primary/90"
                size="lg"
              >
                {isOpening ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Opening...
                  </>
                ) : (
                  <>
                    <ExternalLink className="mr-2 h-5 w-5" />
                    {hasOpened ? "Open Again" : "Open Payment Page"}
                  </>
                )}
              </Button>

              <Button
                onClick={() => router.back()}
                variant="outline"
                className="w-full"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Ship Details
              </Button>
            </div>

            {/* Test Credentials */}
            <div className="border-t pt-4">
              <p className="text-xs text-muted-foreground text-center mb-3">
                Telebirr Test App Credentials
              </p>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="bg-muted rounded-lg p-2 text-center">
                  <div className="text-muted-foreground">Short Code</div>
                  <div className="font-bold">9000</div>
                </div>
                <div className="bg-muted rounded-lg p-2 text-center">
                  <div className="text-muted-foreground">Operator ID</div>
                  <div className="font-bold">9000</div>
                </div>
                <div className="bg-muted rounded-lg p-2 text-center">
                  <div className="text-muted-foreground">Password</div>
                  <div className="font-bold">151515</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <PaymentContent />
    </Suspense>
  );
}
