"use client";

import { FileText, Calendar, Eye, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { OrganizationDocument } from "@/lib/api/organization";

function getDocumentTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    trade_licence: "Trade Licence",
    id: "Authorised Contact Person Company ID",
    other: "Other",
  };
  return labels[type] || type.replace(/_/g, " ");
}

function getStatusStyle(status: string): string {
  const normalizedStatus = String(status).toLowerCase().replace(/_/g, "");
  switch (normalizedStatus) {
    case "approved":
      return "bg-green-600 text-white";
    case "rejected":
    case "inactive":
      return "bg-red-500 text-white";
    case "pending":
    default:
      return "bg-amber-500 text-white";
  }
}

interface OrganizationDocumentMobileCardProps {
  document: OrganizationDocument;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: number) => void;
  isDeleting?: boolean;
}

export function OrganizationDocumentMobileCard({
  document: doc,
  onView,
  onEdit,
  onDelete,
  isDeleting = false,
}: OrganizationDocumentMobileCardProps) {
  const date = doc.created_at
    ? new Date(doc.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "—";
  const status = doc.status || "pending";

  return (
    <div className="rounded-xl p-4 flex flex-col gap-3 bg-green-50/90 dark:bg-green-950/20 border border-green-200/50 dark:border-green-800/30">
      {/* Row 1: Icon, Title + Subtitle, Status */}
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-green-200/80 dark:bg-green-800/40 text-green-700 dark:text-green-300">
          <FileText className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-sm text-gray-800 dark:text-gray-200 leading-tight">
            {getDocumentTypeLabel(doc.document_type)}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
            Organization
          </p>
        </div>
        <span
          className={cn(
            "shrink-0 rounded-md px-2 py-1 text-xs font-medium capitalize",
            getStatusStyle(status),
          )}
        >
          {status}
        </span>
      </div>

      {/* Row 2: Date */}
      <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
        <Calendar className="h-4 w-4 text-green-600/80 dark:text-green-400/80" />
        {date}
      </div>

      {/* Row 3: View | Edit | Delete - visible at a glance */}
      <div className="flex items-center gap-2 pt-1 border-t border-green-200/60 dark:border-green-800/30">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5 text-green-700 dark:text-green-400 hover:bg-green-100/80 dark:hover:bg-green-900/30 hover:text-green-800 dark:hover:text-green-300 px-2"
          onClick={() => onView(String(doc.id))}
        >
          <Eye className="h-3.5 w-3.5" />
          View
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5 text-green-700 dark:text-green-400 hover:bg-green-100/80 dark:hover:bg-green-900/30 hover:text-green-800 dark:hover:text-green-300 px-2"
          onClick={() => onEdit(String(doc.id))}
        >
          <Edit className="h-3.5 w-3.5" />
          Edit
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-700 dark:hover:text-red-300 px-2"
          onClick={() => onDelete(doc.id)}
          disabled={isDeleting}
        >
          <Trash2 className="h-3.5 w-3.5" />
          Delete
        </Button>
      </div>
    </div>
  );
}
