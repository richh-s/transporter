"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ShipItem, Truck, Driver, Ship, Container } from "@/types/ship";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslation } from "react-i18next";
import {
  Package,
  Truck as TruckIcon,
  User,
  Eye,
  CheckCircle,
  MoreVertical,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface ShipItemsTableMeta {
  onViewContainers: (containers: Container[]) => void;
  onAssignClick: (shipItem: ShipItem) => void;
  onMarkAsDelivered?: (shipItem: ShipItem) => void;
  trucks: Truck[];
  drivers: Driver[];
  ship: Ship;
  isAssigning?: boolean;
  isMarkingDelivered?: boolean;
  isTransporter?: boolean;
}

// Status Badge Component
function StatusBadge({ status }: { status: string }) {
  const config = {
    DELIVERED: {
      bg: "bg-emerald-500/10",
      text: "text-emerald-600",
      dot: "bg-emerald-500",
    },
    IN_TRANSIT: {
      bg: "bg-amber-500/10",
      text: "text-amber-600",
      dot: "bg-amber-500",
    },
    PENDING: {
      bg: "bg-blue-500/10",
      text: "text-blue-600",
      dot: "bg-blue-500",
    },
  }[status?.toUpperCase()] || {
    bg: "bg-gray-100",
    text: "text-gray-600",
    dot: "bg-gray-400",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold",
        config.bg,
        config.text,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", config.dot)} />
      {status || "PENDING"}
    </span>
  );
}

// Assignment Status Badge
function AssignmentBadge({ item }: { item: ShipItem }) {
  const { t } = useTranslation(["shipments", "common"]);
  const hasTruck = !!(item.truck || item.truck_id || item.assigned_truck_id);
  const hasDriver = !!(
    item.driver ||
    item.driver_id ||
    item.assigned_driver_id
  );

  if (hasTruck && hasDriver) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600">
        <TruckIcon className="h-3 w-3" />
        <User className="h-3 w-3" />
        {t("shipments:ship_items_table.assigned")}
      </span>
    );
  } else if (hasTruck || hasDriver) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-600">
        {hasTruck ? (
          <TruckIcon className="h-3 w-3" />
        ) : (
          <User className="h-3 w-3" />
        )}
        {t("shipments:ship_items_table.partial")}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-500/10 text-red-600">
      {t("shipments:ship_items_table.unassigned")}
    </span>
  );
}

export function useShipItemsColumns() {
  const { t } = useTranslation(["shipments", "common"]);

  const columns: ColumnDef<ShipItem>[] = [
    {
      id: "details",
      header: () => (
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {t("shipments:ship_items_table.details_header")}
        </span>
      ),
      cell: ({ row }) => {
        const item = row.original;
        const containers =
          item.containers || (item.container ? [item.container] : []);
        const totalWeight = containers.reduce(
          (acc, c) => acc + (c.gross_weight || c.weight || 0),
          0,
        );

        return (
          <div className="flex items-start gap-2.5">
            <div className="flex-shrink-0 p-1.5 rounded-lg bg-primary/10 text-primary mt-0.5">
              <Package className="h-3.5 w-3.5" />
            </div>
            <div className="flex flex-col gap-1 min-w-0">
              <span className="text-[10px] font-medium text-muted-foreground/90 bg-muted/40 px-2 py-0.5 rounded-md w-fit whitespace-nowrap">
                {containers.length}{" "}
                {containers.length === 1 
                  ? t("shipments:ship_items_table.container_one") 
                  : t("shipments:ship_items_table.container_other")}
              </span>
              <span className="text-[11px] font-bold text-primary px-0.5">
                {totalWeight.toLocaleString()} Kg
              </span>
            </div>
          </div>
        );
      },
    },
    {
      id: "assignment",
      header: () => (
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {t("shipments:ship_items_table.assignment_header")}
        </span>
      ),
      cell: ({ row }) => {
        const item = row.original;
        const truck = item.truck || item.assigned_truck;
        const driver = item.driver || item.assigned_driver;

        return (
          <div className="space-y-1">
            {truck ? (
              <div className="flex items-center gap-1.5 text-xs">
                <TruckIcon className="h-3 w-3 text-muted-foreground" />
                <span className="font-medium truncate max-w-[100px]">
                  {truck.plate_number}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <TruckIcon className="h-3 w-3" />
                <span>{t("shipments:ship_items_table.no_truck")}</span>
              </div>
            )}
            {driver ? (
              <div className="flex items-center gap-1.5 text-xs">
                <User className="h-3 w-3 text-muted-foreground" />
                <span className="font-medium truncate max-w-[100px]">
                  {driver.first_name} {driver.last_name}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <User className="h-3 w-3" />
                <span>{t("shipments:ship_items_table.no_driver")}</span>
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      id: "status",
      header: () => (
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {t("shipments:ship_items_table.status_header")}
        </span>
      ),
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="space-y-1">
            <StatusBadge status={row.getValue("status") as string} />
            <AssignmentBadge item={item} />
          </div>
        );
      },
    },
    {
      id: "actions",
      enableHiding: false,
      header: () => (
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {t("shipments:ship_items_table.actions_header")}
        </span>
      ),
      cell: ({ row, table }) => {
        const item = row.original;
        const meta = table.options.meta as unknown as ShipItemsTableMeta;
        const containers =
          item.containers || (item.container ? [item.container] : []);
        const isDelivered = (item.status?.toUpperCase() ?? "") === "DELIVERED";
        const showMarkDelivered =
          meta?.isTransporter && meta?.onMarkAsDelivered && !isDelivered;

        return (
          <div
            className="flex items-center justify-start gap-1.5"
            onClick={(e) => e.stopPropagation()}
          >
            {showMarkDelivered && (
              <Button
                variant="outline"
                size="sm"
                className="h-7 w-8 min-[391px]:w-auto gap-1 rounded-lg text-[11px] font-medium text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10 hover:text-emerald-600 p-0 min-[391px]:px-2.5"
                onClick={(e) => {
                  e.stopPropagation();
                  meta.onMarkAsDelivered?.(item);
                }}
                disabled={meta?.isMarkingDelivered}
              >
                <CheckCircle className="h-3 w-3 min-[391px]:hidden" />
                <span className="hidden min-[391px]:inline whitespace-nowrap">
                  {t("shipments:ship_items_table.mark_delivered")}
                </span>
              </Button>
            )}

            <div className="flex-shrink-0">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="h-8 w-8 p-0 hover:bg-primary/10 transition-colors rounded-lg"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44 rounded-xl">
                  <DropdownMenuItem
                    className="rounded-lg cursor-pointer text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      meta?.onAssignClick(item);
                    }}
                    disabled={meta?.isAssigning}
                  >
                    <TruckIcon className="mr-2 h-3.5 w-3.5" />
                    {t("shipments:ship_items_table.assign_action")}
                  </DropdownMenuItem>

                  {containers.length > 0 && (
                    <DropdownMenuItem
                      className="rounded-lg cursor-pointer text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        meta?.onViewContainers(containers);
                      }}
                    >
                      <Eye className="mr-2 h-3.5 w-3.5" />
                      {t("shipments:ship_items_table.view_containers")}
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        );
      },
    },
  ];

  return columns;
}
