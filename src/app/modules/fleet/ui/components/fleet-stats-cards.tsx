"use client";

import { Truck, ShieldCheck, Package } from "lucide-react";
import type { Truck as TruckType } from "@/lib/api/trucks";

interface FleetStatsCardsProps {
  total: number;
  trucks: TruckType[];
}

export function FleetStatsCards({ total, trucks }: FleetStatsCardsProps) {
  const activeTrucks = trucks.filter((t) => t.status === "active").length;
  const avgCapacity =
    trucks.length > 0
      ? (
          trucks.reduce(
            (acc: number, t: TruckType) => acc + t.capacity_quintal,
            0
          ) / trucks.length
        ).toFixed(1)
      : 0;

  return (
    <div className="grid gap-2 sm:gap-4 grid-cols-3">
      <div className="p-2 sm:p-3 bg-brand-primary/5 border border-brand-primary/10 rounded-xl shadow-none">
        <div className="flex items-center justify-between">
          <div className="p-1 bg-brand-primary/10 rounded-lg text-brand-primary">
            <Truck className="h-3.5 w-3.5" />
          </div>
          <span className="hidden sm:inline-block text-[10px] font-bold text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded-full">
            Live
          </span>
        </div>
        <div className="mt-1.5 sm:mt-2">
          <h3 className="text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-wider truncate">
            Total Fleet
          </h3>
          <p className="text-lg sm:text-2xl font-bold text-brand-primary">
            {total}
          </p>
        </div>
      </div>

      <div className="p-2 sm:p-3 bg-blue-500/5 border border-blue-500/10 rounded-xl shadow-none">
        <div className="flex items-center justify-between">
          <div className="p-1 bg-blue-500/10 rounded-lg text-blue-500">
            <ShieldCheck className="h-3.5 w-3.5" />
          </div>
          <span className="hidden sm:inline-block text-[10px] font-bold text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-full">
            Active
          </span>
        </div>
        <div className="mt-1.5 sm:mt-2">
          <h3 className="text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-wider truncate">
            Active Trucks
          </h3>
          <p className="text-lg sm:text-2xl font-bold text-blue-500">
            {activeTrucks}
          </p>
        </div>
      </div>

      <div className="p-2 sm:p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl shadow-none">
        <div className="flex items-center justify-between">
          <div className="p-1 bg-amber-500/10 rounded-lg text-amber-500">
            <Package className="h-3.5 w-3.5" />
          </div>
        </div>
        <div className="mt-1.5 sm:mt-2">
          <h3 className="text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-wider truncate">
            Avg Capacity
          </h3>
          <p className="text-lg sm:text-2xl font-bold text-amber-500">
            {avgCapacity}{" "}
            <span className="text-[10px] font-normal opacity-70">Q</span>
          </p>
        </div>
      </div>
    </div>
  );
}

