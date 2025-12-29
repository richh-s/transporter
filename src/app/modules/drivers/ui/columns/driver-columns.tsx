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

type Actions = {
  onView: (driver: any) => void;
  onEdit: (driver: any) => void;
  onDelete: (driver: any) => void;
};

export const driverColumns = ({
  onView,
  onEdit,
  onDelete,
}: Actions): ColumnDef<any>[] => [
  {
    accessorKey: "driver_license_number",
    header: "License No",
  },
  {
    accessorKey: "first_name",
    header: "Driver Name",
  },
  {
    accessorKey: "phone_number",
    header: "Phone",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-500/10 text-green-600">
        {row.original.status}
      </span>
    ),
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => {
      const driver = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-36">
            <DropdownMenuItem onClick={() => onView(driver)}>
              <Eye className="mr-2 h-4 w-4" />
              View
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => onEdit(driver)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>

            <DropdownMenuItem
              className="text-destructive"
              onClick={() => onDelete(driver)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
