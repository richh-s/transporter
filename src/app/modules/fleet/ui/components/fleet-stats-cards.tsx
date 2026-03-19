"use client";

import { useTranslation } from "react-i18next";
import { Truck, ShieldCheck, Package } from "lucide-react";
import type { Truck as TruckType } from "@/lib/api/trucks";

interface FleetStatsCardsProps {
  total: number;
  trucks: TruckType[];
}

export function FleetStatsCards({ total, trucks }: FleetStatsCardsProps) {
  const { t } = useTranslation(["fleet", "common"]);
  const activeTrucks = trucks.filter((t) => t.status === "active").length;
  const avgCapacity =
    trucks.length > 0
      ? (
          trucks.reduce(
            (acc: number, t: TruckType) => acc + t.capacity_quintal,
            0,
          ) / trucks.length
        ).toFixed(1)
      : 0;

  return (
    <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 sm:overflow-visible">
      <div className="flex sm:grid sm:grid-cols-3 gap-2 sm:gap-4 min-w-0 sm:min-w-full pr-4 sm:pr-0">
        <div className="shrink-0 w-[72%] min-w-[160px] sm:w-auto sm:min-w-0">
          <div className="p-2 sm:p-3 bg-brand-primary/5 border border-brand-primary/10 rounded-xl shadow-none h-full">
            <div className="flex items-center justify-between">
              <div className="p-1 bg-brand-primary/10 rounded-lg text-brand-primary">
                <Truck className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="mt-1.5 sm:mt-2">
              <h3 className="text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-wider truncate">
                {t("fleet:labels.total_fleet")}
              </h3>
              <p className="text-lg sm:text-2xl font-bold text-brand-primary">
                {total}
              </p>
            </div>
          </div>
        </div>

        <div className="shrink-0 w-[72%] min-w-[160px] sm:w-auto sm:min-w-0">
          <div className="p-2 sm:p-3 bg-primary/5 border border-primary/10 rounded-xl shadow-none h-full">
            <div className="flex items-center justify-between">
              <div className="p-1 bg-primary/10 rounded-lg text-primary">
                <ShieldCheck className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="mt-1.5 sm:mt-2">
              <h3 className="text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-wider truncate">
                {t("fleet:labels.active_trucks")}
              </h3>
              <p className="text-lg sm:text-2xl font-bold text-primary">
                {activeTrucks}
              </p>
            </div>
          </div>
        </div>

        <div className="shrink-0 w-[72%] min-w-[160px] sm:w-auto sm:min-w-0">
          <div className="p-2 sm:p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl shadow-none h-full">
            <div className="flex items-center justify-between">
              <div className="p-1 bg-amber-500/10 rounded-lg text-amber-500">
                <Package className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="mt-1.5 sm:mt-2">
              <h3 className="text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-wider truncate">
                {t("fleet:labels.avg_capacity")}
              </h3>
              <p className="text-lg sm:text-2xl font-bold text-amber-500">
                {avgCapacity}{" "}
                <span className="text-[10px] font-normal opacity-70">
                  {t("fleet:labels.unit_kg")}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
