"use client";

import { ChevronRight, MapPin, Truck, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PriceQuote } from "@/types/price-quote";
import { PriceQuoteStatusEnum } from "@/types/price-quote";
import {
  formatLocation,
  formatTruckType,
  formatContainerSize,
  formatAxleType,
} from "@/lib/price-quote-utils";

const STATUS_CONFIG: Record<
  string,
  { label: string; className: string; accent: string }
> = {
  [PriceQuoteStatusEnum.ACTIVE]: {
    label: "Active",
    className: "bg-primary/10 text-primary",
    accent: "bg-primary/40",
  },
  [PriceQuoteStatusEnum.DRAFT]: {
    label: "Draft",
    className: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
    accent: "bg-amber-500/40",
  },
  [PriceQuoteStatusEnum.INACTIVE]: {
    label: "Inactive",
    className: "bg-muted text-muted-foreground",
    accent: "bg-muted-foreground/30",
  },
};

export function PriceQuoteCard({
  quote,
  onClick,
}: {
  quote: PriceQuote;
  onClick?: () => void;
}) {
  const status = STATUS_CONFIG[quote.status] ?? {
    label: String(quote.status),
    className: "bg-muted text-muted-foreground",
    accent: "bg-muted-foreground/20",
  };

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
          <span className="font-mono text-xs font-bold text-primary">
            #{quote.id}
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

        <div className="flex items-center gap-1.5 text-foreground text-sm">
          <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <span className="font-medium truncate">
            {formatLocation(quote.origin)}
            <span className="text-muted-foreground mx-1">→</span>
            {formatLocation(quote.destination)}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <Truck className="h-3 w-3" />
            {formatTruckType(quote.truck_type)}
            {quote.axle_type && ` · ${formatAxleType(quote.axle_type)}`}
          </span>
          <span className="text-border">·</span>
          <span>{formatContainerSize(quote.container_size)}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[11px] text-muted-foreground">
            {quote.gross_weight_min.toLocaleString()} –{" "}
            {quote.gross_weight_max.toLocaleString()} kg
          </span>
          <span className="flex items-center gap-1 text-sm font-bold text-primary">
            <DollarSign className="h-3.5 w-3.5" />
            {quote.amount.toLocaleString()}
            <span className="text-[10px] font-normal text-muted-foreground uppercase">
              {quote.currency}
            </span>
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
