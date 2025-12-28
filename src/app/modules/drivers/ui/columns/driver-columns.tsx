"use client";

import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";


export type Driver = {
  id: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  email: string;
  driver_license_number: string;
  status: "active" | "inactive";
};

// header
function TableHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
      {title}
      <ArrowUpDown className="h-3 w-3 opacity-40" />
    </div>
  );
}

//    Driver Columns

export const driverColumns = (
  onEdit: (driver: Driver) => void,
  onDelete: (driver: Driver) => void
): ColumnDef<Driver>[] => [
  /* License (1st column) */
  {
    accessorKey: "driver_license_number",
    header: () => <TableHeader title="License No" />,
    cell: ({ row }) => (
      <Link
        href={`/drivers/${row.original.id}`}
        className="font-medium text-primary hover:underline"
      >
        {row.original.driver_license_number}
      </Link>
    ),
  },

// driver name
  {
    id: "driver_name",
    header: () => <TableHeader title="Driver Name" />,
    cell: ({ row }) => (
      <Link
        href={`/drivers/${row.original.id}`}
        className="font-semibold text-foreground hover:text-primary hover:underline"
      >
        {row.original.first_name} {row.original.last_name}
      </Link>
    ),
  },

// phone
  {
    accessorKey: "phone_number",
    header: () => <TableHeader title="Phone" />,
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {row.original.phone_number}
      </span>
    ),
  },

// status
  {
    accessorKey: "status",
    header: () => <TableHeader title="Status" />,
    cell: ({ row }) => (
      <Badge
        variant="secondary"
        className={
          row.original.status === "active"
            ? "bg-green-100 text-green-700 px-3 py-1 rounded-full capitalize"
            : "bg-gray-100 text-gray-600 px-3 py-1 rounded-full capitalize"
        }
      >
        {row.original.status}
      </Badge>
    ),
  },

// actions
  {
    id: "actions",
    header: () => (
      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Actions
      </span>
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        {/* Edit */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 hover:bg-muted"
          onClick={() => onEdit(row.original)}
          title="Edit Driver"
        >
          <Pencil className="h-4 w-4 text-muted-foreground" />
        </Button>

        {/* Delete */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 hover:bg-destructive/10"
          onClick={() => onDelete(row.original)}
          title="Delete Driver"
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
    ),
  },
];
