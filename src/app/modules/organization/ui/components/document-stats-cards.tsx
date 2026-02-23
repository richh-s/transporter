"use client";

import { FileText, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import type { OrganizationDocument } from "@/lib/api/organization";

interface DocumentStatsCardsProps {
  documents: OrganizationDocument[];
}

export function DocumentStatsCards({ documents }: DocumentStatsCardsProps) {
  const total = documents.length;
  const pending = documents.filter(
    (doc) => (doc.status || "").toLowerCase() === "pending",
  ).length;
  const approved = documents.filter(
    (doc) => (doc.status || "").toLowerCase() === "approved",
  ).length;
  const rejected = documents.filter((doc) => {
    const s = (doc.status || "").toLowerCase().replace(/_/g, "");
    return s === "rejected" || s === "inactive";
  }).length;

  const cardClass =
    "shrink-0 w-[72%] min-w-[140px] sm:shrink sm:w-auto sm:min-w-0 p-3 bg-card border border-border rounded-xl shadow-sm";

  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 sm:overflow-visible sm:pb-0 sm:grid sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className={cardClass}>
        <div className="flex items-center justify-between">
          <div className="p-1.5 bg-brand-primary/10 rounded-lg text-brand-primary">
            <FileText className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2">
          <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            Total Documents
          </h3>
          <p className="text-xl sm:text-2xl font-bold text-foreground mt-0.5">
            {total}
          </p>
        </div>
      </div>

      <div className={cardClass}>
        <div className="flex items-center justify-between">
          <div className="p-1.5 bg-amber-500/10 rounded-lg text-amber-600">
            <Clock className="h-4 w-4" />
          </div>
          <span className="hidden sm:inline-block text-[10px] font-bold text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full">
            Pending
          </span>
        </div>
        <div className="mt-2">
          <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            Pending
          </h3>
          <p className="text-xl sm:text-2xl font-bold text-foreground mt-0.5">
            {pending}
          </p>
        </div>
      </div>

      <div className={cardClass}>
        <div className="flex items-center justify-between">
          <div className="p-1.5 bg-green-500/10 rounded-lg text-green-600">
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <span className="hidden sm:inline-block text-[10px] font-bold text-green-600 bg-green-500/10 px-2 py-0.5 rounded-full">
            Approved
          </span>
        </div>
        <div className="mt-2">
          <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            Approved
          </h3>
          <p className="text-xl sm:text-2xl font-bold text-foreground mt-0.5">
            {approved}
          </p>
        </div>
      </div>

      <div className={cardClass}>
        <div className="flex items-center justify-between">
          <div className="p-1.5 bg-red-500/10 rounded-lg text-red-600">
            <AlertCircle className="h-4 w-4" />
          </div>
          <span className="hidden sm:inline-block text-[10px] font-bold text-red-600 bg-red-500/10 px-2 py-0.5 rounded-full">
            Rejected
          </span>
        </div>
        <div className="mt-2">
          <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            Rejected
          </h3>
          <p className="text-xl sm:text-2xl font-bold text-foreground mt-0.5">
            {rejected}
          </p>
        </div>
      </div>
    </div>
  );
}
