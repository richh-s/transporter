"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { format } from "date-fns";
import { Container, Truck, Driver } from "@/types/ship";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  MapPin,
  Building2,
  FileText,
  Truck as TruckIcon,
  ArrowLeft,
  CreditCard,
  Download,
  User,
  Loader2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
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
import { toast } from "sonner";
import { shipApi } from "@/lib/api/ships";

export default function ShipDetailsClient() {
  const params = useParams();
  const id = params.id as string;

  const {
    data: ship,
    isLoading: isShipLoading,
    error: shipError,
  } = useShip(id);
  const { data: trucksData } = useTrucksQuery({ per_page: 100 });
  const { data: driversData } = useDrivers({ per_page: 100 });
  const { data: payments, isLoading: isPaymentsLoading } = useShipPayments(id);
  const createPaymentOrder = useCreatePaymentOrder(id);
  const [isDownloadingInvoice, setIsDownloadingInvoice] = useState(false);

  console.log("🚛 Trucks Data Response:", trucksData);
  console.log("💰 Payments Response:", payments);

  const assignTruck = useAssignTruck(id);
  const assignDriver = useAssignDriver(id);

  const trucks = Array.isArray(trucksData)
    ? trucksData
    : (trucksData as unknown as { items: Truck[] })?.items || [];
  const drivers = Array.isArray(driversData)
    ? driversData
    : (driversData as unknown as { items: Driver[] })?.items || [];

  const error = shipError ? (shipError as Error).message : null;

  // Find unpaid payment
  const unpaidPayment = payments?.find((p) => !p.paid);
  const hasUnpaidPayment = !!unpaidPayment;

  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  const handlePayNow = () => {
    if (!unpaidPayment) {
      toast.error("No unpaid payments found for this ship");
      return;
    }
    setPaymentModalOpen(true);
    createPaymentOrder.mutate({
      payment_id: unpaidPayment.id,
      ship_id: Number(id),
      title: `Payment`,
    });
  };

  const paymentUrl = createPaymentOrder.data?.result?.payment_url ?? null;

  const openPaymentPopup = () => {
    if (!paymentUrl) return;
    const w = 560;
    const h = 700;
    const left = Math.round(
      (typeof window !== "undefined" ? window.screen.width : 1024) / 2 - w / 2,
    );
    const top = Math.round(
      (typeof window !== "undefined" ? window.screen.height : 768) / 2 - h / 2,
    );
    window.open(
      paymentUrl,
      "payment_popup",
      `width=${w},height=${h},left=${left},top=${top},scrollbars=yes,resizable=yes`,
    );
  };

  const handleDownloadInvoice = async () => {
    try {
      setIsDownloadingInvoice(true);
      toast.loading("Downloading invoice...");

      const blob = await shipApi.getInvoice(id);

      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob);

      // Create a temporary link and trigger download
      const link = document.createElement("a");
      link.href = url;
      link.download = `invoice-ship-${id}.pdf`;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.dismiss();
      toast.success("Invoice downloaded successfully");
    } catch (error: unknown) {
      toast.dismiss();
      const errorMessage =
        error instanceof Error ? error.message : "Failed to download invoice";
      toast.error(errorMessage);
    } finally {
      setIsDownloadingInvoice(false);
    }
  };

  const handleViewShipItemContainers = (containers: Container[]) => {
    setModalContainers(containers);
    setShowContainersModal(true);
  };

  const handleTruckChange = (shipItemId: number, truckId: number | null) => {
    setSelectedTrucks((prev: Record<number, number | null>) => ({
      ...prev,
      [shipItemId]: truckId,
    }));
  };

  const handleDriverChange = (shipItemId: number, driverId: number | null) => {
    setSelectedDrivers((prev: Record<number, number | null>) => ({
      ...prev,
      [shipItemId]: driverId,
    }));
  };

  const handleAssign = (
    shipItemId: number,
    truckId: number | null,
    driverId: number | null,
  ) => {
    if (truckId) {
      assignTruck.mutate({ shipItemId, data: { truck_id: truckId } });
    }
    if (driverId) {
      assignDriver.mutate({ shipItemId, data: { driver_id: driverId } });
    }
  };

  const [showContainersModal, setShowContainersModal] = useState(false);
  const [modalContainers, setModalContainers] = useState<Container[]>([]);
  const [selectedTrucks, setSelectedTrucks] = useState<
    Record<number, number | null>
  >({});
  const [selectedDrivers, setSelectedDrivers] = useState<
    Record<number, number | null>
  >({});

  if (error) {
    return (
      <div className="p-10 text-center space-y-4">
        <p className="text-red-500 font-medium">{error}</p>
        <Link href="/ships">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Ships List
          </Button>
        </Link>
      </div>
    );
  }

  const shipItems = ship?.ship_items || [];

  return (
    <div className="container mx-auto py-10 space-y-8">
      <Link
        href="/ships"
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors w-fit"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Ships</span>
      </Link>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            {isShipLoading ? (
              <Skeleton className="h-9 w-48" />
            ) : (
              `Shipment #${ship?.id}`
            )}
            {!isShipLoading && ship && (
              <Badge variant="outline" className="text-lg">
                {ship.status}
              </Badge>
            )}
          </h1>
          <div className="text-muted-foreground mt-1">
            {isShipLoading ? (
              <Skeleton className="h-5 w-64" />
            ) : (
              `${ship?.origin} → ${ship?.destination}`
            )}
          </div>
        </div>
        <div className="flex gap-4 text-sm text-right">
          <div className="flex flex-col">
            <span className="text-muted-foreground">Pickup Date</span>
            <div className="font-medium">
              {isShipLoading ? (
                <Skeleton className="h-5 w-24 mt-1" />
              ) : ship?.pickup_date ? (
                format(new Date(ship.pickup_date), "PPP")
              ) : (
                "N/A"
              )}
            </div>
          </div>
          <Separator orientation="vertical" className="h-10" />
          <div className="flex flex-col">
            <span className="text-muted-foreground">Delivery Date</span>
            <div className="font-medium">
              {isShipLoading ? (
                <Skeleton className="h-5 w-24 mt-1" />
              ) : ship?.delivery_date ? (
                format(new Date(ship.delivery_date), "PPP")
              ) : (
                "N/A"
              )}
            </div>
          </div>
        </div>
      </div>

      <Separator />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Payment Summary */}
        <Card className="md:col-span-full bg-brand-primary/5 border-brand-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2 text-brand-primary">
              <CreditCard className="h-5 w-5" />
              Payment Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-1 flex-1">
              <p className="text-sm text-muted-foreground">Total Amount Due</p>
              <div className="text-3xl font-bold text-brand-primary">
                {isPaymentsLoading ? (
                  <Skeleton className="h-9 w-32" />
                ) : unpaidPayment ? (
                  `${unpaidPayment.total_str} ETB`
                ) : (
                  <span className="text-green-600 text-xl">✓ Fully Paid</span>
                )}
              </div>
              {!isPaymentsLoading && unpaidPayment && (
                <div className="text-xs text-muted-foreground space-y-0.5">
                  <p>VAT: {unpaidPayment.vat_str} ETB</p>
                  <p>
                    Payment Method:{" "}
                    {unpaidPayment.payment_method
                      .replace("_", " ")
                      .toUpperCase()}
                  </p>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <Button
                size="lg"
                variant="outline"
                className="px-6"
                onClick={handleDownloadInvoice}
                disabled={isDownloadingInvoice}
              >
                <Download className="mr-2 h-4 w-4" />
                {isDownloadingInvoice ? "Downloading..." : "Invoice"}
              </Button>
              <Button
                size="lg"
                className="bg-brand-primary hover:bg-brand-secondary text-white px-8"
                onClick={handlePayNow}
                disabled={
                  !hasUnpaidPayment ||
                  isPaymentsLoading ||
                  createPaymentOrder.isPending
                }
              >
                {createPaymentOrder.isPending
                  ? "Processing..."
                  : hasUnpaidPayment
                    ? "Pay Now"
                    : "No Payment Due"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Pickup Facility */}
        <Card className="relative overflow-hidden border-none bg-gradient-to-br from-primary/5 via-background to-background shadow-lg shadow-primary/5 hover:shadow-xl transition-all duration-500 group">
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/5 blur-3xl group-hover:bg-primary/10 transition-colors" />
          <CardHeader className="relative z-10 pb-2">
            <CardTitle className="flex items-center gap-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              <div className="p-2 rounded-xl bg-red-500/10 text-red-500">
                <MapPin className="h-4 w-4" />
              </div>
              Pickup Facility
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 relative z-10 pt-2">
            {isShipLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                    Facility Name
                  </p>
                  <p className="font-bold text-foreground text-lg">
                    {ship?.pickup_facility?.name || "-"}
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <div className="mt-1 p-1 rounded-md bg-muted/50">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                        Location
                      </span>
                      <p className="text-sm font-medium leading-relaxed max-w-[200px]">
                        {ship?.pickup_facility?.address || "-"}
                      </p>
                      <p className="text-xs text-secondary font-bold mt-0.5">
                        {ship?.pickup_facility?.region || "-"},{" "}
                        {ship?.pickup_facility?.country || "-"}
                      </p>
                    </div>
                  </div>
                  <Separator className="bg-border/40" />
                  <div className="flex items-start gap-2 pt-1">
                    <div className="mt-1 p-1 rounded-md bg-muted/50">
                      <User className="h-3 w-3 text-muted-foreground" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                        Contact Person
                      </span>
                      <p className="text-sm font-bold text-foreground">
                        {ship?.pickup_facility?.contact_name || "-"}
                      </p>
                      <div className="flex flex-col mt-1 gap-1">
                        <p className="text-xs text-muted-foreground font-medium flex items-center gap-1.5 hover:text-primary transition-colors cursor-pointer">
                          <span className="h-1 w-1 rounded-full bg-primary" />
                          {ship?.pickup_facility?.contact_phone_number || "-"}
                        </p>
                        <p className="text-xs text-muted-foreground font-medium flex items-center gap-1.5 hover:text-primary transition-colors cursor-pointer truncate max-w-[200px]">
                          <span className="h-1 w-1 rounded-full bg-primary" />
                          {ship?.pickup_facility?.contact_email || "-"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Delivery Facility */}
        <Card className="relative overflow-hidden border-none bg-gradient-to-br from-secondary/5 via-background to-background shadow-lg hover:shadow-xl transition-all duration-500 group">
          <div className="absolute -left-8 -bottom-8 h-32 w-32 rounded-full bg-secondary/5 blur-3xl group-hover:bg-secondary/10 transition-colors" />
          <CardHeader className="relative z-10 pb-2">
            <CardTitle className="flex items-center gap-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <Building2 className="h-4 w-4" />
              </div>
              Delivery Facility
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 relative z-10 pt-2">
            {isShipLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                    Facility Name
                  </p>
                  <p className="font-bold text-foreground text-lg">
                    {ship?.delivery_facility?.name || "-"}
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <div className="mt-1 p-1 rounded-md bg-muted/50">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                        Location
                      </span>
                      <p className="text-sm font-medium leading-relaxed max-w-[200px]">
                        {ship?.delivery_facility?.address || "-"}
                      </p>
                      <p className="text-xs text-secondary font-bold mt-0.5">
                        {ship?.delivery_facility?.region || "-"},{" "}
                        {ship?.delivery_facility?.country || "-"}
                      </p>
                    </div>
                  </div>
                  <Separator className="bg-border/40" />
                  <div className="flex items-start gap-2 pt-1">
                    <div className="mt-1 p-1 rounded-md bg-muted/50">
                      <User className="h-3 w-3 text-muted-foreground" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                        Contact Person
                      </span>
                      <p className="text-sm font-bold text-foreground">
                        {ship?.delivery_facility?.contact_name || "-"}
                      </p>
                      <div className="flex flex-col mt-1 gap-1">
                        <p className="text-xs text-muted-foreground font-medium flex items-center gap-1.5 hover:text-primary transition-colors cursor-pointer">
                          <span className="h-1 w-1 rounded-full bg-primary" />
                          {ship?.delivery_facility?.contact_phone_number || "-"}
                        </p>
                        <p className="text-xs text-muted-foreground font-medium flex items-center gap-1.5 hover:text-primary transition-colors cursor-pointer truncate max-w-[200px]">
                          <span className="h-1 w-1 rounded-full bg-primary" />
                          {ship?.delivery_facility?.contact_email || "-"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Shipment Details */}
        <Card className="relative overflow-hidden border-none bg-gradient-to-br from-muted/20 via-background to-background shadow-lg hover:shadow-xl transition-all duration-500 group">
          <CardHeader className="relative z-10 pb-2">
            <CardTitle className="flex items-center gap-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              <div className="p-2 rounded-xl bg-orange-500/10 text-orange-600">
                <FileText className="h-4 w-4" />
              </div>
              Shipment Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 relative z-10 pt-2">
            {isShipLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  <div className="p-3 rounded-2xl bg-white/40 dark:bg-card/40 backdrop-blur-sm border border-border/50 hover:border-orange-500/30 transition-all duration-300 shadow-sm">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-1">
                      Bill of Lading
                    </p>
                    <p className="font-mono text-sm font-bold text-foreground">
                      {ship?.shipment_details?.bill_of_lading_number || "-"}
                    </p>
                  </div>
                  <div className="p-3 rounded-2xl bg-white/40 dark:bg-card/40 backdrop-blur-sm border border-border/50 hover:border-orange-500/30 transition-all duration-300 shadow-sm">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-1">
                      Pickup Number
                    </p>
                    <p className="font-mono text-sm font-bold text-foreground">
                      {ship?.shipment_details?.pickup_number || "-"}
                    </p>
                  </div>
                  <div className="p-3 rounded-2xl bg-white/40 dark:bg-card/40 backdrop-blur-sm border border-border/50 hover:border-orange-500/30 transition-all duration-300 shadow-sm">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-1">
                      Delivery Number
                    </p>
                    <p className="font-mono text-sm font-bold text-foreground">
                      {ship?.shipment_details?.delivery_number || "-"}
                    </p>
                  </div>
                </div>
                <div className="pt-2">
                  <Button
                    variant="outline"
                    className="w-full text-xs font-bold uppercase tracking-widest border-border/50 hover:bg-orange-500/5 hover:text-orange-600 hover:border-orange-500/30 transition-all rounded-xl h-9"
                  >
                    View All Details
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Ship Items Table Section */}
      {(isShipLoading || shipItems.length > 0) && (
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
              <TruckIcon className="h-6 w-6" />
              Ship Items
            </h2>
            {!isShipLoading && (
              <div className="text-sm text-muted-foreground">
                Total:{" "}
                <span className="font-bold text-foreground">
                  {shipItems.length}
                </span>
              </div>
            )}
          </div>

          {isShipLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (
            <DataTable
              columns={shipItemColumns}
              data={shipItems}
              meta={{
                onViewContainers: handleViewShipItemContainers,
                trucks,
                drivers,
                onAssign: handleAssign,
                selectedTrucks,
                selectedDrivers,
                onTruckChange: handleTruckChange,
                onDriverChange: handleDriverChange,
                ship,
                isAssigning: assignTruck.isPending || assignDriver.isPending,
              }}
            />
          )}
        </section>
      )}

      {/* Containers Modal */}
      <ContainersModal
        containers={modalContainers}
        open={showContainersModal}
        onOpenChange={setShowContainersModal}
      />

      {/* Payment preview modal: summary, loading, error, then open gateway in popup */}
      <Dialog open={paymentModalOpen} onOpenChange={setPaymentModalOpen}>
        <DialogContent className="max-w-md max-h-[90vh] flex flex-col gap-4 overflow-hidden sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-brand-primary" />
              Payment
            </DialogTitle>
            <DialogDescription>
              Review the payment summary below. Proceed to complete payment in
              the secure window.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto min-h-0 space-y-4 pr-1">
            {createPaymentOrder.isPending && (
              <div className="flex flex-col items-center justify-center py-8 gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-brand-primary" />
                <p className="text-sm text-muted-foreground">
                  Preparing payment...
                </p>
              </div>
            )}

            {createPaymentOrder.isError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {createPaymentOrder.error?.message ??
                    "Something went wrong. Please try again."}
                </AlertDescription>
              </Alert>
            )}

            {!createPaymentOrder.isPending &&
              !createPaymentOrder.isError &&
              unpaidPayment && (
                <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Summary
                  </p>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total</span>
                      <span className="font-semibold">
                        {unpaidPayment.total_str} ETB
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">VAT</span>
                      <span>{unpaidPayment.vat_str} ETB</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t">
                      <span className="text-muted-foreground">Method</span>
                      <span>
                        {unpaidPayment.payment_method
                          .replace("_", " ")
                          .toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              )}

            {!createPaymentOrder.isPending && paymentUrl && (
              <p className="text-xs text-muted-foreground">
                Click &quot;Proceed to payment&quot; to open the secure payment
                window. You can close this dialog and stay on this page.
              </p>
            )}
          </div>

          <DialogFooter className="shrink-0 gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setPaymentModalOpen(false)}
            >
              Close
            </Button>
            {paymentUrl && (
              <Button
                className="bg-brand-primary hover:bg-brand-secondary text-white"
                onClick={openPaymentPopup}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Proceed to payment
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
