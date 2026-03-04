"use client";

import { ChevronRight, Truck as TruckIcon, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Truck } from "@/lib/api/trucks";

const STATUS_CONFIG: Record<
  string,
  { label: string; className: string; accent: string }
> = {
  active: {
    label: "Active",
    className: "bg-primary/10 text-primary",
    accent: "bg-primary/40",
  },
  inactive: {
    label: "Inactive",
    className: "bg-muted text-muted-foreground",
    accent: "bg-muted-foreground/30",
  },
  maintenance: {
    label: "Maintenance",
    className: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
    accent: "bg-amber-500/40",
  },
  out_of_service: {
    label: "Out of Service",
    className: "bg-red-500/10 text-red-700 dark:text-red-400",
    accent: "bg-red-500/40",
  },
};

export function TruckCard({
  truck,
  onClick,
}: {
  truck: Truck;
  onClick?: () => void;
}) {
  const status = STATUS_CONFIG[truck.status] ?? {
    label: String(truck.status || "—").replace(/_/g, " "),
    className: "bg-muted text-muted-foreground",
    accent: "bg-muted-foreground/20",
  };

  const typeLabel =
    truck.truck_type === "flatbed"
      ? "Flatbed"
      : truck.truck_type === "trailer"
        ? "Trailer"
        : truck.truck_type;

  return (
    <article
      role={onClick ? "button" : undefined}
      onClick={onClick}
      className={cn(
        "relative flex rounded-2xl border border-border bg-card text-left overflow-hidden",
        "shadow-sm hover:shadow-md transition-all duration-200",
        "active:scale-[0.99]",
        onClick && "cursor-pointer touch-manipulation",
      )}
    >
      <div
        className={cn(
          "absolute left-0 top-0 bottom-0 w-1 shrink-0",
          status.accent,
        )}
        aria-hidden
      />

      <div className="flex-1 min-w-0 pl-4 pr-3 py-4 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className="font-bold text-primary text-sm">
            {truck.plate_number}
          </span>
          <span
            className={cn(
              "inline-flex px-2.5 py-1 rounded-lg text-[11px] font-semibold uppercase tracking-wide",
              status.className,
            )}
          >
            {status.label}
          </span>
        </div>

        {truck.vin && (
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <TruckIcon className="h-3.5 w-3.5 shrink-0" />
            <span className="text-xs font-medium truncate">{truck.vin}</span>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-muted-foreground text-[11px]">
          <span className="capitalize">{typeLabel}</span>
          <span className="text-border">·</span>
          <span>
            {truck.make || "—"}
            {truck.model ? ` / ${truck.model}` : ""}
          </span>
          <span className="text-border">·</span>
          <span className="flex items-center gap-1">
            <Package className="h-3 w-3" />
            {truck.capacity_quintal} Kg
          </span>
        </div>
      </div>

      {onClick && (
        <div className="flex items-center pr-3 shrink-0 self-center">
          <ChevronRight className="h-5 w-5 text-muted-foreground/60" />
        </div>
      )}
    </article>
  );
}
