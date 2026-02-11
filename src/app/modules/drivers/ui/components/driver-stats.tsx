"use client";

import { Card } from "@/components/ui/card";
import { Users, UserCheck, Clock } from "lucide-react";

type Driver = {
  status: "active" | "suspended";
  experience_years: number;
};

export function DriverStats({ drivers }: { drivers: Driver[] }) {
  const total = drivers.length;
  const active = drivers.filter((d) => d.status === "active").length;

  const avgExp =
    drivers.reduce((sum, d) => sum + (d.experience_years || 0), 0) /
    (total || 1);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* TOTAL DRIVERS */}
      <Card className="p-5 flex items-center gap-4 bg-card border border-border">
        <Users className="h-5 w-5 text-muted-foreground" />
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Total Drivers
          </p>
          <p className="text-2xl font-bold">{total}</p>
        </div>
      </Card>

      {/* ACTIVE DRIVERS */}
      <Card
        className="
          p-5 flex items-center gap-4
          bg-blue-50 dark:bg-blue-950/40
          border border-blue-200 dark:border-blue-900
        "
      >
        <UserCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Active Drivers
          </p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {active}
          </p>
        </div>
      </Card>

      {/* AVG EXPERIENCE */}
      <Card
        className="
          p-5 flex items-center gap-4
          bg-orange-50 dark:bg-orange-950/40
          border border-orange-200 dark:border-orange-900
        "
      >
        <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Avg Experience
          </p>
          <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {avgExp.toFixed(1)} yrs
          </p>
        </div>
      </Card>
    </div>
  );
}
