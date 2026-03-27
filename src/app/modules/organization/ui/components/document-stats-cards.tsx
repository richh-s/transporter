"use client";

import { FileText, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

interface DocumentStatsCardsProps {
  documents: { status?: string }[];
}

export function DocumentStatsCards({ documents }: DocumentStatsCardsProps) {
  const { t } = useTranslation(["organization"]);

  const stats = [
    {
      label: t("organization:stats.total_docs"),
      value: documents.length,
      icon: FileText,
      color: "text-blue-600",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
    },
    {
      label: t("organization:stats.pending_docs"),
      value: documents.filter((d) => (d.status || "").toLowerCase() === "pending").length,
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
    },
    {
      label: t("organization:stats.approved_docs"),
      value: documents.filter((d) => (d.status || "").toLowerCase() === "approved").length,
      icon: CheckCircle2,
      color: "text-emerald-600",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
    },
    {
      label: t("organization:stats.rejected_docs"),
      value: documents.filter((d) => {
        const s = (d.status || "").toLowerCase().replace(/_/g, "");
        return s === "rejected" || s === "inactive";
      }).length,
      icon: AlertCircle,
      color: "text-rose-600",
      bg: "bg-rose-500/10",
      border: "border-rose-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {stats.map((stat, i) => (
        <div
          key={i}
          className={cn(
            "p-3 sm:p-4 rounded-2xl bg-card border shadow-sm transition-all hover:shadow-md",
            stat.border,
          )}
        >
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className={cn("p-1.5 sm:p-2 rounded-xl", stat.bg)}>
              <stat.icon className={cn("h-4 w-4 sm:h-5 sm:w-5", stat.color)} />
            </div>
          </div>
          <div className="space-y-0.5 sm:space-y-1">
            <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">
              {stat.label}
            </p>
            <p className="text-xl sm:text-2xl font-bold tracking-tight text-brand-primary">
              {stat.value}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
