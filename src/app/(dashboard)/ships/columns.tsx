"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Ship } from "@/types/ship";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { formatDate } from "@/lib/format";

function ActionCell({ ship }: { ship: Ship }) {
  const router = useRouter();
  const { t } = useTranslation("common");
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
        title={t("buttons.edit")}
      >
        <Eye className="h-4 w-4" />
      </Button>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const { t } = useTranslation("shipments");
  const config: Record<string, { label: string; className: string }> = {
    created: { label: t("status.pending"), className: "bg-muted text-muted-foreground" },
    price_requested: {
      label: t("status.pending"),
      className: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
    },
    priced: {
      label: t("status.pending"),
      className: "bg-violet-500/10 text-violet-700 dark:text-violet-400",
    },
    accepted_by_shipper: {
      label: t("status.assigned"),
      className: "bg-primary/10 text-primary",
    },
    rejected_by_shipper: {
      label: t("status.cancelled"),
      className: "bg-red-500/10 text-red-700 dark:text-red-400",
    },
    allocated: {
      label: t("status.assigned"),
      className: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400",
    },
    ready_for_pickup: {
      label: t("status.assigned"),
      className: "bg-lime-500/10 text-lime-700 dark:text-lime-400",
    },
    in_transit: {
      label: t("status.in_transit"),
      className: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
    },
    delivered: {
      label: t("status.delivered"),
      className: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-400",
    },
    completed: {
      label: t("status.delivered"),
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

export const getColumns = (t: any): ColumnDef<Ship>[] => [
  {
    accessorKey: "id",
    id: "id",
    enableHiding: false,
    header: t("shipments:columns.shipment_id"),
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
        {t("shipments:columns.origin")}
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
    header: t("shipments:status.pending"), // Or "Pickup"
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {row.original.pickup_date ? formatDate(row.original.pickup_date) : "—"}
      </span>
    ),
  },
  {
    accessorKey: "delivery_date",
    id: "delivery_date",
    header: t("shipments:status.delivered"), // Or "Delivery"
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {row.original.delivery_date ? formatDate(row.original.delivery_date) : "—"}
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
        {t("shipments:columns.status")}
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
