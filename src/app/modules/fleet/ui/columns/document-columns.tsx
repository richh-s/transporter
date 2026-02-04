"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Eye, Trash2, File, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";

import type { TruckDocument } from "@/lib/api/trucks";

export type DocumentTableRow = TruckDocument;

export const documentColumns = (
  onView: (url: string) => void,
  onUpdate: (id: number) => void,
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
      header: () => <div className="text-left">Actions</div>,
      cell: ({ row }) => {
        const doc = row.original;

        return (
          <div className="text-left min-w-[120px] sm:min-w-[140px] flex items-center justify-start gap-1 sm:gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 sm:h-8 sm:w-8"
              onClick={() => {
                const url = doc.presigned_url || doc.file_url;
                if (url) onView(url);
              }}
              disabled={!doc.presigned_url && !doc.file_url}
              title={doc.presigned_url || doc.file_url ? "View document" : "No file available"}
            >
              <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 sm:h-8 sm:w-8"
              onClick={() => onUpdate(doc.id)}
              title="Update document"
            >
              <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 sm:h-8 sm:w-8 text-destructive hover:text-destructive"
              onClick={() => onDelete(doc.id)}
              disabled={isDeleting}
              title="Delete document"
            >
              <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

