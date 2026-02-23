"use client";

import { ColumnDef } from "@tanstack/react-table";
import {
  ArrowUpDown,
  Eye,
  Trash2,
  File,
  Edit,
  Truck,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { OrganizationDocument } from "@/lib/api/organization";

export type OrganizationDocumentTableRow = OrganizationDocument;

export const organizationDocumentColumns = (
  onView: (id: string) => Promise<void>,
  onEdit: (id: string) => void,
  onDelete: (id: number) => void,
  isDeleting: boolean,
  onEntityClick?: (entityType: string, entityId: number | null) => void,
): ColumnDef<OrganizationDocumentTableRow>[] => [
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
    accessorKey: "entity_type",
    id: "entity_type",
    header: ({ column }) => {
      return (
        <span
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="text-xs sm:text-sm flex items-center cursor-pointer px-1"
        >
          Entity Type
          <ArrowUpDown className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
        </span>
      );
    },
    cell: ({ row }) => {
      const doc = row.original;
      const entityType = doc.entity_type;
      const entityId = entityType === "truck" ? doc.truck_id : doc.driver_id;

      if (!entityType) {
        return <div className="text-xs sm:text-sm">—</div>;
      }

      const handleClick = () => {
        if (entityId && onEntityClick) {
          onEntityClick(entityType, entityId);
        }
      };

      return (
        <div className="min-w-[80px] sm:min-w-[100px]">
          <Badge
            variant="outline"
            className={cn(
              "font-medium text-xs px-2 py-0.5 h-6 capitalize cursor-pointer hover:bg-accent transition-colors",
              entityId ? "" : "opacity-50 cursor-not-allowed",
            )}
            onClick={entityId ? handleClick : undefined}
          >
            <div className="flex items-center gap-1.5">
              {entityType === "truck" ? (
                <Truck className="h-3 w-3" />
              ) : entityType === "driver" ? (
                <User className="h-3 w-3" />
              ) : null}
              <span>{entityType}</span>
            </div>
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    id: "status",
    header: ({ column }) => {
      return (
        <span
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="text-xs sm:text-sm flex items-center cursor-pointer px-1"
        >
          Status
          <ArrowUpDown className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
        </span>
      );
    },
    cell: ({ row }) => {
      const doc = row.original;
      const status = doc.status || "pending";

      const getStatusColor = (status: string) => {
        const normalizedStatus = status.toLowerCase().replace(/_/g, "");
        switch (normalizedStatus) {
          case "approved":
            return "bg-green-100 text-green-700 hover:bg-green-100";
          case "rejected":
          case "inactive":
            return "bg-red-100 text-red-700 hover:bg-red-100";
          case "pending":
            return "bg-amber-100 text-amber-700 hover:bg-amber-100";
          default:
            return "bg-gray-100 text-gray-700 hover:bg-gray-100";
        }
      };

      return (
        <div className="min-w-[80px]">
          <Badge
            variant="secondary"
            className={cn(
              "font-semibold text-[10px] px-1.5 py-0.5 h-5 capitalize",
              getStatusColor(status),
            )}
          >
            {status}
          </Badge>
        </div>
      );
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
        <div className="flex items-center justify-end gap-0.5 min-w-[100px]">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 sm:h-8 sm:w-8 text-muted-foreground hover:text-foreground"
            onClick={() => onView(String(doc.id))}
            title="View"
          >
            <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 sm:h-8 sm:w-8 text-muted-foreground hover:text-foreground"
            onClick={() => onEdit(String(doc.id))}
            title="Edit"
          >
            <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 sm:h-8 sm:w-8 text-muted-foreground hover:text-destructive"
            onClick={() => onDelete(doc.id)}
            disabled={isDeleting}
            title="Delete"
          >
            <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </Button>
        </div>
      );
    },
  },
];
