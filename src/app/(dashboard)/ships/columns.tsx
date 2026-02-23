"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Ship } from "@/types/ship";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

function ActionCell({ ship }: { ship: Ship }) {
  const router = useRouter();
  return (
    <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-muted-foreground hover:text-foreground"
        onClick={(e) => {
          e.stopPropagation();
          router.push(`/ships/placeholder?id=${ship.id}`);
        }}
        title="View details"
      >
        <Eye className="h-4 w-4" />
      </Button>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    created: { label: "Created", className: "bg-muted text-muted-foreground" },
    price_requested: {
      label: "Price Requested",
      className: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
    },
    priced: {
      label: "Priced",
      className: "bg-violet-500/10 text-violet-700 dark:text-violet-400",
    },
    accepted_by_shipper: {
      label: "Accepted",
      className: "bg-primary/10 text-primary",
    },
    rejected_by_shipper: {
      label: "Rejected",
      className: "bg-red-500/10 text-red-700 dark:text-red-400",
    },
    allocated: {
      label: "Allocated",
      className: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400",
    },
    ready_for_pickup: {
      label: "Ready for Pickup",
      className: "bg-lime-500/10 text-lime-700 dark:text-lime-400",
    },
    in_transit: {
      label: "In Transit",
      className: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
    },
    delivered: {
      label: "Delivered",
      className: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-400",
    },
    completed: {
      label: "Completed",
      className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    },
  };
  const c = config[status?.toLowerCase()] ?? {
    label: status?.replace(/_/g, " ") || "—",
    className: "bg-muted text-muted-foreground",
  };
  return (
    <span
      className={cn(
        "inline-flex px-2 py-0.5 rounded-md text-xs font-medium",
        c.className,
      )}
    >
      {c.label}
    </span>
  );
}

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

export const columns: ColumnDef<Ship>[] = [
  {
    accessorKey: "id",
    id: "id",
    enableHiding: false,
    header: "ID",
    cell: ({ row }) => (
      <span className="font-mono text-sm font-bold text-primary">
        #{row.getValue("id")}
      </span>
    ),
  },
  {
    accessorKey: "origin",
    id: "origin",
    header: ({ column }) => (
      <Button
        variant="ghost"
        size="sm"
        className="-ml-3 h-8"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Route
        <ArrowUpDown className="ml-2 h-3.5 w-3.5 opacity-50" />
      </Button>
    ),
    cell: ({ row }) => {
      const origin = formatLocation(row.original.origin);
      const destination = formatLocation(row.original.destination);
      const facility = row.original.pickup_facility?.name;
      return (
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-medium">
            {origin} → {destination}
          </span>
          {facility && (
            <span className="text-xs text-muted-foreground truncate">
              {facility}
            </span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "pickup_date",
    id: "pickup_date",
    header: "Pickup",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {formatDate(row.original.pickup_date)}
      </span>
    ),
  },
  {
    accessorKey: "delivery_date",
    id: "delivery_date",
    header: "Delivery",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {formatDate(row.original.delivery_date)}
      </span>
    ),
  },
  {
    accessorKey: "status",
    id: "status",
    header: ({ column }) => (
      <Button
        variant="ghost"
        size="sm"
        className="-ml-3 h-8"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Status
        <ArrowUpDown className="ml-2 h-3.5 w-3.5 opacity-50" />
      </Button>
    ),
    cell: ({ row }) => (
      <StatusBadge status={row.getValue("status") as string} />
    ),
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => <ActionCell ship={row.original} />,
  },
];
