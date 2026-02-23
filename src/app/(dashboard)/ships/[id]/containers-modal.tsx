"use client";

import { Container } from "@/types/ship";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  Scale,
  Move,
  Truck,
  Info,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ContainersModalProps {
  containers: Container[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ContainersModal({
  containers,
  open,
  onOpenChange,
}: ContainersModalProps) {
  const totalWeight = containers.reduce(
    (sum, c) => sum + (c.gross_weight || c.weight || 0),
    0,
  );
  const totalVolume = containers.reduce((sum, c) => sum + (c.volume || 0), 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-4xl max-h-[90vh] overflow-y-auto p-0 border border-border bg-background rounded-xl">
        <DialogHeader className="p-6 pb-4 border-b border-border">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <DialogTitle className="flex items-center gap-3 text-xl font-bold text-foreground">
              <div className="p-2 rounded-lg bg-muted/50 text-foreground">
                <Package className="h-5 w-5" />
              </div>
              Containers
              <span className="text-muted-foreground font-normal ml-1">
                ({containers.length})
              </span>
            </DialogTitle>
            {containers.length > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 border border-border">
                  <Scale className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs font-semibold text-foreground">
                    {totalWeight.toLocaleString()}{" "}
                    <span className="text-[10px] text-muted-foreground uppercase">
                      kg
                    </span>
                  </span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 border border-border">
                  <Move className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs font-semibold text-foreground">
                    {totalVolume.toLocaleString()}{" "}
                    <span className="text-[10px] text-muted-foreground uppercase">
                      m³
                    </span>
                  </span>
                </div>
              </div>
            )}
          </div>
        </DialogHeader>

        <div className="p-6 space-y-4 scrollbar-hide">
          {containers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <div className="p-4 rounded-lg bg-muted/30 mb-4">
                <Package className="h-8 w-8 opacity-40" />
              </div>
              <p className="font-medium text-base">No containers found</p>
              <p className="text-sm text-muted-foreground mt-1">
                This shipment item currently has no containers assigned.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {containers.map((container, index) => (
                <div
                  key={container.id}
                  className="rounded-lg border border-border bg-card p-4 transition-colors hover:bg-muted/30"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted/50 text-foreground font-semibold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="font-bold text-base text-foreground leading-tight">
                          {container.container_number ||
                            `Container #${container.id}`}
                        </h3>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mt-0.5">
                          {container.container_type || "Standard"}{" "}
                          {container.container_size
                            ? `• ${container.container_size}`
                            : ""}
                        </p>
                      </div>
                    </div>

                    <div
                      className={cn(
                        "flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors",
                        container.status === "DELIVERED"
                          ? "bg-green-500/10 text-green-700 border-green-500/20"
                          : container.status === "IN_TRANSIT"
                            ? "bg-amber-500/10 text-amber-700 border-amber-500/20"
                            : "bg-muted/50 text-muted-foreground border-border",
                      )}
                    >
                      <span
                        className={cn(
                          "h-2 w-2 rounded-full",
                          container.status === "DELIVERED"
                            ? "bg-green-600"
                            : container.status === "IN_TRANSIT"
                              ? "bg-amber-600"
                              : "bg-muted-foreground",
                        )}
                      />
                      <span className="text-xs font-semibold uppercase tracking-wide">
                        {container.status || "PENDING"}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Truck Type
                      </p>
                      <div className="flex items-center gap-1.5">
                        <Truck className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-semibold text-foreground">
                          {container.recommended_truck_type || "Standard"}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Weight
                      </p>
                      <div className="flex items-center gap-1.5">
                        <Scale className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-semibold text-foreground">
                          {(
                            container.gross_weight ?? container.weight
                          )?.toLocaleString() ?? "-"}
                          <span className="text-xs text-muted-foreground ml-1">
                            kg
                          </span>
                        </span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Volume
                      </p>
                      <div className="flex items-center gap-1.5">
                        <Move className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-semibold text-foreground">
                          {container.volume?.toLocaleString() ?? "-"}
                          <span className="text-xs text-muted-foreground ml-1">
                            m³
                          </span>
                        </span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Return Trip
                      </p>
                      <div className="flex items-center gap-1.5">
                        {container.is_returning ? (
                          <>
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-semibold text-green-700">
                              Required
                            </span>
                          </>
                        ) : (
                          <>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium text-muted-foreground">
                              One Way
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {(container.container_details?.commodity ||
                      container.container_details?.instruction) && (
                      <div className="col-span-full pt-3 border-t border-border">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                          {container.container_details?.commodity && (
                            <div className="space-y-2">
                              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                Commodities
                              </p>
                              <div className="flex flex-wrap gap-1.5">
                                {container.container_details.commodity.map(
                                  (c, i) => (
                                    <Badge
                                      key={i}
                                      variant="secondary"
                                      className="bg-muted/50 text-foreground border border-border text-xs font-medium px-2 py-0.5 rounded-md"
                                    >
                                      {c}
                                    </Badge>
                                  ),
                                )}
                              </div>
                            </div>
                          )}
                          {container.container_details?.instruction && (
                            <div className="space-y-2">
                              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1">
                                Instructions
                                <Info className="h-3.5 w-3.5" />
                              </p>
                              <div className="p-3 rounded-lg bg-muted/30 border border-border">
                                <p className="text-xs font-medium text-foreground leading-relaxed">
                                  {container.container_details.instruction}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
