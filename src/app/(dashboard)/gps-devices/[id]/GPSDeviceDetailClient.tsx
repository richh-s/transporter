"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Edit, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
import { useMemo } from "react";

export default function GPSDeviceDetailClient() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);

  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);

  const { data: device, isLoading, error } = useGPSDevice(id);
  const deactivateMutation = useDeactivateGPSDevice();

  // Fetch all trucks to create mapping (same as table)
  const { data: trucks = [] } = useTrucks();

  // Create mapping object: { [gps_device_id]: truck_id }
  // Only include trucks that have a gps_device_id (assigned trucks)
  const gpsDeviceToTruckMap = useMemo(() => {
    const map: Record<number, number> = {};
    trucks.forEach((truck) => {
      if (truck.gps_device_id !== null && truck.gps_device_id !== undefined) {
        map[truck.gps_device_id] = truck.id;
      }
    });
    if (process.env.NODE_ENV === "development") {
      console.log("[GPS Device Detail] GPS Device to Truck Mapping:", map);
      console.log("[GPS Device Detail] Device ID:", id);
      console.log(
        "[GPS Device Detail] Device truck_id from API:",
        device?.truck_id,
      );
      console.log("[GPS Device Detail] Truck ID from mapping:", map[id]);
    }
    return map;
  }, [trucks, id, device?.truck_id]);

  // Get the assigned truck ID from the mapping (more reliable than device.truck_id)
  const assignedTruckId = device ? gpsDeviceToTruckMap[device.id] : undefined;

  const handleDeactivate = () => {
    deactivateMutation.mutate(id, {
      onSuccess: () => {
        setShowDeactivateDialog(false);
      },
    });
  };

  // Redirect if device not found
  if (error && !isLoading) {
    router.push("/gps-devices");
    return null;
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMMM dd, yyyy");
    } catch {
      return dateString;
    }
  };

  const formatDateTime = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMMM dd, yyyy 'at' HH:mm");
    } catch {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <Skeleton className="h-10 w-64" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!device) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="text-center py-12">
          <p className="text-muted-foreground">GPS device not found</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => router.push("/gps-devices")}
          >
            Back to List
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/gps-devices")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-brand-primary">
              GPS Device Details
            </h1>
            <p className="text-sm text-muted-foreground">
              {device.external_device_id}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/gps-devices/${id}/edit`)}
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          {device.status && (
            <Button
              variant="destructive"
              onClick={() => setShowDeactivateDialog(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Deactivate
            </Button>
          )}
        </div>
      </div>

      {/* Device Information Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Device Information</CardTitle>
            <Badge
              variant={device.status ? "default" : "secondary"}
              className={
                device.status
                  ? "bg-green-500 hover:bg-green-600"
                  : "bg-gray-500 hover:bg-gray-600"
              }
            >
              {device.status ? "Active" : "Inactive"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                External Device ID
              </label>
              <p className="mt-1 text-sm font-semibold">
                {device.external_device_id}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">
                IMEI Number
              </label>
              <p className="mt-1 text-sm font-semibold">{device.imei_number}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Device Name
              </label>
              <p className="mt-1 text-sm font-semibold">
                {device.device_name || (
                  <span className="text-muted-foreground">N/A</span>
                )}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Device Model
              </label>
              <p className="mt-1 text-sm font-semibold">
                {device.device_model || (
                  <span className="text-muted-foreground">N/A</span>
                )}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Expire Date
              </label>
              <p className="mt-1 text-sm font-semibold">
                {formatDate(device.expire_date)}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Last Synced
              </label>
              <p className="mt-1 text-sm font-semibold">
                {formatDateTime(device.last_synced_at)}
              </p>
            </div>
          </div>

          <Separator />

          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Truck Assignment
            </label>
            <div className="mt-2 flex items-center gap-2">
              {assignedTruckId ? (
                <>
                  <p className="text-sm font-semibold">
                    Truck #{assignedTruckId}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      router.push(`/fleet?truck=${assignedTruckId}`)
                    }
                  >
                    View Truck
                  </Button>
                </>
              ) : (
                <span className="text-muted-foreground">Unassigned</span>
              )}
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Created
              </label>
              <p className="mt-1 text-sm font-semibold">
                {formatDateTime(device.created_at)}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Updated
              </label>
              <p className="mt-1 text-sm font-semibold">
                {formatDateTime(device.updated_at)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Deactivate Confirmation Dialog */}
      <Dialog
        open={showDeactivateDialog}
        onOpenChange={setShowDeactivateDialog}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Deactivate GPS Device</DialogTitle>
            <DialogDescription>
              Are you sure you want to deactivate this GPS device?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-2">
            <p className="text-sm">
              <strong>Device:</strong> {device.external_device_id}
            </p>
            <p className="text-sm">
              <strong>IMEI:</strong> {device.imei_number}
            </p>
            {assignedTruckId && (
              <p className="text-sm">
                <strong>Current Truck:</strong> Truck #{assignedTruckId}
              </p>
            )}
          </div>
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-2">This will:</p>
            <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
              <li>Set device status to inactive</li>
              <li>Unlink the device from its truck</li>
              <li>The device will not be deleted</li>
            </ul>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeactivateDialog(false)}
              disabled={deactivateMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeactivate}
              disabled={deactivateMutation.isPending}
            >
              {deactivateMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deactivating...
                </>
              ) : (
                "Deactivate Device"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
