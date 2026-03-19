"use client";

import { ColumnDef } from "@tanstack/react-table";
import {
  ArrowUpDown,
  MoreHorizontal,
  Edit,
  Power,
  Eye,
  Satellite,
  Truck,
  Clock,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import type { GPSDevice } from "@/types/gps-device";
import { format } from "date-fns";

export type GPSDeviceTableRow = GPSDevice;

function StatusBadge({ active }: { active: boolean }) {
  const { t } = useTranslation("gps");
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold",
        active ? "bg-primary/10 text-primary" : "bg-gray-500/10 text-gray-600",
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          active ? "bg-primary" : "bg-gray-400",
        )}
      />
      {active ? t("create_form.status.active") : t("create_form.status.inactive")}
    </span>
  );
}

function ActionsCell({
  device,
  meta,
}: {
  device: GPSDevice;
  meta?: {
    onEdit?: (device: GPSDevice) => void;
    onDeactivate?: (id: number) => void;
    t?: (key: string) => string;
  };
}) {
  const router = useRouter();

  return (
    <div
      className="text-right min-w-[50px] flex items-center justify-end"
      onClick={(e) => e.stopPropagation()}
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40 rounded-xl">
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/gps-devices/placeholder?id=${device.id}`);
            }}
            className="rounded-lg"
          >
            <Eye className="mr-2 h-4 w-4" /> {meta?.t?.("list.actions.view") || "View"}
          </DropdownMenuItem>
          {meta?.onEdit && (
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                meta.onEdit?.(device);
              }}
              className="rounded-lg"
            >
              <Edit className="mr-2 h-4 w-4" /> {meta?.t?.("list.actions.edit") || "Edit"}
            </DropdownMenuItem>
          )}
          {device.status && meta?.onDeactivate && (
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                meta.onDeactivate?.(device.id);
              }}
              className="text-destructive rounded-lg"
            >
              <Power className="mr-2 h-4 w-4" /> {meta?.t?.("list.actions.deactivate") || "Deactivate"}
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export const gpsDeviceColumns: ColumnDef<GPSDeviceTableRow>[] = [
  {
    accessorKey: "external_device_id",
    id: "plate_number", // Used by DataTable's mobile view as a header
    header: ({ column }) => {
      const { t } = useTranslation("gps");
      return (
        <span
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="text-xs font-semibold uppercase tracking-wider flex items-center cursor-pointer"
        >
          {t("list.columns.device_id_imei")}
          <ArrowUpDown className="ml-2 h-3 w-3" />
        </span>
      );
    },
    cell: ({ row }) => {
      const device = row.original;
      const { t } = useTranslation("gps");
      return (
        <div className="flex flex-col min-w-[150px]">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-primary/10 text-primary">
              <Satellite className="h-3 w-3" />
            </div>
            <span className="font-bold text-sm">
              {device.external_device_id}
            </span>
          </div>
          <span className="text-[10px] text-muted-foreground font-mono mt-0.5 pl-7">
            {t("card.imei")}: {device.imei_number}
          </span>
        </div>
      );
    },
    meta: { sticky: true },
  },
  {
    accessorKey: "device_name",
    header: () => {
      const { t } = useTranslation("gps");
      return (
        <span className="text-xs font-semibold uppercase tracking-wider">
          {t("list.columns.device_info")}
        </span>
      );
    },
    cell: ({ row }) => {
      const device = row.original;
      return (
        <div className="flex flex-col min-w-[120px]">
          <span className="text-xs font-medium">
            {device.device_name || "N/A"}
          </span>
          <span className="text-[10px] text-muted-foreground">
            {device.device_model || "Common Model"}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "expire_date",
    header: () => {
      const { t } = useTranslation("gps");
      return (
        <span className="text-xs font-semibold uppercase tracking-wider">
          {t("list.columns.expiration")}
        </span>
      );
    },
    cell: ({ row }) => {
      const date = row.getValue("expire_date") as string;
      try {
        return (
          <div className="flex items-center gap-1.5 text-xs whitespace-nowrap">
            <Clock className="h-3 w-3 text-muted-foreground" />
            {format(new Date(date), "MMM dd, yyyy")}
          </div>
        );
      } catch {
        return <span className="text-xs">{date}</span>;
      }
    },
  },
  {
    id: "assignment",
    header: () => {
      const { t } = useTranslation("gps");
      return (
        <span className="text-xs font-semibold uppercase tracking-wider">
          {t("list.columns.assignment")}
        </span>
      );
    },
    cell: ({ row, table }) => {
      const device = row.original;
      const meta = table.options.meta as {
        gpsDeviceToTruckMap?: Record<number, number>;
        onEdit?: (device: GPSDevice) => void;
        onDeactivate?: (id: number) => void;
        t?: (key: string) => string;
      };
      const isAssigned = !!meta?.gpsDeviceToTruckMap?.[device.id];
      const { t } = useTranslation("gps");

      return (
        <div className="flex items-center gap-1.5 text-xs min-w-[100px]">
          <Truck
            className={cn(
              "h-3.5 w-3.5",
              isAssigned ? "text-primary" : "text-muted-foreground",
            )}
          />
          <span
            className={
              isAssigned ? "text-primary font-medium" : "text-muted-foreground"
            }
          >
            {isAssigned ? t("card.assigned") : t("card.unassigned")}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: () => {
      const { t } = useTranslation("gps");
      return (
        <span className="text-xs font-semibold uppercase tracking-wider">
          {t("list.columns.status")}
        </span>
      );
    },
    cell: ({ row, table }) => {
      const device = row.original;
      const meta = table.options.meta as {
        onStatusChange?: (device: GPSDevice, newStatus: boolean) => void;
        isUpdating?: boolean;
        onEdit?: (device: GPSDevice) => void;
        onDeactivate?: (id: number) => void;
        t?: (key: string) => string;
      };

      return (
        <div
          className="flex items-center gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          <Switch
            checked={device.status}
            onCheckedChange={(checked) =>
              meta.onStatusChange?.(device, checked)
            }
            disabled={meta.isUpdating}
            className="scale-75"
          />
          <StatusBadge active={device.status} />
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row, table }) => {
      const device = row.original;
      const meta = table.options.meta as {
        onEdit?: (device: GPSDevice) => void;
        onDeactivate?: (id: number) => void;
        t?: (key: string) => string;
      };

      return <ActionsCell device={device} meta={meta} />;
    },
  },
];
