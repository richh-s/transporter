"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useTranslation } from "react-i18next";

export function DriverFilters() {
  const { t } = useTranslation(["drivers"]);
  return (
    <div className="flex items-center gap-4">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder={t("drivers:labels.search_placeholder")} className="pl-9" />
      </div>
    </div>
  );
}
