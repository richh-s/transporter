"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ShipItem, Truck, Driver, Ship, Container } from "@/types/ship";
import { Button } from "@/components/ui/button";
import {
  Package,
  Truck as TruckIcon,
  User,
  MoreHorizontal,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface ShipItemsTableMeta {
  onViewContainers: (containers: Container[]) => void;
  onAssignClick: (shipItem: ShipItem) => void;
  trucks: Truck[];
  drivers: Driver[];
  ship: Ship;
  isAssigning?: boolean;
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
        Assigned
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
        Partial
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-500/10 text-red-600">
      Unassigned
    </span>
  );
}

export const columns: ColumnDef<ShipItem>[] = [
  {
    accessorKey: "id",
    id: "id",
    enableHiding: false,
    header: () => (
      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        Item
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
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
            <Package className="h-3.5 w-3.5" />
          </div>
          <div>
            <p className="text-xs font-bold">#{row.getValue("id")}</p>
            <p className="text-[10px] text-muted-foreground">
              {containers.length} container{containers.length !== 1 ? "s" : ""}{" "}
              • {totalWeight.toLocaleString()} kg
            </p>
          </div>
        </div>
      );
    },
  },
  {
    id: "assignment",
    header: () => (
      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        Assignment
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
              <span>No truck</span>
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
              <span>No driver</span>
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
        Status
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
    cell: ({ row, table }) => {
      const item = row.original;
      const meta = table.options.meta as unknown as ShipItemsTableMeta;
      const containers =
        item.containers || (item.container ? [item.container] : []);

      return (
        <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 rounded-xl">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  meta?.onAssignClick(item);
                }}
                className="rounded-lg"
              >
                <TruckIcon className="mr-2 h-4 w-4" />
                Assign
              </DropdownMenuItem>
              {containers.length > 0 && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    meta?.onViewContainers(containers);
                  }}
                  className="rounded-lg"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  View Containers
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
