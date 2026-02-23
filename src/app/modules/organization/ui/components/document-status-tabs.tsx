"use client";

import { cn } from "@/lib/utils";

const TABS = [
  { value: "all" as const, label: "All" },
  { value: "pending" as const, label: "Pending" },
  { value: "approved" as const, label: "Approved" },
  { value: "rejected" as const, label: "Rejected" },
];

interface DocumentStatusTabsProps {
  current: "pending" | "approved" | "rejected" | null;
  onSelect: (
    status: "pending" | "approved" | "rejected" | "all" | null,
  ) => void;
  className?: string;
}

export function DocumentStatusTabs({
  current,
  onSelect,
  className,
}: DocumentStatusTabsProps) {
  const getSelectedStyle = (tab: (typeof TABS)[number]) => {
    if (tab.value === "rejected")
      return "bg-red-500 text-white hover:bg-red-600";
    if (tab.value === "pending")
      return "bg-amber-500 text-white hover:bg-amber-600";
    if (tab.value === "approved")
      return "bg-green-600 text-white hover:bg-green-700";
    return "bg-green-600 text-white hover:bg-green-700"; // All
  };

  return (
    <div className={cn("grid grid-cols-4 gap-1.5 w-full", className)}>
      {TABS.map((tab) => {
        const isSelected =
          tab.value === "all" ? !current : current === tab.value;
        return (
          <button
            key={tab.value}
            type="button"
            onClick={() => onSelect(tab.value === "all" ? null : tab.value)}
            className={cn(
              "rounded-lg px-3 py-2.5 text-xs font-medium transition-colors w-full min-w-0",
              isSelected
                ? getSelectedStyle(tab)
                : "border border-border bg-background text-muted-foreground hover:bg-muted/50",
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
