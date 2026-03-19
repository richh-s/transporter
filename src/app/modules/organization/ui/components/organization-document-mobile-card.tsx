"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreVertical,
  Eye,
  Pencil,
  Trash2,
  FileText,
  Clock,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import type { OrganizationDocumentTableRow } from "../columns/document-columns";
import { useTranslation } from "react-i18next";

interface OrganizationDocumentMobileCardProps {
  document: OrganizationDocumentTableRow;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: number) => void;
  isDeleting: boolean;
}

export function OrganizationDocumentMobileCard({
  document,
  onView,
  onEdit,
  onDelete,
  isDeleting,
}: OrganizationDocumentMobileCardProps) {
  const { t } = useTranslation(["organization", "common"]);
  const status = (document.status || "").toLowerCase().replace(/_/g, "");

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
    <div className="p-4 rounded-2xl bg-card border border-border/50 shadow-sm active:scale-[0.98] transition-all space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-brand-primary/10">
            <FileText className="h-5 w-5 text-brand-primary" />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-brand-primary leading-tight truncate">
              {t(`organization:types.${document.document_type}`, { defaultValue: document.document_type.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()) })}
            </h3>
            {document.file_name && (
              <p className="text-[10px] text-muted-foreground truncate max-w-[150px]">
                {document.file_name}
              </p>
            )}
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 -mr-2 rounded-full"
              disabled={isDeleting}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40 rounded-xl">
            <DropdownMenuItem
              onClick={() => onView(document.id.toString())}
              className="rounded-lg"
            >
              <Eye className="mr-2 h-4 w-4" /> {t("common:buttons.view")}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onEdit(document.id.toString())}
              className="rounded-lg"
            >
              <Pencil className="mr-2 h-4 w-4" /> {t("common:buttons.edit")}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(document.id)}
              className="text-rose-600 focus:text-rose-600 rounded-lg"
            >
              <Trash2 className="mr-2 h-4 w-4" /> {t("common:buttons.delete")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block">
            {t("organization:fields.entity_type")}
          </span>
          <div className="flex items-center gap-1 text-xs font-medium text-brand-secondary">
            <span className="capitalize">{t(`organization:entities.${document.entity_type?.toLowerCase() || ""}`, { defaultValue: document.entity_type })}</span>
            {document.entity_name && (
              <span className="text-[10px] text-muted-foreground font-normal truncate">
                ({document.entity_name})
              </span>
            )}
            <ExternalLink className="h-3 w-3 opacity-50" />
          </div>
        </div>

        <div className="space-y-1">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block">
            {t("organization:fields.status")}
          </span>
          <Badge
            variant="outline"
            className={cn("px-2 py-0 text-[10px] h-5", getStatusColor(status))}
          >
            {t(`organization:tabs.${status}`, { defaultValue: document.status })}
          </Badge>
        </div>
      </div>

      <div className="pt-2 border-t border-border/30 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-medium">
          <Clock className="h-3 w-3" />
          <span>{format(new Date(document.created_at), "MMM d, yyyy")}</span>
        </div>
        <span className="text-[10px] font-mono text-muted-foreground/60">
          ID: {document.id}
        </span>
      </div>
    </div>
  );
}
