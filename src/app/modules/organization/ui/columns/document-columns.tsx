"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export type OrganizationDocumentTableRow = {
  id: number;
  document_type: string;
  status: string;
  created_at: string;
  entity_type?: "truck" | "driver" | null;
  entity_id?: number | null;
  entity_name?: string | null;
  presigned_url?: string | null;
  file_name?: string | null;
};

export const organizationDocumentColumns = (
  t: any,
  onView: (id: string) => void,
  onEdit: (id: string) => void,
  onDelete: (id: number) => void,
  isDeleting: boolean,
  onEntityClick: (type: string, id: number | null) => void,
): ColumnDef<OrganizationDocumentTableRow>[] => [
  {
    accessorKey: "document_type",
    header: t("organization:fields.document_type"),
    cell: ({ row }) => {
      const type = row.getValue("document_type") as string;
      return (
        <div className="flex flex-col">
          <span className="font-medium text-brand-primary">
            {t(`organization:types.${type}`, { defaultValue: type.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()) })}
          </span>
          {row.original.file_name && (
            <span className="text-[10px] text-muted-foreground truncate max-w-[150px]">
              {row.original.file_name}
            </span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "entity_type",
    header: t("organization:fields.entity_type"),
    cell: ({ row }) => {
      const type = row.getValue("entity_type") as string;
      const entityId = row.original.entity_id;
      const entityName = row.original.entity_name;

      if (!type) return <span className="text-muted-foreground">—</span>;

      return (
        <button
          onClick={() => onEntityClick(type, entityId || null)}
          className="flex items-center gap-1.5 text-xs font-medium text-brand-secondary hover:underline transition-all"
        >
          <span className="capitalize">{t(`organization:entities.${type.toLowerCase()}`, { defaultValue: type })}</span>
          {entityName && (
            <span className="text-muted-foreground font-normal">
              ({entityName})
            </span>
          )}
          <ExternalLink className="h-3 w-3 opacity-50" />
        </button>
      );
    },
  },
  {
    accessorKey: "status",
    header: t("organization:fields.status"),
    cell: ({ row }) => {
      const status = (row.getValue("status") as string).toLowerCase();
      const statusValue = status.replace(/_/g, "");

      const getStatusColor = (s: string) => {
        switch (s) {
          case "approved":
            return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
          case "pending":
            return "bg-amber-500/10 text-amber-600 border-amber-500/20";
          case "rejected":
          case "inactive":
            return "bg-rose-500/10 text-rose-600 border-rose-500/20";
          default:
            return "bg-slate-500/10 text-slate-600 border-slate-500/20";
        }
      };

      return (
        <Badge
          variant="outline"
          className={cn("capitalize px-2 py-0.5 text-[10px]", getStatusColor(statusValue))}
        >
          {t(`organization:tabs.${statusValue}`, { defaultValue: status })}
        </Badge>
      );
    },
  },
  {
    accessorKey: "created_at",
    header: t("organization:fields.created_at"),
    cell: ({ row }) => {
      const date = row.getValue("created_at") as string;
      return (
        <div className="flex flex-col text-xs">
          <span className="text-muted-foreground">
            {format(new Date(date), "MMM dd, yyyy")}
          </span>
          <span className="text-[10px] text-muted-foreground/60">
            {format(new Date(date), "hh:mm a")}
          </span>
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const doc = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-8 w-8 p-0 hover:bg-muted"
              disabled={isDeleting}
            >
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[160px]">
            <DropdownMenuLabel>{t("common:buttons.actions")}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onView(doc.id.toString())}>
              <Eye className="mr-2 h-4 w-4" />
              {t("common:buttons.view")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(doc.id.toString())}>
              <Pencil className="mr-2 h-4 w-4" />
              {t("common:buttons.edit")}
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-rose-600 focus:text-rose-600"
              onClick={() => onDelete(doc.id)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {t("common:buttons.delete")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
