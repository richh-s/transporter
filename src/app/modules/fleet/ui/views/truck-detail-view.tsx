"use client";

import { Suspense } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTruck } from "@/app/modules/fleet/server/hooks";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { EditTruckModal, DeleteTruckModal } from "../components";
import { useQueryClient } from "@tanstack/react-query";
import type { Truck } from "@/lib/api/trucks";

interface TruckDetailContentProps {
  id: string;
}

function TruckDetailContent({ id }: TruckDetailContentProps) {
  const { data: truck } = useTruck(id);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["truck", id] });
    queryClient.invalidateQueries({ queryKey: ["trucks"] });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-700 hover:bg-green-100";
      case "maintenance":
        return "bg-amber-100 text-amber-700 hover:bg-amber-100";
      case "inactive":
        return "bg-gray-100 text-gray-700 hover:bg-gray-100";
      case "out_of_service":
        return "bg-red-100 text-red-700 hover:bg-red-100";
      default:
        return "bg-gray-100 text-gray-700 hover:bg-gray-100";
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="flex flex-col space-y-6 animate-in fade-in duration-500 w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/fleet")}
            className="h-9"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Fleet
          </Button>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-brand-primary">
              <span className="text-brand-accent">WeTruck</span> Truck Details
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              View and manage truck information
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditModalOpen(true)}
            className="h-9"
          >
            <Edit2 className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsDeleteModalOpen(true)}
            className="h-9 text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-xs sm:text-sm font-medium text-muted-foreground">
                Plate Number
              </label>
              <p className="text-sm sm:text-base font-semibold text-brand-primary mt-1">
                {truck.plate_number}
              </p>
            </div>
            <div>
              <label className="text-xs sm:text-sm font-medium text-muted-foreground">
                VIN
              </label>
              <p className="text-sm sm:text-base font-mono mt-1">{truck.vin}</p>
            </div>
            <div>
              <label className="text-xs sm:text-sm font-medium text-muted-foreground">
                Status
              </label>
              <div className="mt-1">
                <Badge
                  variant="secondary"
                  className={cn(
                    "font-semibold text-xs sm:text-sm",
                    getStatusColor(truck.status)
                  )}
                >
                  {truck.status.replace(/_/g, " ").charAt(0).toUpperCase() +
                    truck.status.replace(/_/g, " ").slice(1)}
                </Badge>
              </div>
            </div>
            <div>
              <label className="text-xs sm:text-sm font-medium text-muted-foreground">
                Truck Type
              </label>
              <p className="text-sm sm:text-base capitalize mt-1">
                {truck.truck_type}
              </p>
            </div>
            <div>
              <label className="text-xs sm:text-sm font-medium text-muted-foreground">
                Registration Date
              </label>
              <p className="text-sm sm:text-base mt-1">
                {formatDate(truck.registration_date)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Vehicle Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Vehicle Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-xs sm:text-sm font-medium text-muted-foreground">
                Make
              </label>
              <p className="text-sm sm:text-base mt-1">{truck.make || "—"}</p>
            </div>
            <div>
              <label className="text-xs sm:text-sm font-medium text-muted-foreground">
                Model
              </label>
              <p className="text-sm sm:text-base mt-1">{truck.model || "—"}</p>
            </div>
            <div>
              <label className="text-xs sm:text-sm font-medium text-muted-foreground">
                Year
              </label>
              <p className="text-sm sm:text-base mt-1">{truck.year || "—"}</p>
            </div>
            <div>
              <label className="text-xs sm:text-sm font-medium text-muted-foreground">
                Color
              </label>
              <p className="text-sm sm:text-base capitalize mt-1">
                {truck.color || "—"}
              </p>
            </div>
            <div>
              <label className="text-xs sm:text-sm font-medium text-muted-foreground">
                Capacity
              </label>
              <p className="text-sm sm:text-base font-semibold mt-1">
                {truck.capacity_quintal} Q
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Additional Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-xs sm:text-sm font-medium text-muted-foreground">
                  Government ID
                </label>
                <p className="text-sm sm:text-base mt-1">
                  {truck.gov_id || "—"}
                </p>
              </div>
              <div>
                <label className="text-xs sm:text-sm font-medium text-muted-foreground">
                  GPS Device ID
                </label>
                <p className="text-sm sm:text-base mt-1">
                  {truck.gps_device_id || "—"}
                </p>
              </div>
              <div>
                <label className="text-xs sm:text-sm font-medium text-muted-foreground">
                  Libre Key
                </label>
                <p className="text-sm sm:text-base mt-1">
                  {truck.libre_key || "—"}
                </p>
              </div>
              {truck.created_at && (
                <div>
                  <label className="text-xs sm:text-sm font-medium text-muted-foreground">
                    Created At
                  </label>
                  <p className="text-sm sm:text-base mt-1">
                    {formatDate(truck.created_at)}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Modal */}
      <EditTruckModal
        truck={truck}
        isOpen={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        onSuccess={handleSuccess}
      />

      {/* Delete Modal */}
      <DeleteTruckModal
        truck={truck}
        isOpen={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        onSuccess={() => {
          handleSuccess();
          router.push("/fleet");
        }}
      />
    </div>
  );
}

function TruckDetailLoading() {
  return (
    <div className="flex items-center justify-center h-64 gap-2 text-muted-foreground">
      <Loader2 className="h-5 w-5 animate-spin" />
      <span className="text-sm">Loading truck details...</span>
    </div>
  );
}

interface TruckDetailViewProps {
  id: string;
}

export function TruckDetailView({ id }: TruckDetailViewProps) {
  return (
    <Suspense fallback={<TruckDetailLoading />}>
      <TruckDetailContent id={id} />
    </Suspense>
  );
}

