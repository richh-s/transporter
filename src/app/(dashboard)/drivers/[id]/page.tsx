"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useParams } from "next/navigation";

export default function DriverDetailsPage() {
  const { id } = useParams();

  // UI-only mock
  const driver = {
    first_name: "Abebe",
    last_name: "Kebede",
    phone_number: "0912345678",
    email: "user@example.com",
    driver_license_number: "DL-12345",
    status: "active",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          {driver.first_name} {driver.last_name}
        </h1>
        <p className="text-muted-foreground">
          Driver details and profile information
        </p>
      </div>

      <Card className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <Info label="License Number" value={driver.driver_license_number} />
        <Info label="Phone" value={driver.phone_number} />
        <Info label="Email" value={driver.email} />
        <div>
          <p className="text-xs text-muted-foreground">Status</p>
          <Badge className="mt-1 bg-green-100 text-green-700">
            {driver.status}
          </Badge>
        </div>
      </Card>
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
