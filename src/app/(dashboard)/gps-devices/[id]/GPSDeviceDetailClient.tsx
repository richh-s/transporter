"use client";

import { useState, Suspense, useEffect, useMemo } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import {
  Edit,
  Power,
  Loader2,
  Satellite,
  Truck,
  Calendar,
  Clock,
  Hash,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { CompactBreadcrumb } from "@/components/ui/mobile-breadcrumb";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { useGPSDevice, useDeactivateGPSDevice } from "@/hooks/use-gps-devices";
import { useTrucks } from "@/hooks/use-trucks";
import { cn } from "@/lib/utils";

// Status Badge Component
function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold",
        active
          ? "bg-emerald-500/10 text-emerald-600"
          : "bg-gray-500/10 text-gray-600",
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          active ? "bg-emerald-500" : "bg-gray-400",
        )}
      />
      {active ? "Active" : "Inactive"}
    </span>
  );
}

// Info Card Component
function InfoCard({
  icon: Icon,
  title,
  children,
  accent = "bg-primary/10 text-primary",
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
  accent?: string;
}) {
  return (
    <div className="rounded-xl bg-card border border-border/50 shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 p-3 border-b border-border/50 bg-muted/30">
        <div className={cn("p-1.5 rounded-lg", accent)}>
          <Icon className="h-3.5 w-3.5" />
        </div>
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </span>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

// Detail Row Component
function DetailRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string | number | React.ReactNode;
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
        <Skeleton className="h-9 w-9 rounded-xl" />
        <div className="space-y-1">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <Skeleton className="h-20 w-full rounded-xl" />
      <Skeleton className="h-32 w-full rounded-xl" />
      <Skeleton className="h-24 w-full rounded-xl" />
    </div>
  );
}

function GPSDeviceDetailContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const rawId = searchParams.get("id") || (params.id as string);
  const id = rawId && rawId !== "placeholder" ? Number(rawId) : NaN;

  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);

  const { data: device, isLoading, error } = useGPSDevice(isNaN(id) ? 0 : id);
  const deactivateMutation = useDeactivateGPSDevice();
  const { data: trucks = [] } = useTrucks();

  // Create mapping object: { [gps_device_id]: truck_id }
  const gpsDeviceToTruckMap = useMemo(() => {
    const map: Record<number, number> = {};
    trucks.forEach((truck) => {
      if (truck.gps_device_id !== null && truck.gps_device_id !== undefined) {
        map[truck.gps_device_id] = truck.id;
      }
    });
    return map;
  }, [trucks]);

  const assignedTruckId = device ? gpsDeviceToTruckMap[device.id] : undefined;

  useEffect(() => {
    if (isNaN(id)) {
      router.replace("/gps-devices");
    }
  }, [id, router]);

  if (isNaN(id)) {
    return <DetailSkeleton />;
  }

  const handleDeactivate = () => {
    deactivateMutation.mutate(id, {
      onSuccess: () => {
        setShowDeactivateDialog(false);
      },
    });
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch {
      return dateString;
    }
  };

  const formatDateTime = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy HH:mm");
    } catch {
      return dateString;
    }
  };

  if (isLoading) {
    return <DetailSkeleton />;
  }

  if (error && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] gap-4 p-6">
        <div className="p-4 rounded-full bg-red-500/10">
          <AlertCircle className="h-8 w-8 text-red-500" />
        </div>
        <p className="text-sm text-muted-foreground text-center">
          Failed to load device
        </p>
        <Link href="/gps-devices">
          <Button variant="outline" size="sm">
            Go to Devices
          </Button>
        </Link>
      </div>
    );
  }

  if (!device) return null;

  return (
    <div className="min-h-screen bg-background animate-in fade-in duration-300">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/50">
        <div className="p-4 space-y-2">
          <CompactBreadcrumb
            parentLabel="GPS Devices"
            parentHref="/gps-devices"
            currentLabel={device.external_device_id}
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold">{device.external_device_id}</h1>
              <StatusBadge active={device.status} />
            </div>
          </div>
          <p className="text-xs text-muted-foreground font-mono">
            IMEI: {device.imei_number}
          </p>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Device Icon Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                GPS Device
              </p>
              <p className="text-xl font-bold text-foreground">
                {device.device_name || device.external_device_id}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {device.device_model || "Unknown Model"}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-primary/10">
              <Satellite className="h-6 w-6 text-primary" />
            </div>
          </div>
        </div>

        {/* Device Info */}
        <InfoCard
          icon={Hash}
          title="Device Information"
          accent="bg-blue-500/10 text-blue-500"
        >
          <div className="space-y-0">
            <DetailRow
              label="External ID"
              value={device.external_device_id}
              mono
            />
            <DetailRow label="IMEI Number" value={device.imei_number} mono />
            <DetailRow label="Device Name" value={device.device_name || "—"} />
            <DetailRow
              label="Device Model"
              value={device.device_model || "—"}
            />
          </div>
        </InfoCard>

        {/* Truck Assignment */}
        <InfoCard
          icon={Truck}
          title="Truck Assignment"
          accent="bg-emerald-500/10 text-emerald-600"
        >
          {assignedTruckId ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">
                  Truck #{assignedTruckId}
                </p>
                <p className="text-xs text-muted-foreground">Assigned</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  router.push(`/fleet/placeholder?id=${assignedTruckId}`)
                }
                className="rounded-xl"
              >
                View Truck
              </Button>
            </div>
          ) : (
            <div className="text-center py-2">
              <p className="text-sm text-muted-foreground">
                Not assigned to any truck
              </p>
            </div>
          )}
        </InfoCard>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-card border border-border/50 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-amber-500/10">
                <Calendar className="h-3.5 w-3.5 text-amber-600" />
              </div>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                Expires
              </span>
            </div>
            <p className="text-sm font-semibold">
              {formatDate(device.expire_date)}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-card border border-border/50 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-purple-500/10">
                <Clock className="h-3.5 w-3.5 text-purple-500" />
              </div>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                Last Synced
              </span>
            </div>
            <p className="text-sm font-semibold">
              {formatDateTime(device.last_synced_at)}
            </p>
          </div>
        </div>

        {/* Timestamps */}
        <InfoCard
          icon={Clock}
          title="Timestamps"
          accent="bg-gray-500/10 text-gray-600"
        >
          <DetailRow
            label="Created"
            value={formatDateTime(device.created_at)}
          />
          <DetailRow
            label="Updated"
            value={formatDateTime(device.updated_at)}
          />
        </InfoCard>
      </div>

      {/* Actions */}
      <div className="p-4 flex gap-3">
        <Button
          variant="outline"
          onClick={() => router.push(`/gps-devices/placeholder/edit?id=${id}`)}
          className="flex-1 rounded-xl h-11"
        >
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </Button>
        {device.status && (
          <Button
            variant="destructive"
            onClick={() => setShowDeactivateDialog(true)}
            className="rounded-xl h-11"
          >
            <Power className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Deactivate Dialog */}
      <Dialog
        open={showDeactivateDialog}
        onOpenChange={setShowDeactivateDialog}
      >
        <DialogContent className="max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle>Deactivate Device</DialogTitle>
            <DialogDescription>
              Are you sure you want to deactivate this GPS device?
            </DialogDescription>
          </DialogHeader>
          <div className="py-3 space-y-2 text-sm">
            <p>
              <span className="text-muted-foreground">Device:</span>{" "}
              <span className="font-medium">{device.external_device_id}</span>
            </p>
            <p>
              <span className="text-muted-foreground">IMEI:</span>{" "}
              <span className="font-mono">{device.imei_number}</span>
            </p>
            {assignedTruckId && (
              <p>
                <span className="text-muted-foreground">Truck:</span>{" "}
                <span className="font-medium">#{assignedTruckId}</span>
              </p>
            )}
          </div>
          <div className="py-2 px-3 rounded-lg bg-muted/50 text-xs text-muted-foreground">
            This will set the device status to inactive and unlink it from any
            truck.
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowDeactivateDialog(false)}
              disabled={deactivateMutation.isPending}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeactivate}
              disabled={deactivateMutation.isPending}
              className="rounded-xl"
            >
              {deactivateMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deactivating...
                </>
              ) : (
                "Deactivate"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function GPSDeviceDetailClient() {
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <GPSDeviceDetailContent />
    </Suspense>
  );
}
