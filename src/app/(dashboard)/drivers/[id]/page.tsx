"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useParams } from "next/navigation";

import { useDriver } from "@/app/modules/drivers/server/hooks/use-driver";
import { DriverDocuments } from "@/app/modules/drivers/ui/components/driver-documents";

export default function DriverDetailsPage() {
  const { id } = useParams();
  const driverId = Number(id);

  const { data: driver, isLoading, isError } = useDriver(driverId);

  if (isLoading) {
    return (
      <div className="p-12 text-muted-foreground">
        Loading driver details...
      </div>
    );
  }

  if (isError || !driver) {
    return (
      <div className="p-12 text-destructive">
        Driver not found
      </div>
    );
  }

  return (
    // 🔑 THIS FIXES SCROLLING
    <div className="h-full min-h-0 overflow-y-auto">
      <div className="space-y-6 p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">
            {driver.first_name} {driver.last_name}
          </h1>
          <p className="text-muted-foreground">
            Driver details and profile information
          </p>
        </div>

        {/* Driver Info */}
        <Card className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Info label="License Number" value={driver.driver_license_number} />
          <Info label="Phone" value={driver.phone_number} />
          <Info label="Email" value={driver.email} />
          <div>
            <p className="text-xs text-muted-foreground">Status</p>
            <Badge
              className={
                driver.status === "active"
                  ? "mt-1 bg-green-500/10 text-green-500"
                  : "mt-1 bg-muted text-muted-foreground"
              }
            >
              {driver.status}
            </Badge>
          </div>
        </Card>

        {/* Documents */}
        <DriverDocuments driverId={driver.id} />
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}
