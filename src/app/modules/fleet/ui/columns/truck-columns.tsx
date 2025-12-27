"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal, Edit2, Trash2, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Truck } from "@/lib/api/trucks";

export type TruckTableRow = Truck;

export const truckColumns: ColumnDef<TruckTableRow>[] = [
  {
    accessorKey: "plate_number",
    id: "plate_number",
    enableHiding: false, // Always visible on mobile
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-0 text-xs sm:text-sm w-full justify-start -ml-1 sm:ml-0"
        >
          <span className="hidden sm:inline">Plate / </span>VIN
          <ArrowUpDown className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const truck = row.original;
      return (
        <div className="flex flex-col min-w-[120px] sm:min-w-[140px] justify-center">
          <span className="font-bold text-brand-primary text-xs sm:text-sm">
            {truck.plate_number}
          </span>
          <span className="text-[9px] sm:text-[10px] text-muted-foreground font-normal">
            {truck.vin}
          </span>
        </div>
      );
    },
    meta: {
      sticky: true,
    },
  },
  {
    accessorKey: "truck_type",
    id: "truck_type",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-1 sm:px-2 lg:px-3 text-xs sm:text-sm"
        >
          Type
          <ArrowUpDown className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return (
        <div className="capitalize text-xs sm:text-sm min-w-[80px] whitespace-nowrap flex items-center">
          {row.getValue("truck_type")}
        </div>
      );
    },
  },
  {
    accessorKey: "make",
    id: "make",
    header: () => (
      <div className="text-xs sm:text-sm whitespace-nowrap px-0">
        Make / Model
      </div>
    ),
    cell: ({ row }) => {
      const truck = row.original;
      return (
        <div className="min-w-[120px] sm:min-w-[140px] flex items-center">
          <div className="flex flex-col">
            <span className="text-xs sm:text-sm">{truck.make || "—"}</span>
            <span className="text-[9px] sm:text-[10px] text-muted-foreground">
              {truck.model || "—"}
            </span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "capacity_quintal",
    id: "capacity_quintal",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-0 text-xs sm:text-sm whitespace-nowrap w-full justify-start -ml-1 sm:ml-0"
        >
          Capacity
          <ArrowUpDown className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return (
        <div className="text-xs sm:text-sm min-w-[80px] whitespace-nowrap flex items-center">
          {row.getValue("capacity_quintal")} Q
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    id: "status",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-0 text-xs sm:text-sm whitespace-nowrap w-full justify-start"
        >
          Status
          <ArrowUpDown className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <div className="flex items-center">
          <Badge
            variant="secondary"
            className={cn(
              "font-semibold text-[9px] sm:text-[10px] md:text-xs min-w-[90px] sm:min-w-[100px] whitespace-nowrap",
              status === "active" &&
                "bg-green-100 text-green-700 hover:bg-green-100",
              status === "maintenance" &&
                "bg-amber-100 text-amber-700 hover:bg-amber-100",
              status === "inactive" &&
                "bg-gray-100 text-gray-700 hover:bg-gray-100",
              status === "out_of_service" &&
                "bg-red-100 text-red-700 hover:bg-red-100"
            )}
          >
            {status.replace(/_/g, " ").charAt(0).toUpperCase() +
              status.replace(/_/g, " ").slice(1)}
          </Badge>
        </div>
      );
    },
  },
  {
    id: "actions",
    enableHiding: false, // Always visible on mobile
    cell: ({ row, table }) => {
      const truck = row.original;
      const router = useRouter();
      const meta = table.options.meta as {
        onEdit?: (truck: Truck) => void;
        onDelete?: (truck: Truck) => void;
      };

      return (
        <div className="text-right min-w-[50px] sm:min-w-[60px] flex items-center justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-7 w-7 sm:h-8 sm:w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => router.push(`/fleet/${truck.id}`)}
              >
                <Eye className="mr-2 h-4 w-4" /> View Details
              </DropdownMenuItem>
              {meta?.onEdit && (
                <DropdownMenuItem onClick={() => meta.onEdit?.(truck)}>
                  <Edit2 className="mr-2 h-4 w-4" /> Edit
                </DropdownMenuItem>
              )}
              {meta?.onDelete && (
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => meta.onDelete?.(truck)}
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
