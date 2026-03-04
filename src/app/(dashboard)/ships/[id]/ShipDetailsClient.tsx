"use client";

import { useState, Suspense, useEffect, useMemo } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { FileOpener } from "@capacitor-community/file-opener";
import { Capacitor } from "@capacitor/core";
import { Browser } from "@capacitor/browser";
import { format } from "date-fns";
import { Container, Truck, Driver, PaymentResponse } from "@/types/ship";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  MapPin,
  FileText,
  CreditCard,
  Loader2,
  AlertCircle,
  Calendar,
  ArrowRight,
  Package,
  User,
  Eye,
  Wallet,
  Download,
  CheckCircle,
  Navigation2,
} from "lucide-react";
import { CompactBreadcrumb } from "@/components/ui/mobile-breadcrumb";
import Link from "next/link";
import {
  useShip,
  useAssignTruck,
  useAssignDriver,
  useMarkAsDelivered,
  useShipPayments,
  useCreatePaymentOrder,
  useShipDocuments,
} from "@/hooks/use-ships";
import { useReceiptGeneration } from "@/hooks/use-receipt-generation";
import { useAuth } from "@/components/providers/AuthProvider";
import { useTrucksQuery } from "@/hooks/use-trucks-query";
import { useDrivers } from "@/hooks/use-drivers";
import { ContainersModal } from "./containers-modal";
import { ManualConfirmationModal } from "./manual-confirmation-modal";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { columns as shipItemColumns } from "./ship-items-columns";
import { AssignModal } from "./assign-modal";
import { ShipTrackingView } from "./ship-tracking-view";
import { toast } from "sonner";
import { shipApi } from "@/lib/api/ships";
import { cn } from "@/lib/utils";
import { ShipItem } from "@/types/ship";
import { useShipperInfo } from "@/hooks/use-shipper-info";

import { OrganizationDocument } from "@/lib/api/organization";

// Status Badge Component
function StatusBadge({ status }: { status: string }) {
  const getConfig = (s: string) => {
    const normalized = s?.toLowerCase();
    switch (normalized) {
      case "created":
        return {
          dot: "bg-slate-400",
          text: "text-slate-700",
          bg: "bg-slate-400/10",
        };
      case "price_requested":
        return {
          dot: "bg-orange-500",
          text: "text-orange-700",
          bg: "bg-orange-500/10",
        };
      case "priced":
        return {
          dot: "bg-purple-500",
          text: "text-purple-700",
          bg: "bg-purple-500/10",
        };
      case "accepted_by_shipper":
        return {
          dot: "bg-blue-500",
          text: "text-blue-700",
          bg: "bg-blue-500/10",
        };
      case "rejected_by_shipper":
        return { dot: "bg-red-500", text: "text-red-700", bg: "bg-red-500/10" };
      case "allocated":
        return {
          dot: "bg-indigo-500",
          text: "text-indigo-700",
          bg: "bg-indigo-500/10",
        };
      case "ready_for_pickup":
        return {
          dot: "bg-lime-500",
          text: "text-lime-700",
          bg: "bg-lime-500/10",
        };
      case "in_transit":
        return {
          dot: "bg-amber-500",
          text: "text-amber-700",
          bg: "bg-amber-500/10",
        };
      case "delivered":
        return {
          dot: "bg-cyan-500",
          text: "text-cyan-700",
          bg: "bg-cyan-500/10",
        };
      case "completed":
        return {
          dot: "bg-emerald-500",
          text: "text-emerald-700",
          bg: "bg-emerald-500/10",
        };
      default:
        return {
          dot: "bg-slate-400",
          text: "text-slate-700",
          bg: "bg-slate-400/10",
        };
    }
  };
  const config = getConfig(status);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold",
        config.bg,
        config.text,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", config.dot)} />
      {status?.replace(/_/g, " ") || "Unknown"}
    </span>
  );
}

// Loading Skeleton
function DetailSkeleton() {
  return (
    <div className="space-y-4 p-4 animate-in fade-in">
      <div className="flex items-center gap-3">
        <Skeleton className="h-8 w-8 rounded-lg" />
        <Skeleton className="h-6 w-32" />
      </div>
      <Skeleton className="h-24 w-full rounded-xl" />
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
      </div>
      <Skeleton className="h-48 w-full rounded-xl" />
    </div>
  );
}

function ShipDetailsContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const rawId = searchParams.get("id") || (params.id as string);
  const id = rawId && rawId !== "placeholder" ? rawId : "";
  const router = useRouter();

  // State
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [manualConfirmModalOpen, setManualConfirmModalOpen] = useState(false);
  const [showContainersModal, setShowContainersModal] = useState(false);
  const [modalContainers, setModalContainers] = useState<Container[]>([]);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedShipItem, setSelectedShipItem] = useState<ShipItem | null>(
    null,
  );
  const [isDownloadingInvoice, setIsDownloadingInvoice] = useState(false);
  const [showTracking, setShowTracking] = useState(false);

  // Hooks
  const {
    data: ship,
    isLoading: isShipLoading,
    error: shipError,
  } = useShip(id || "0");

  const { data: documentsResponse } = useShipDocuments(id || "0");
  const documents = useMemo(() => {
    return (
      (documentsResponse as { documents?: OrganizationDocument[] })
        ?.documents || []
    );
  }, [documentsResponse]);

  useEffect(() => {
    if (ship) {
      console.log("📦 [Debug] Full Shipment Data:", ship);
      console.log("📊 [Debug] Shipment Details:", ship.shipment_details);
    }
  }, [ship]);

  useEffect(() => {
    if (documentsResponse) {
      console.log(
        "📄 [Debug] Dedicated Documents Response:",
        documentsResponse,
      );
      console.log("📑 [Debug] Extracted Documents Array:", documents);
    }
  }, [documentsResponse, documents]);

  const { data: trucksData } = useTrucksQuery({ per_page: 100 }, assignModalOpen);
  const { data: driversData } = useDrivers({ per_page: 100 }, assignModalOpen);
  const { data: payments, isLoading: isPaymentsLoading } = useShipPayments(id || "0");
  const createPaymentOrder = useCreatePaymentOrder(id || "0");
  const assignTruck = useAssignTruck(id || "0");
  const assignDriver = useAssignDriver(id || "0");
  const markAsDelivered = useMarkAsDelivered(id || "0");
  const { generateReceipt, isGenerating: isGeneratingReceipt } = useReceiptGeneration();
  const { user } = useAuth();

  const paymentsList = useMemo(() => {
    if (!payments) return [];
    if (Array.isArray(payments)) return payments as PaymentResponse[];
    const p = payments as Record<string, unknown>;
    return (p.items as PaymentResponse[]) || (p.result as PaymentResponse[]) || (p.data as PaymentResponse[]) || [];
  }, [payments]);

  const paidPayment = paymentsList.find((p: PaymentResponse) => p.paid);
  const { data: shipperInfoResponse, isLoading: isShipperLoading } =
    useShipperInfo({
      ship_id: id,
      payment_id: paidPayment?.id || null,
      enabled: !!paidPayment,
    });
  const shipperInfo = shipperInfoResponse?.result;

  useEffect(() => {
    if (shipperInfo) {
      console.log("👤 [Debug] Shipper Info:", shipperInfo);
    }
  }, [shipperInfo]);

  useEffect(() => {
    if (!id) router.replace("/ships");
  }, [id, router]);

  // Navigate to payment page when URL is received
  useEffect(() => {
    const telebirrPaymentUrl = createPaymentOrder.data?.result?.payment_url;
    if (telebirrPaymentUrl && createPaymentOrder.isSuccess) {
      // Close the modal
      setPaymentModalOpen(false);
      const encodedUrl = encodeURIComponent(telebirrPaymentUrl);

      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      const baseUrl = API_URL?.replace(/\/api\/v1\/?$/, "/");
      const paymentUrl = `${baseUrl}pay/index.html?url=${encodedUrl}`;

      if (Capacitor.isNativePlatform()) {
        // On mobile, use Capacitor Browser to open in-app browser overlay
        // Uses SFSafariViewController (iOS) / Chrome Custom Tabs (Android)
        // This provides a browser context that Telebirr accepts while staying "in-app"
        Browser.open({
          url: paymentUrl,
          presentationStyle: "popover", // Shows as overlay, feels more "in-app"
          toolbarColor: "#4ba94d", // Match app's brand color
        }).catch(() => {
          // Fallback to window.open
          window.open(paymentUrl, "_blank");
        });

        // Listen for browser close event to refresh payment status
        let listenerHandle: { remove: () => void } | null = null;
        void Browser.addListener("browserFinished", () => {
          listenerHandle?.remove();
        }).then((handle) => {
          listenerHandle = handle;
        });
      } else {
        // On web, redirect to the payment page
        window.location.href = paymentUrl;
      }
    }
  }, [createPaymentOrder.data, createPaymentOrder.isSuccess, router]);

  if (!id) return <DetailSkeleton />;

  const trucks = Array.isArray(trucksData)
    ? trucksData
    : (trucksData as unknown as { items: Truck[] })?.items || [];
  const drivers = Array.isArray(driversData)
    ? driversData
    : (driversData as unknown as { items: Driver[] })?.items || [];
  const error = shipError ? (shipError as Error).message : null;
  const unpaidPayment = paymentsList.find((p: PaymentResponse) => !p.paid);
  const hasUnpaidPayment = !!unpaidPayment;

  const handlePayNow = () => {
    if (!unpaidPayment) {
      toast.error("No unpaid payments found");
      return;
    }
    setPaymentModalOpen(true);
    createPaymentOrder.mutate({
      payment_id: unpaidPayment.id,
      ship_id: Number(id),
      title: "Payment",
    });
  };

  const handleDownloadInvoice = async () => {
    try {
      setIsDownloadingInvoice(true);
      toast.loading("Loading invoice...");
      console.log("📄 [Invoice] Starting for ship:", id);

      const blob = await shipApi.getInvoice(id);
      const fileName = `invoice-ship-${id}.pdf`;

      // Check if we're on a native platform (Android/iOS)
      if (Capacitor.isNativePlatform()) {
        console.log("📄 [Invoice] Native platform detected, using Filesystem");

        // Convert blob to base64
        const reader = new FileReader();
        const base64Data = await new Promise<string>((resolve, reject) => {
          reader.onloadend = () => {
            const result = reader.result as string;
            // Remove the data URL prefix to get just the base64 data
            const base64 = result.split(",")[1];
            resolve(base64);
          };
          reader.onerror = () => reject(new Error("Failed to read file"));
          reader.readAsDataURL(blob);
        });

        console.log("📄 [Invoice] Converted to base64, saving file...");

        // Save file to device cache
        const savedFile = await Filesystem.writeFile({
          path: fileName,
          data: base64Data,
          directory: Directory.Cache,
        });

        console.log("📄 [Invoice] File saved:", savedFile.uri);
        toast.dismiss();

        // Open the file directly with the device's PDF viewer
        await FileOpener.open({
          filePath: savedFile.uri,
          contentType: "application/pdf",
        });

        console.log("📄 [Invoice] Opened with PDF viewer");
        toast.success("Invoice opened");
      } else {
        console.log("📄 [Invoice] Web platform, using download link");
        // Web fallback - use traditional download approach
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        toast.dismiss();
        toast.success("Invoice downloaded");
      }
    } catch (err) {
      console.error("📄 [Invoice] Error:", err);
      toast.dismiss();
      toast.error(err instanceof Error ? err.message : "Failed to download");
    } finally {
      setIsDownloadingInvoice(false);
    }
  };

  const handleViewShipItemContainers = (containers: Container[]) => {
    setModalContainers(containers);
    setShowContainersModal(true);
  };

  const handleAssignClick = (shipItem: ShipItem) => {
    setSelectedShipItem(shipItem);
    setAssignModalOpen(true);
  };

  const handleMarkAsDelivered = (shipItem: ShipItem) => {
    markAsDelivered.mutate(shipItem.id);
  };

  const handleAssign = (
    shipItemId: number,
    truckId: number | null,
    driverId: number | null,
  ) => {
    if (!selectedShipItem) return;

    // Get current IDs for comparison
    const currentTruckId =
      selectedShipItem.truck_id ||
      selectedShipItem.assigned_truck_id ||
      selectedShipItem.assigned_truck?.id ||
      selectedShipItem.truck?.id;
    const currentDriverId =
      selectedShipItem.driver_id ||
      selectedShipItem.assigned_driver_id ||
      selectedShipItem.assigned_driver?.id ||
      selectedShipItem.driver?.id;

    // Only trigger truck assignment if changed
    if (truckId && Number(truckId) !== Number(currentTruckId)) {
      assignTruck.mutate({ shipItemId, data: { truck_id: truckId } });
    }

    // Only trigger driver assignment if changed
    if (driverId && Number(driverId) !== Number(currentDriverId)) {
      assignDriver.mutate({ shipItemId, data: { driver_id: driverId } });
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] gap-4 p-6">
        <div className="p-4 rounded-full bg-red-500/10">
          <AlertCircle className="h-8 w-8 text-red-500" />
        </div>
        <p className="text-sm text-muted-foreground text-center">{error}</p>
        <Link href="/ships">
          <Button variant="outline" size="sm">
            Go to Ships
          </Button>
        </Link>
      </div>
    );
  }

  const shipItems = ship?.ship_items || [];

  // Get driver and truck from first ship item that has them
  const firstShipItemWithDriver = shipItems.find(
    (item) => item.assigned_driver || item.driver,
  );
  const firstShipItemWithTruck = shipItems.find(
    (item) => item.assigned_truck || item.truck,
  );
  const driver =
    firstShipItemWithDriver?.assigned_driver || firstShipItemWithDriver?.driver;
  const truck =
    firstShipItemWithTruck?.assigned_truck || firstShipItemWithTruck?.truck;

  // Format invoice ID
  const invoiceId = unpaidPayment
    ? `#INV-${new Date().getFullYear()}-${String(unpaidPayment.id).padStart(3, "0")}`
    : paidPayment
      ? `#INV-${new Date().getFullYear()}-${String(paidPayment.id).padStart(3, "0")}`
      : null;

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-300">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border/50 py-3">
        <div className="space-y-2">
          <CompactBreadcrumb
            parentLabel="Ships"
            parentHref="/ships"
            currentLabel={isShipLoading ? "Loading..." : `Ship #${ship?.id}`}
          />
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold">
                  {isShipLoading ? (
                    <Skeleton className="h-6 w-24" />
                  ) : (
                    `Ship #${ship?.id}`
                  )}
                </h1>
                {!isShipLoading && ship && <StatusBadge status={ship.status} />}
              </div>
            </div>
            {!isShipLoading && ship && !showTracking && (
              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={() => setShowTracking(true)}
              >
                <Navigation2 className="h-4 w-4 mr-1.5" />
                Track Shipment
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-4 sm:space-y-6">
          {showTracking && id ? (
            <ShipTrackingView
              shipId={id}
              onBack={() => setShowTracking(false)}
            />
          ) : isShipLoading ? (
            <DetailSkeleton />
          ) : (
            <>
              {/* Payment Card */}
              <Card className="border border-border bg-card">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                    {/* Left: Icon + Label + Amount */}
                    <div className="flex items-start gap-3 w-full sm:flex-1 min-w-0">
                      <div className="p-2 rounded-lg bg-green-500/10 border border-green-500/20 shrink-0">
                        <Wallet className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                          Payment Overview
                        </p>
                        {isPaymentsLoading ? (
                          <Skeleton className="h-9 w-32" />
                        ) : (unpaidPayment || paidPayment) ? (
                          <div className="space-y-1">
                            {(() => {
                              const activePayment = unpaidPayment || paidPayment;
                              const grandTotal = parseFloat(activePayment?.total_str || "0");
                              const vat = parseFloat(activePayment?.vat_str || "0");
                              const subtotal = grandTotal - vat;
                              return (
                                <>
                                  <div className="flex items-baseline gap-1.5 flex-wrap">
                                    <span className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                                      {grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </span>
                                    <span className="text-sm font-semibold text-muted-foreground">
                                      ETB
                                    </span>
                                  </div>
                                  <div className="flex flex-col gap-0.5">
                                    <p className="text-[10px] text-muted-foreground flex items-center gap-1.5">
                                      <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
                                      Fees: {subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ETB
                                    </p>
                                    <p className="text-[10px] text-muted-foreground flex items-center gap-1.5">
                                      <span className="w-1.5 h-1.5 rounded-full bg-green-500/30" />
                                      VAT: {vat.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ETB
                                    </p>
                                  </div>
                                </>
                              );
                            })()}
                          </div>
                        ) : null}
                      </div>
                    </div>

                    {/* Middle & Right Container for Mobile */}
                    <div className="flex flex-row sm:flex-row items-center justify-between w-full sm:w-auto sm:gap-4 flex-wrap">
                      {/* Status Badge + Invoice ID */}
                      {(hasUnpaidPayment || paidPayment) && invoiceId && (
                        <div className="flex flex-col items-start sm:items-end gap-2 shrink-0">
                          <span className={cn(
                            "text-xs font-semibold px-2.5 py-1 rounded-md",
                            hasUnpaidPayment ? "bg-amber-500 text-white" : "bg-green-600 text-white"
                          )}>
                            {hasUnpaidPayment ? "Pending" : "Paid"}
                          </span>
                          <div className="text-left sm:text-right">
                            <p className="text-xs text-muted-foreground">
                              Invoice ID
                            </p>
                            <p className="text-sm font-semibold text-foreground">
                              {invoiceId}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 shrink-0">
                        {/* Invoice Button - Show if priced or later, independent of payments data */}
                        {!isShipLoading && ship && hasUnpaidPayment && ["priced", "accepted_by_shipper", "allocated", "ready_for_pickup", "in_transit", "delivered", "completed"].includes(ship.status.toLowerCase()) && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-white border border-border hover:bg-muted/50"
                            onClick={handleDownloadInvoice}
                            disabled={isDownloadingInvoice}
                          >
                            {isDownloadingInvoice ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Download className="h-3.5 w-3.5" />
                            )}
                            <span className="ml-1.5 gap-1.5 flex items-center">
                              Invoice
                            </span>
                          </Button>
                        )}

                        {isPaymentsLoading ? (
                          <div className="flex gap-2">
                            <Skeleton className="h-8 w-24 border border-border" />
                            <Skeleton className="h-8 w-20 border border-border" />
                          </div>
                        ) : (
                          <>
                            {/* Payment Actions for Unpaid */}
                            {hasUnpaidPayment && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="bg-white border border-border hover:bg-muted/50"
                                  onClick={() => setManualConfirmModalOpen(true)}
                                >
                                  Confirm
                                </Button>
                                <Button
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                  onClick={handlePayNow}
                                  disabled={createPaymentOrder.isPending}
                                >
                                  Pay Now
                                </Button>
                              </>
                            )}

                            {/* Receipt for Paid */}
                            {!hasUnpaidPayment && paidPayment && (
                              <Button
                                size="sm"
                                className="bg-primary hover:bg-primary/90 text-white"
                                onClick={() => generateReceipt(paidPayment)}
                                disabled={isGeneratingReceipt}
                              >
                                {isGeneratingReceipt ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <FileText className="h-3.5 w-3.5" />
                                )}
                                <span className="ml-1.5">Receipt</span>
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Route, Pickup & Delivery */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Route Card */}
                <Card className="border border-border bg-card">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-1.5 rounded-md bg-purple-500/10 border border-purple-500/20">
                        <MapPin className="h-3.5 w-3.5 text-purple-600" />
                      </div>
                      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Route
                      </span>
                    </div>
                    {!isShipLoading && ship && (
                      <div className="space-y-2">
                        {/* FROM */}
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                            From
                          </p>
                          <p className="text-sm font-bold text-foreground capitalize leading-tight">
                            {ship.origin?.replace(/_/g, " ") || "—"}
                          </p>
                          {ship.pickup_facility?.name && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {ship.pickup_facility.name}
                            </p>
                          )}
                        </div>
                        {/* Arrow */}
                        <div className="flex items-center justify-center py-1">
                          <div className="p-1 rounded-full bg-muted/50">
                            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/60" />
                          </div>
                        </div>
                        {/* TO */}
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                            To
                          </p>
                          <p className="text-sm font-bold text-foreground capitalize leading-tight">
                            {ship.destination?.replace(/_/g, " ") || "—"}
                          </p>
                          {ship.delivery_facility?.name && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {ship.delivery_facility.name}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Pickup Card */}
                <Card className="border border-border bg-card">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-1.5 rounded-md bg-blue-500/10 border border-blue-500/20">
                        <Calendar className="h-3.5 w-3.5 text-blue-600" />
                      </div>
                      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Pickup
                      </span>
                    </div>
                    {ship?.pickup_date && (
                      <div className="space-y-1.5">
                        <p className="text-lg font-bold text-foreground">
                          {format(new Date(ship.pickup_date), "MMM d, yyyy")}
                        </p>
                        {firstShipItemWithDriver?.pickup_scheduled_time && (
                          <p className="text-xs text-muted-foreground">
                            {format(
                              new Date(
                                firstShipItemWithDriver.pickup_scheduled_time,
                              ),
                              "hh:mm a",
                            )}
                          </p>
                        )}
                        {driver && (
                          <div className="pt-2 mt-2">
                            <div className="inline-flex flex-col gap-0.5 px-2.5 py-1.5 rounded-md bg-blue-500/10 border border-blue-500/20">
                              <p className="text-[10px] font-semibold uppercase tracking-wider text-blue-600">
                                Driver
                              </p>
                              <p className="text-sm font-bold text-blue-700">
                                {driver.first_name} {driver.last_name}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Delivery Card */}
                <Card className="border border-border bg-card">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-1.5 rounded-md bg-emerald-500/10 border border-emerald-500/20">
                        <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                      </div>
                      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Delivery
                      </span>
                    </div>
                    {ship?.delivery_date && (
                      <div className="space-y-1.5">
                        <p className="text-lg font-bold text-foreground">
                          {format(new Date(ship.delivery_date), "MMM d, yyyy")}
                        </p>
                        {firstShipItemWithTruck?.delivery_scheduled_time && (
                          <p className="text-xs text-muted-foreground">
                            {format(
                              new Date(
                                firstShipItemWithTruck.delivery_scheduled_time,
                              ),
                              "h:mm a",
                            )}
                          </p>
                        )}
                        {truck && (
                          <div className="pt-2 mt-2">
                            <div className="inline-flex flex-col gap-0.5 px-2.5 py-1.5 rounded-md bg-emerald-500/10 border border-emerald-500/20">
                              <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600">
                                Truck ID
                              </p>
                              <p className="text-sm font-bold text-emerald-700">
                                {truck.plate_number}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Shipment Details Card */}
              <Card className="border border-border bg-card">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    <div className="p-2 rounded-lg bg-orange-500/10 text-orange-600">
                      <FileText className="h-4 w-4" />
                    </div>
                    Shipment Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5 pt-2">
                  <div className="grid grid-cols-1 gap-3">
                    {/* Bill of Lading */}
                    {(ship?.shipment_details?.bill_of_lading_number ||
                      documents.some(
                        (d) => d.document_type === "BILL_OF_LADING",
                      )) && (
                        <div className="p-3 rounded-lg bg-card border border-border hover:border-orange-500/30 transition-colors">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-1">
                                Bill of Lading
                              </p>
                              <p className="font-mono text-sm font-bold text-foreground">
                                {ship?.shipment_details?.bill_of_lading_number ||
                                  "Document Only"}
                              </p>
                            </div>
                            {documents.find(
                              (d) =>
                                d.document_type === "BILL_OF_LADING" &&
                                d.presigned_url,
                            ) && (
                                <a
                                  href={
                                    documents.find(
                                      (d) => d.document_type === "BILL_OF_LADING",
                                    )?.presigned_url || "#"
                                  }
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 rounded-lg bg-orange-500/10 text-orange-600 hover:bg-orange-500/20 transition-colors"
                                  title="View Bill of Lading"
                                >
                                  <Eye className="h-4 w-4" />
                                </a>
                              )}
                          </div>
                        </div>
                      )}

                    {/* Packing List */}
                    {documents.some(
                      (d) => d.document_type === "PACKING_LIST",
                    ) && (
                        <div className="p-3 rounded-lg bg-card border border-border hover:border-orange-500/30 transition-colors">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-1">
                                Packing List
                              </p>
                              <p className="font-mono text-sm font-bold text-foreground">
                                Available
                              </p>
                            </div>
                            {documents.find(
                              (d) =>
                                d.document_type === "PACKING_LIST" &&
                                d.presigned_url,
                            ) && (
                                <a
                                  href={
                                    documents.find(
                                      (d) => d.document_type === "PACKING_LIST",
                                    )?.presigned_url || "#"
                                  }
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 rounded-lg bg-orange-500/10 text-orange-600 hover:bg-orange-500/20 transition-colors"
                                  title="View Packing List"
                                >
                                  <Eye className="h-4 w-4" />
                                </a>
                              )}
                          </div>
                        </div>
                      )}

                    {/* Pickup Number */}
                    {ship?.shipment_details?.pickup_number && (
                      <div className="p-3 rounded-lg bg-card border border-border hover:border-orange-500/30 transition-colors">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-1">
                          Pickup Number
                        </p>
                        <p className="font-mono text-sm font-bold text-foreground">
                          {ship.shipment_details.pickup_number}
                        </p>
                      </div>
                    )}

                    {/* Delivery Number */}
                    {ship?.shipment_details?.delivery_number && (
                      <div className="p-3 rounded-lg bg-card border border-border hover:border-orange-500/30 transition-colors">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-1">
                          Delivery Number
                        </p>
                        <p className="font-mono text-sm font-bold text-foreground">
                          {ship.shipment_details.delivery_number}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Shipper Details Card - Only show if paid */}
              {(shipperInfo || isShipperLoading) && (
                <Card className="border border-border bg-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                      <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600">
                        <User className="h-4 w-4" />
                      </div>
                      Shipper Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-2">
                    {isShipperLoading ? (
                      <div className="space-y-3">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-4 w-full" />
                      </div>
                    ) : shipperInfo ? (
                      <>
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                            Shipper Name
                          </p>
                          <p className="font-bold text-foreground text-lg">
                            {shipperInfo.name}
                          </p>
                        </div>
                        <div className="space-y-3 pt-2">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-600">
                              <FileText className="h-3 w-3" />
                            </div>
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                                Email
                              </p>
                              <p className="text-sm font-medium">
                                {shipperInfo.email}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-600">
                              <User className="h-3 w-3" />
                            </div>
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                                Phone
                              </p>
                              <p className="text-sm font-medium">
                                {shipperInfo.phone}
                              </p>
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        No shipper details available.
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Ship Items */}
              {shipItems.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
                        <Package className="h-4 w-4" />
                      </div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Ship Items
                      </span>
                    </div>
                    <span className="text-xs font-bold text-foreground bg-muted px-2 py-1 rounded-full">
                      {shipItems.length}
                    </span>
                  </div>
                  <DataTable
                    columns={shipItemColumns}
                    data={shipItems}
                    meta={{
                      onViewContainers: handleViewShipItemContainers,
                      onAssignClick: handleAssignClick,
                      onMarkAsDelivered: handleMarkAsDelivered,
                      trucks,
                      drivers,
                      ship,
                      isAssigning:
                        assignTruck.isPending || assignDriver.isPending,
                      isMarkingDelivered: markAsDelivered.isPending,
                      isTransporter: user?.role === "transporter",
                    }}
                    variant="clean"
                    hideColumnVisibility
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      <ContainersModal
        containers={modalContainers}
        open={showContainersModal}
        onOpenChange={setShowContainersModal}
      />

      <AssignModal
        open={assignModalOpen}
        onOpenChange={setAssignModalOpen}
        shipItem={selectedShipItem}
        trucks={trucks}
        drivers={drivers}
        onAssign={handleAssign}
        isAssigning={assignTruck.isPending || assignDriver.isPending}
        allShipItems={shipItems}
      />

      {unpaidPayment && (
        <ManualConfirmationModal
          open={manualConfirmModalOpen}
          onOpenChange={setManualConfirmModalOpen}
          paymentId={unpaidPayment.id}
          shipId={Number(id)}
        />
      )}

      <Dialog open={paymentModalOpen} onOpenChange={setPaymentModalOpen}>
        <DialogContent className="max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Payment
            </DialogTitle>
            <DialogDescription>
              Preparing your payment via Telebirr
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {createPaymentOrder.isPending && (
              <div className="flex flex-col items-center py-8 gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">
                  Preparing payment gateway...
                </p>
              </div>
            )}
            {createPaymentOrder.isError && (
              <>
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {createPaymentOrder.error?.message ??
                      "Something went wrong"}
                  </AlertDescription>
                </Alert>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setPaymentModalOpen(false)}
                  >
                    Close
                  </Button>
                </DialogFooter>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function ShipDetailsClient() {
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <ShipDetailsContent />
    </Suspense>
  );
}
