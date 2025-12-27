"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal, Eye, Trash2, File } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { TruckDocument } from "@/app/modules/fleet/server/hooks/use-truck-documents";

export type DocumentTableRow = TruckDocument;

export const documentColumns = (
  onView: (url: string) => void,
  onDelete: (id: number) => void,
  isDeleting: boolean
): ColumnDef<DocumentTableRow>[] => [
  {
    accessorKey: "document_type",
    id: "document_type",
    enableHiding: false,
    header: ({ column }) => {
      return (
        <span
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="text-xs sm:text-sm flex items-center cursor-pointer px-1"
        >
          Document Type
          <ArrowUpDown className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
        </span>
      );
    },
    cell: ({ row }) => {
      const doc = row.original;
      return (
        <div className="flex items-center gap-2 min-w-[120px] sm:min-w-[140px]">
          <File className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="font-medium text-xs sm:text-sm capitalize">
            {doc.document_type
              ? doc.document_type.replace(/_/g, " ")
              : "Document"}
          </span>
        </div>
      );
    },
    meta: {
      sticky: true,
    },
  },
  {
    accessorKey: "created_at",
    id: "created_at",
    header: ({ column }) => {
      return (
        <span
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="text-xs sm:text-sm flex items-center cursor-pointer px-1"
        >
          Uploaded Date
          <ArrowUpDown className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
        </span>
      );
    },
    cell: ({ row }) => {
      const doc = row.original;
      const date = doc.created_at
        ? new Date(doc.created_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })
        : "—";
      return (
        <div className="text-xs sm:text-sm min-w-[100px] whitespace-nowrap">
          {date}
        </div>
      );
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const doc = row.original;

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
              {doc.file_url && (
                <DropdownMenuItem onClick={() => onView(doc.file_url)}>
                  <Eye className="mr-2 h-4 w-4" /> View
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => onDelete(doc.id)}
                disabled={isDeleting}
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];

