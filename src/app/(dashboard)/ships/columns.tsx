"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Ship } from "@/types/ship";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, MoreHorizontal, Eye, ArrowRight } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

// Action cell component to use hooks
function ActionCell({ ship }: { ship: Ship }) {
  const router = useRouter();

  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/ships/placeholder?id=${ship.id}`);
  };

  return (
    <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="h-7 w-7 sm:h-8 sm:w-8 p-0 hover:bg-primary/10 transition-colors rounded-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-36 rounded-xl">
          <DropdownMenuItem
            className="rounded-lg cursor-pointer text-xs sm:text-sm"
            onClick={handleViewDetails}
          >
            <Eye className="mr-2 h-3.5 w-3.5" />
            View Details
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

// Status badge component
function StatusBadge({ status }: { status: string }) {
  const getStatusConfig = (s: string) => {
    const normalizedStatus = s?.toLowerCase();
    switch (normalizedStatus) {
      case "created":
        return {
          dot: "bg-slate-400",
          text: "text-slate-700 dark:text-slate-400",
          bg: "bg-slate-400/10",
          label: "Created",
        };
      case "price_requested":
        return {
          dot: "bg-orange-500",
          text: "text-orange-700 dark:text-orange-400",
          bg: "bg-orange-500/10",
          label: "Price Requested",
        };
      case "priced":
        return {
          dot: "bg-purple-500",
          text: "text-purple-700 dark:text-purple-400",
          bg: "bg-purple-500/10",
          label: "Priced",
        };
      case "accepted_by_shipper":
        return {
          dot: "bg-blue-500",
          text: "text-blue-700 dark:text-blue-400",
          bg: "bg-blue-500/10",
          label: "Accepted by Shipper",
        };
      case "rejected_by_shipper":
        return {
          dot: "bg-red-500",
          text: "text-red-700 dark:text-red-400",
          bg: "bg-red-500/10",
          label: "Rejected by Shipper",
        };
      case "allocated":
        return {
          dot: "bg-indigo-500",
          text: "text-indigo-700 dark:text-indigo-400",
          bg: "bg-indigo-500/10",
          label: "Allocated",
        };
      case "ready_for_pickup":
        return {
          dot: "bg-lime-500",
          text: "text-lime-700 dark:text-lime-400",
          bg: "bg-lime-500/10",
          label: "Ready for Pickup",
        };
      case "in_transit":
        return {
          dot: "bg-amber-500",
          text: "text-amber-700 dark:text-amber-400",
          bg: "bg-amber-500/10",
          label: "In Transit",
        };
      case "delivered":
        return {
          dot: "bg-cyan-500",
          text: "text-cyan-700 dark:text-cyan-400",
          bg: "bg-cyan-500/10",
          label: "Delivered",
        };
      case "completed":
        return {
          dot: "bg-emerald-500",
          text: "text-emerald-700 dark:text-emerald-400",
          bg: "bg-emerald-500/10",
          label: "Completed",
        };
      default:
        return {
          dot: "bg-gray-400",
          text: "text-gray-600 dark:text-gray-400",
          bg: "bg-gray-100 dark:bg-gray-800",
          label: s?.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) || "Unknown",
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold",
        config.bg,
        config.text,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", config.dot)} />
      {config.label}
    </div>
  );
}

export const columns: ColumnDef<Ship>[] = [
  {
    accessorKey: "id",
    id: "id",
    enableHiding: false,
    header: () => (
      <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground pl-1">
        ID
      </span>
    ),
    cell: ({ row }) => (
      <div className="pl-1">
        <span className="font-mono text-xs sm:text-sm font-bold text-primary">
          #{row.getValue("id")}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "origin",
    id: "origin",
    header: ({ column }) => (
      <span
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center cursor-pointer"
      >
        Route
        <ArrowUpDown className="ml-1 h-3 w-3" />
      </span>
    ),
    cell: ({ row }) => {
      const origin = row.original.origin || "-";
      const destination = row.original.destination || "-";
      return (
        <div className="flex flex-col min-w-[140px]">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-xs sm:text-sm text-foreground capitalize truncate max-w-[80px]">
              {origin.replace(/_/g, " ")}
            </span>
            <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
            <span className="font-bold text-xs sm:text-sm text-foreground capitalize truncate max-w-[80px]">
              {destination.replace(/_/g, " ")}
            </span>
          </div>
          <span className="text-[9px] sm:text-[10px] text-muted-foreground">
            {row.original.pickup_facility?.name || "—"}
          </span>
        </div>
      );
    },
    meta: {
      sticky: true,
    },
  },
  {
    accessorKey: "pickup_date",
    id: "pickup_date",
    header: () => (
      <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Pickup
      </span>
    ),
    cell: ({ row }) => {
      const pickupStr = row.original.pickup_date;
      if (!pickupStr) return <span className="text-muted-foreground">—</span>;

      try {
        const date = new Date(pickupStr);
        return (
          <div className="flex flex-col">
            <span className="text-xs sm:text-sm font-semibold text-foreground">
              {format(date, "MMM d")}
            </span>
            <span className="text-[9px] sm:text-[10px] text-muted-foreground">
              {format(date, "yyyy")}
            </span>
          </div>
        );
      } catch {
        return <span className="text-muted-foreground">—</span>;
      }
    },
  },
  {
    accessorKey: "delivery_date",
    id: "delivery_date",
    header: () => (
      <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Delivery
      </span>
    ),
    cell: ({ row }) => {
      const deliveryStr = row.original.delivery_date;
      if (!deliveryStr) return <span className="text-muted-foreground">—</span>;

      try {
        const date = new Date(deliveryStr);
        return (
          <div className="flex flex-col">
            <span className="text-xs sm:text-sm font-semibold text-foreground">
              {format(date, "MMM d")}
            </span>
            <span className="text-[9px] sm:text-[10px] text-muted-foreground">
              {format(date, "yyyy")}
            </span>
          </div>
        );
      } catch {
        return <span className="text-muted-foreground">—</span>;
      }
    },
  },
  {
    accessorKey: "status",
    id: "status",
    header: ({ column }) => (
      <span
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center cursor-pointer"
      >
        Status
        <ArrowUpDown className="ml-1 h-3 w-3" />
      </span>
    ),
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return <StatusBadge status={status} />;
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => <ActionCell ship={row.original} />,
  },
];
