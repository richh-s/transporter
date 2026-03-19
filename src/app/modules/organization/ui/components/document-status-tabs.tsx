"use client";

import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

interface DocumentStatusTabsProps {
  current: string | null;
  onSelect: (status: "pending" | "approved" | "rejected" | "all" | null) => void;
  className?: string;
}

export function DocumentStatusTabs({
  current,
  onSelect,
  className,
}: DocumentStatusTabsProps) {
  const { t } = useTranslation(["organization"]);

  const tabs = [
    { id: "all", label: t("organization:tabs.all") },
    { id: "pending", label: t("organization:tabs.pending") },
    { id: "approved", label: t("organization:tabs.approved") },
    { id: "rejected", label: t("organization:tabs.rejected") },
  ] as const;

  return (
    <div
      className={cn(
        "flex flex-nowrap items-center gap-1 p-1 bg-muted/50 rounded-xl overflow-x-auto no-scrollbar",
        className,
      )}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === "all" ? current === null : current === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() =>
              onSelect(tab.id as "pending" | "approved" | "rejected" | "all" | null)
            }
            className={cn(
              "flex-1 min-w-[80px] px-3 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap",
              isActive
                ? "bg-background text-brand-primary shadow-sm ring-1 ring-border/50"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
