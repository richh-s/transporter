"use client";

import { useState, Suspense, useEffect } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { FileOpener } from "@capacitor-community/file-opener";
import { Capacitor } from "@capacitor/core";
import { Browser } from "@capacitor/browser";
import { format } from "date-fns";
import { Container, Truck, Driver } from "@/types/ship";
import { Card, CardContent } from "@/components/ui/card";
import {
  MapPin,
  Building2,
  FileText,
  CreditCard,
  Phone,
  Loader2,
  AlertCircle,
  Calendar,
  ArrowRight,
  Package,
} from "lucide-react";
import { CompactBreadcrumb } from "@/components/ui/mobile-breadcrumb";
import Link from "next/link";
import {
  useShip,
  useAssignTruck,
  useAssignDriver,
  useShipPayments,
  useCreatePaymentOrder,
} from "@/hooks/use-ships";
import { useTrucksQuery } from "@/hooks/use-trucks-query";
import { useDrivers } from "@/hooks/use-drivers";
import { ContainersModal } from "./containers-modal";
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
import { toast } from "sonner";
import { shipApi } from "@/lib/api/ships";
import { cn } from "@/lib/utils";
import { ShipItem } from "@/types/ship";

// Status Badge Component
function StatusBadge({ status }: { status: string }) {
  const getConfig = (s: string) => {
    const normalized = s?.toUpperCase();
    switch (normalized) {
      case "COMPLETED":
      case "DELIVERED":
        return {
          dot: "bg-emerald-500",
          text: "text-emerald-700",
          bg: "bg-emerald-500/10",
        };
      case "IN_TRANSIT":
        return {
          dot: "bg-amber-500",
          text: "text-amber-700",
          bg: "bg-amber-500/10",
        };
      case "PENDING":
        return {
          dot: "bg-blue-500",
          text: "text-blue-700",
          bg: "bg-blue-500/10",
        };
      case "ASSIGNED":
        return { dot: "bg-primary", text: "text-primary", bg: "bg-primary/10" };
      default:
        return { dot: "bg-gray-400", text: "text-gray-600", bg: "bg-gray-100" };
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

// Info Card Component
function InfoCard({
  icon: Icon,
  iconBg,
  title,
  children,
  className,
}: {
  icon: React.ElementType;
  iconBg: string;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("border-0 shadow-sm", className)}>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <div className={cn("p-2 rounded-xl", iconBg)}>
            <Icon className="h-4 w-4" />
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {title}
          </span>
        </div>
        {children}
      </CardContent>
    </Card>
  );
}

// Detail Row Component
function DetailRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-border/50 last:border-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span
        className={cn(
          "text-sm font-medium text-foreground",
          mono && "font-mono",
        )}
      >
        {value || "—"}
      </span>
    </div>
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
  const router = useRouter();
  const rawId = searchParams.get("id") || (params.id as string);
  const id = rawId && rawId !== "placeholder" ? rawId : "";

  // Hooks
  const {
    data: ship,
    isLoading: isShipLoading,
    error: shipError,
  } = useShip(id || "0");
  const { data: trucksData } = useTrucksQuery({ per_page: 100 });
  const { data: driversData } = useDrivers({ per_page: 100 });
  const { data: payments } = useShipPayments(id || "0");
  const createPaymentOrder = useCreatePaymentOrder(id || "0");
  const [isDownloadingInvoice, setIsDownloadingInvoice] = useState(false);
  const assignTruck = useAssignTruck(id || "0");
  const assignDriver = useAssignDriver(id || "0");

  // State
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [showContainersModal, setShowContainersModal] = useState(false);
  const [modalContainers, setModalContainers] = useState<Container[]>([]);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedShipItem, setSelectedShipItem] = useState<ShipItem | null>(
    null,
  );

  useEffect(() => {
    if (!id) router.replace("/ships");
  }, [id, router]);

  // Navigate to payment page when URL is received
  useEffect(() => {
    const paymentUrl = createPaymentOrder.data?.result?.payment_url;
    if (paymentUrl && createPaymentOrder.isSuccess) {
      console.log(
        "💳 [Payment] Navigating to payment page with URL:",
        paymentUrl,
      );

      // Close the modal
      setPaymentModalOpen(false);

      // Telebirr sandbox requires requests from localhost:8000/index.html
      // For production, Telebirr must whitelist your domain
      const encodedUrl = encodeURIComponent(paymentUrl);
      const returnUrl = encodeURIComponent(window.location.href);

      // Get payment server URL from env or use default
      // For mobile dev: set NEXT_PUBLIC_PAYMENT_SERVER_URL to your computer's IP (e.g., http://192.168.1.100:8000)
      // For production: set to your hosted payment page URL
      const paymentServerUrl =
        process.env.NEXT_PUBLIC_PAYMENT_SERVER_URL ||
        (process.env.NODE_ENV === "development"
          ? "http://localhost:8000"
          : `${window.location.origin}/telebirr-payment.html`);

      const fullPaymentUrl = paymentServerUrl.includes("telebirr-payment.html")
        ? `${paymentServerUrl}?url=${encodedUrl}`
        : `${paymentServerUrl}?url=${encodedUrl}&return=${returnUrl}`;

      console.log("💳 [Payment] Opening payment page:", fullPaymentUrl);
      console.log(
        "💳 [Payment] Is native platform:",
        Capacitor.isNativePlatform(),
      );

      if (Capacitor.isNativePlatform()) {
        // On mobile, use Capacitor Browser to open in-app browser overlay
        // Uses SFSafariViewController (iOS) / Chrome Custom Tabs (Android)
        // This provides a browser context that Telebirr accepts while staying "in-app"
        Browser.open({
          url: fullPaymentUrl,
          presentationStyle: "popover", // Shows as overlay, feels more "in-app"
          toolbarColor: "#4ba94d", // Match app's brand color
        }).catch((err) => {
          console.error("💳 [Payment] Browser.open failed:", err);
          // Fallback to window.open
          window.open(fullPaymentUrl, "_blank");
        });

        // Listen for browser close event to refresh payment status
        const listener = Browser.addListener("browserFinished", () => {
          console.log("💳 [Payment] In-app browser closed, refreshing...");
          listener.remove();
          // Optionally refresh payment status here
        });
      } else {
        // On web, redirect to the payment page
        window.location.href = fullPaymentUrl;
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
  const unpaidPayment = payments?.find((p) => !p.paid);
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

  const handleAssign = (
    shipItemId: number,
    truckId: number | null,
    driverId: number | null,
  ) => {
    if (truckId)
      assignTruck.mutate({ shipItemId, data: { truck_id: truckId } });
    if (driverId)
      assignDriver.mutate({ shipItemId, data: { driver_id: driverId } });
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

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-300">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border/50 px-4 py-3">
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
              {!isShipLoading && ship && (
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  {ship.origin?.replace(/_/g, " ")}{" "}
                  <ArrowRight className="h-3 w-3" />{" "}
                  {ship.destination?.replace(/_/g, " ")}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          {isShipLoading ? (
            <DetailSkeleton />
          ) : (
            <>
              {/* Payment Card */}
              <Card className="border-0 shadow-sm overflow-hidden">
                <div className="bg-linear-to-r from-primary/10 to-primary/5 p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-white/80 text-primary shadow-sm">
                        <CreditCard className="h-4 w-4" />
                      </div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Payment
                      </span>
                    </div>
                    <span
                      className={cn(
                        "text-xs font-semibold px-2.5 py-1 rounded-full",
                        hasUnpaidPayment
                          ? "text-amber-700 bg-amber-100"
                          : "text-emerald-700 bg-emerald-100",
                      )}
                    >
                      {hasUnpaidPayment ? "Pending" : "Paid"}
                    </span>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-3xl font-bold text-foreground tracking-tight">
                          {unpaidPayment ? unpaidPayment.total_str : "0"}
                        </span>
                        <span className="text-sm font-semibold text-muted-foreground">
                          ETB
                        </span>
                      </div>
                      {unpaidPayment && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Incl. VAT {unpaidPayment.vat_str} ETB
                        </p>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-white/80 hover:bg-white"
                        onClick={handleDownloadInvoice}
                        disabled={isDownloadingInvoice}
                      >
                        {isDownloadingInvoice ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <FileText className="h-4 w-4" />
                        )}
                        <span className="ml-1.5">Invoice</span>
                      </Button>
                      {hasUnpaidPayment && (
                        <Button
                          size="sm"
                          className="bg-primary hover:bg-primary/90 shadow-sm"
                          onClick={handlePayNow}
                          disabled={createPaymentOrder.isPending}
                        >
                          Pay Now
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>

              {/* Pickup & Delivery */}
              <div className="grid grid-cols-2 gap-3">
                {/* Pickup Card */}
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-blue-500/10">
                          <MapPin className="h-3.5 w-3.5 text-blue-500" />
                        </div>
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                          Pickup
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm font-bold">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                      {ship?.pickup_date
                        ? format(new Date(ship.pickup_date), "MMM d, yyyy")
                        : "—"}
                    </div>
                    <div className="space-y-1 pt-1 border-t border-border/50">
                      <p className="font-medium text-xs line-clamp-1">
                        {ship?.pickup_facility?.name || "—"}
                      </p>
                      <p className="text-[11px] text-muted-foreground line-clamp-2">
                        {ship?.pickup_facility?.address || "—"}
                      </p>
                      {ship?.pickup_facility?.contact_phone_number && (
                        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          {ship.pickup_facility.contact_phone_number}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Delivery Card */}
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-emerald-500/10">
                          <Building2 className="h-3.5 w-3.5 text-emerald-500" />
                        </div>
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                          Delivery
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm font-bold">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                      {ship?.delivery_date
                        ? format(new Date(ship.delivery_date), "MMM d, yyyy")
                        : "—"}
                    </div>
                    <div className="space-y-1 pt-1 border-t border-border/50">
                      <p className="font-medium text-xs line-clamp-1">
                        {ship?.delivery_facility?.name || "—"}
                      </p>
                      <p className="text-[11px] text-muted-foreground line-clamp-2">
                        {ship?.delivery_facility?.address || "—"}
                      </p>
                      {ship?.delivery_facility?.contact_phone_number && (
                        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          {ship.delivery_facility.contact_phone_number}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Shipment Details */}
              <InfoCard
                icon={FileText}
                iconBg="bg-orange-500/10 text-orange-500"
                title="Shipment Details"
              >
                <div className="space-y-1">
                  <DetailRow
                    label="Bill of Lading"
                    value={ship?.shipment_details?.bill_of_lading_number || ""}
                    mono
                  />
                  <DetailRow
                    label="Pickup Number"
                    value={ship?.shipment_details?.pickup_number || ""}
                    mono
                  />
                  <DetailRow
                    label="Delivery Number"
                    value={ship?.shipment_details?.delivery_number || ""}
                    mono
                  />
                </div>
              </InfoCard>

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
                      trucks,
                      drivers,
                      ship,
                      isAssigning:
                        assignTruck.isPending || assignDriver.isPending,
                    }}
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
