"use client";

import { format } from "date-fns";
import { ChevronRight, MapPin, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Ship } from "@/types/ship";

const STATUS_CONFIG: Record<
  string,
  { label: string; className: string; accent: string }
> = {
  created: {
    label: "Created",
    className: "bg-muted text-muted-foreground",
    accent: "bg-muted-foreground/30",
  },
  price_requested: {
    label: "Price Requested",
    className: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
    accent: "bg-amber-500/40",
  },
  priced: {
    label: "Priced",
    className: "bg-violet-500/10 text-violet-700 dark:text-violet-400",
    accent: "bg-violet-500/40",
  },
  accepted_by_shipper: {
    label: "Accepted",
    className: "bg-primary/10 text-primary",
    accent: "bg-primary/40",
  },
  rejected_by_shipper: {
    label: "Rejected",
    className: "bg-red-500/10 text-red-700 dark:text-red-400",
    accent: "bg-red-500/40",
  },
  allocated: {
    label: "Allocated",
    className: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400",
    accent: "bg-indigo-500/40",
  },
  ready_for_pickup: {
    label: "Ready for Pickup",
    className: "bg-lime-500/10 text-lime-700 dark:text-lime-400",
    accent: "bg-lime-500/40",
  },
  in_transit: {
    label: "In Transit",
    className: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
    accent: "bg-amber-500/40",
  },
  delivered: {
    label: "Delivered",
    className: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-400",
    accent: "bg-cyan-500/40",
  },
  completed: {
    label: "Completed",
    className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    accent: "bg-emerald-500/40",
  },
};

function formatLocation(s: string) {
  return (s || "-").replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  try {
    return format(new Date(dateStr), "MMM d, yyyy");
  } catch {
    return "—";
  }
}

export function ShipCard({
  ship,
  onClick,
}: {
  ship: Ship;
  onClick?: () => void;
}) {
  const statusKey = ship.status?.toLowerCase();
  const status = STATUS_CONFIG[statusKey] ?? {
    label: (ship.status || "—").replace(/_/g, " "),
    className: "bg-muted text-muted-foreground",
    accent: "bg-muted-foreground/20",
  };

  const origin = formatLocation(ship.origin);
  const destination = formatLocation(ship.destination);
  const facility = ship.pickup_facility?.name || ship.delivery_facility?.name;

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
      {/* Status accent bar */}
      <div
        className={cn(
          "absolute left-0 top-0 bottom-0 w-1 shrink-0",
          status.accent,
        )}
        aria-hidden
      />

      <div className="flex-1 min-w-0 pl-4 pr-3 py-4 flex flex-col gap-3">
        {/* Top row: ID + Status */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className="font-mono text-xs font-bold text-primary">
            #{ship.id}
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

        {/* Route - hero */}
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 text-foreground">
            <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span className="text-sm font-semibold leading-tight">
              {origin}
              <span className="text-muted-foreground font-normal mx-1">→</span>
              {destination}
            </span>
          </div>
          {facility && (
            <p className="text-[11px] text-muted-foreground truncate pl-5">
              {facility}
            </p>
          )}
        </div>

        {/* Dates row */}
        <div className="flex items-center gap-4 text-muted-foreground pl-0.5">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 shrink-0" />
            <span className="text-[11px] font-medium">
              {formatDate(ship.pickup_date)}
            </span>
          </div>
          <span className="text-border">·</span>
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 shrink-0" />
            <span className="text-[11px] font-medium">
              {formatDate(ship.delivery_date)}
            </span>
          </div>
        </div>
      </div>

      {/* CTA indicator */}
      {onClick && (
        <div className="flex items-center pr-3 shrink-0 self-center">
          <ChevronRight className="h-5 w-5 text-muted-foreground/60" />
        </div>
      )}
    </article>
  );
}
