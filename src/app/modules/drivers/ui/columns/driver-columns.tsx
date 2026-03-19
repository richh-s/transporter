"use client";

import { ColumnDef } from "@tanstack/react-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Eye, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Driver } from "../../server/types";

type Actions = {
  t: (key: string, options?: any) => string;
  onView: (driver: Driver) => void;
  onEdit: (driver: Driver) => void;
  onDelete: (driver: Driver) => void;
};

export const driverColumns = ({
  t,
  onView,
  onEdit,
  onDelete,
}: Actions): ColumnDef<Driver>[] => [
  {
    accessorKey: "driver_license_number",
    header: () => (
      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {t("drivers:labels.license_no")}
      </span>
    ),
    cell: ({ row }) => (
      <div className="font-medium text-sm">
        {row.original.driver_license_number}
      </div>
    ),
  },
  {
    accessorKey: "first_name",
    header: () => (
      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {t("drivers:labels.driver_info")}
      </span>
    ),
    cell: ({ row }) => (
      <div className="text-sm font-medium">
        {row.original.first_name} {row.original.last_name}
      </div>
    ),
  },
  {
    accessorKey: "phone_number",
    header: () => (
      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {t("drivers:labels.phone")}
      </span>
    ),
    cell: ({ row }) => (
      <div className="text-sm text-muted-foreground">
        {row.original.phone_number}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: () => (
      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {t("drivers:fields.status")}
      </span>
    ),
    cell: ({ row }) => {
      const status = row.original.status;

      return (
        <span
          className={cn(
            "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
            status === "active" && "bg-primary/10 text-primary",
            status === "suspended" &&
              "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
          )}
        >
          {t(`drivers:status.${status.toLowerCase()}`, { defaultValue: status })}
        </span>
      );
    },
  },
  {
    id: "actions",
    header: () => <span className="sr-only">{t("common:actions.actions", { defaultValue: "Actions" })}</span>,
    cell: ({ row }) => {
      const driver = row.original;

      return (
        <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-36">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onView(driver);
                }}
              >
                <Eye className="mr-2 h-4 w-4" />
                {t("common:buttons.view")}
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(driver);
                }}
              >
                <Pencil className="mr-2 h-4 w-4" />
                {t("common:buttons.edit")}
              </DropdownMenuItem>

              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(driver);
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {t("common:buttons.delete")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
