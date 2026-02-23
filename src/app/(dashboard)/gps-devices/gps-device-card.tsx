"use client";

import { format } from "date-fns";
import { ChevronRight, Satellite, Clock, Truck } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GPSDevice } from "@/types/gps-device";

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  try {
    return format(new Date(dateStr), "MMM d, yyyy");
  } catch {
    return "—";
  }
}

export function GPSDeviceCard({
  device,
  assigned,
  onClick,
}: {
  device: GPSDevice;
  assigned?: boolean;
  onClick?: () => void;
}) {
  const isActive = !!device.status;

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
          isActive ? "bg-primary/40" : "bg-muted-foreground/30",
        )}
        aria-hidden
      />

      <div className="flex-1 min-w-0 pl-4 pr-3 py-4 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary shrink-0">
              <Satellite className="h-3.5 w-3.5" />
            </div>
            <span className="font-bold text-sm truncate">
              {device.external_device_id}
            </span>
          </div>
          <span
            className={cn(
              "inline-flex px-2.5 py-1 rounded-lg text-[11px] font-semibold uppercase tracking-wide",
              isActive
                ? "bg-primary/10 text-primary"
                : "bg-muted text-muted-foreground",
            )}
          >
            {isActive ? "Active" : "Inactive"}
          </span>
        </div>

        <div className="text-muted-foreground text-xs font-mono">
          IMEI: {device.imei_number}
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
          <span>{device.device_name || "—"}</span>
          {device.device_model && (
            <>
              <span className="text-border">·</span>
              <span>{device.device_model}</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-3 text-[11px]">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <Clock className="h-3 w-3" />
            {formatDate(device.expire_date)}
          </span>
          <span className="text-border">·</span>
          <span
            className={cn(
              "flex items-center gap-1",
              assigned ? "text-primary font-medium" : "text-muted-foreground",
            )}
          >
            <Truck className="h-3 w-3" />
            {assigned ? "Assigned" : "Unassigned"}
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
