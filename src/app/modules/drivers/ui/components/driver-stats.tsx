"use client";

import { Card } from "@/components/ui/card";
import { UserCheck, Users, Clock } from "lucide-react";

export function DriverStats({ drivers }: { drivers: any[] }) {
  const total = drivers.length;
  const active = drivers.filter(d => d.status === "active").length;
  const avgExp =
    drivers.reduce((sum, d) => sum + d.experience_years, 0) / (total || 1);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="p-5 flex items-center gap-4">
        <Users className="text-muted-foreground" />
        <div>
          <p className="text-xs text-muted-foreground">TOTAL DRIVERS</p>
          <p className="text-2xl font-bold">{total}</p>
        </div>
      </Card>

      <Card className="p-5 flex items-center gap-4 bg-blue-50">
        <UserCheck className="text-blue-600" />
        <div>
          <p className="text-xs text-muted-foreground">ACTIVE DRIVERS</p>
          <p className="text-2xl font-bold text-blue-600">{active}</p>
        </div>
      </Card>

      <Card className="p-5 flex items-center gap-4 bg-orange-50">
        <Clock className="text-orange-600" />
        <div>
          <p className="text-xs text-muted-foreground">AVG EXPERIENCE</p>
          <p className="text-2xl font-bold text-orange-600">
            {avgExp.toFixed(1)} yrs
          </p>
        </div>
      </Card>
    </div>
  );
}
