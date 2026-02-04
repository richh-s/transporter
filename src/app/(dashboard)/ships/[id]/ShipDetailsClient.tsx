"use client";

import { useState, Suspense, useEffect } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { Browser } from "@capacitor/browser";
import { format } from "date-fns";
import { Container, Truck, Driver } from "@/types/ship";
import { Card, CardContent } from "@/components/ui/card";
import {
  MapPin,
  Building2,
  FileText,
  CreditCard,
  Download,
  Phone,
  Loader2,
  AlertCircle,
  ExternalLink,
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
  const paymentUrl = createPaymentOrder.data?.result?.payment_url ?? null;

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

  const openPaymentPopup = async () => {
    if (!paymentUrl) return;
    try {
      await Browser.open({
        url: paymentUrl,
        presentationStyle: "popover",
        toolbarColor: "#4ba94d",
      });
    } catch {
      window.open(paymentUrl, "_blank");
    }
  };

  const handleDownloadInvoice = async () => {
    try {
      setIsDownloadingInvoice(true);
      toast.loading("Downloading invoice...");
      const blob = await shipApi.getInvoice(id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `invoice-ship-${id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.dismiss();
      toast.success("Invoice downloaded");
    } catch (err) {
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
              <Card className="border-0 shadow-sm bg-primary/5">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-primary/10 text-primary">
                        <CreditCard className="h-4 w-4" />
                      </div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Payment
                      </span>
                    </div>
                    {hasUnpaidPayment && (
                      <span className="text-xs font-semibold text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full">
                        Pending
                      </span>
                    )}
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-2xl font-bold text-foreground">
                        {unpaidPayment
                          ? `${unpaidPayment.total_str} ETB`
                          : "Paid"}
                      </p>
                      {unpaidPayment && (
                        <p className="text-xs text-muted-foreground mt-1">
                          VAT: {unpaidPayment.vat_str} ETB
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDownloadInvoice}
                        disabled={isDownloadingInvoice}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        className="bg-primary hover:bg-primary/90"
                        onClick={handlePayNow}
                        disabled={
                          !hasUnpaidPayment || createPaymentOrder.isPending
                        }
                      >
                        {hasUnpaidPayment ? "Pay Now" : "Paid"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Dates Row */}
              <div className="grid grid-cols-2 gap-3">
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4 text-blue-500" />
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Pickup
                      </span>
                    </div>
                    <p className="text-sm font-bold">
                      {ship?.pickup_date
                        ? format(new Date(ship.pickup_date), "MMM d, yyyy")
                        : "—"}
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4 text-emerald-500" />
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Delivery
                      </span>
                    </div>
                    <p className="text-sm font-bold">
                      {ship?.delivery_date
                        ? format(new Date(ship.delivery_date), "MMM d, yyyy")
                        : "—"}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Facilities */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <InfoCard
                  icon={MapPin}
                  iconBg="bg-red-500/10 text-red-500"
                  title="Pickup"
                >
                  <div className="space-y-2">
                    <p className="font-semibold text-sm">
                      {ship?.pickup_facility?.name || "—"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {ship?.pickup_facility?.address || "—"}
                    </p>
                    {ship?.pickup_facility?.contact_phone_number && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        {ship.pickup_facility.contact_phone_number}
                      </div>
                    )}
                  </div>
                </InfoCard>
                <InfoCard
                  icon={Building2}
                  iconBg="bg-emerald-500/10 text-emerald-500"
                  title="Delivery"
                >
                  <div className="space-y-2">
                    <p className="font-semibold text-sm">
                      {ship?.delivery_facility?.name || "—"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {ship?.delivery_facility?.address || "—"}
                    </p>
                    {ship?.delivery_facility?.contact_phone_number && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        {ship.delivery_facility.contact_phone_number}
                      </div>
                    )}
                  </div>
                </InfoCard>
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
              Complete your payment securely
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {createPaymentOrder.isPending && (
              <div className="flex flex-col items-center py-8 gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">
                  Preparing payment...
                </p>
              </div>
            )}
            {createPaymentOrder.isError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {createPaymentOrder.error?.message ?? "Something went wrong"}
                </AlertDescription>
              </Alert>
            )}
            {!createPaymentOrder.isPending &&
              !createPaymentOrder.isError &&
              unpaidPayment && (
                <div className="rounded-xl bg-muted/50 p-4 space-y-2">
                  <DetailRow
                    label="Total"
                    value={`${unpaidPayment.total_str} ETB`}
                  />
                  <DetailRow
                    label="VAT"
                    value={`${unpaidPayment.vat_str} ETB`}
                  />
                  <DetailRow
                    label="Method"
                    value={unpaidPayment.payment_method
                      .replace("_", " ")
                      .toUpperCase()}
                  />
                </div>
              )}
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setPaymentModalOpen(false)}
            >
              Close
            </Button>
            {paymentUrl && (
              <Button className="bg-primary" onClick={openPaymentPopup}>
                <ExternalLink className="mr-2 h-4 w-4" />
                Pay Now
              </Button>
            )}
          </DialogFooter>
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
