"use client";

import { useState } from "react";
import { ChevronsUpDownIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface DocumentFilterControlsProps {
  filters: {
    status?: "pending" | "approved" | "rejected" | null;
    document_type?: "trade_licence" | "id" | "other" | null;
    entity_type?: "truck" | "driver" | null;
  };
  onStatusFilter: (
    status: "pending" | "approved" | "rejected" | "all" | null
  ) => void;
  onDocumentTypeFilter: (
    type: "trade_licence" | "id" | "other" | "all" | null
  ) => void;
  onEntityTypeFilter: (type: "truck" | "driver" | "all" | null) => void;
  onClearFilters: () => void;
}

export function DocumentFilterControls({
  filters,
  onStatusFilter,
  onDocumentTypeFilter,
  onEntityTypeFilter,
  onClearFilters,
}: DocumentFilterControlsProps) {
  const { t } = useTranslation(["organization", "common"]);
  const [isStatusFilterOpen, setIsStatusFilterOpen] = useState(false);
  const [isDocumentTypeFilterOpen, setIsDocumentTypeFilterOpen] = useState(false);
  const [isEntityTypeFilterOpen, setIsEntityTypeFilterOpen] = useState(false);

  const DOCUMENT_TYPES = [
    { value: "trade_licence", label: t("organization:types.trade_licence") },
    { value: "id", label: t("organization:types.id") },
    { value: "other", label: t("organization:types.other") },
  ] as const;

  const DOCUMENT_STATUSES = [
    { value: "pending", label: t("organization:tabs.pending") },
    { value: "approved", label: t("organization:tabs.approved") },
    { value: "rejected", label: t("organization:tabs.rejected") },
  ] as const;

  const ENTITY_TYPES = [
    { value: "truck", label: t("organization:entities.truck") },
    { value: "driver", label: t("organization:entities.driver") },
  ] as const;

  return (
    <>
      <Popover open={isStatusFilterOpen} onOpenChange={setIsStatusFilterOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="h-9 text-xs sm:text-sm">
            <span className="hidden sm:inline">{t("organization:fields.status")}: </span>
            {filters.status
              ? DOCUMENT_STATUSES.find((s) => s.value === filters.status)?.label
              : t("organization:tabs.all")}
            <ChevronsUpDownIcon className="ml-2 h-3 w-3 sm:h-4 sm:w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="p-0"
          align="start"
          sideOffset={4}
          style={{
            width: "var(--radix-popover-trigger-width)",
          }}
        >
          <Command>
            <CommandList>
              <CommandGroup>
                <CommandItem
                  onSelect={() => {
                    onStatusFilter("all");
                    setIsStatusFilterOpen(false);
                  }}
                  className={cn(
                    !filters.status && "bg-amber-100 text-amber-700 font-medium"
                  )}
                >
                  {t("organization:tabs.all")}
                </CommandItem>
                {DOCUMENT_STATUSES.map((status) => (
                  <CommandItem
                    key={status.value}
                    onSelect={() => {
                      onStatusFilter(status.value);
                      setIsStatusFilterOpen(false);
                    }}
                    className={cn(
                      status.value === filters.status &&
                        "bg-amber-100 text-amber-700 font-medium"
                    )}
                  >
                    {status.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <Popover
        open={isDocumentTypeFilterOpen}
        onOpenChange={setIsDocumentTypeFilterOpen}
      >
        <PopoverTrigger asChild>
          <Button variant="outline" className="h-9 text-xs sm:text-sm">
            <span className="hidden sm:inline">{t("organization:fields.document_type")}: </span>
            {filters.document_type
              ? DOCUMENT_TYPES.find((t_item) => t_item.value === filters.document_type)
                  ?.label
              : t("organization:tabs.all")}
            <ChevronsUpDownIcon className="ml-2 h-3 w-3 sm:h-4 sm:w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="p-0"
          align="start"
          sideOffset={4}
          style={{
            width: "var(--radix-popover-trigger-width)",
          }}
        >
          <Command>
            <CommandList>
              <CommandGroup>
                <CommandItem
                  onSelect={() => {
                    onDocumentTypeFilter("all");
                    setIsDocumentTypeFilterOpen(false);
                  }}
                  className={cn(
                    !filters.document_type &&
                      "bg-amber-100 text-amber-700 font-medium"
                  )}
                >
                  {t("organization:tabs.all")}
                </CommandItem>
                {DOCUMENT_TYPES.map((type) => (
                  <CommandItem
                    key={type.value}
                    onSelect={() => {
                      onDocumentTypeFilter(type.value);
                      setIsDocumentTypeFilterOpen(false);
                    }}
                    className={cn(
                      type.value === filters.document_type &&
                        "bg-amber-100 text-amber-700 font-medium"
                    )}
                  >
                    {type.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <Popover
        open={isEntityTypeFilterOpen}
        onOpenChange={setIsEntityTypeFilterOpen}
      >
        <PopoverTrigger asChild>
          <Button variant="outline" className="h-9 text-xs sm:text-sm">
            <span className="hidden sm:inline">{t("organization:fields.entity_type")}: </span>
            {filters.entity_type
              ? ENTITY_TYPES.find((t_item) => t_item.value === filters.entity_type)?.label
              : t("organization:tabs.all")}
            <ChevronsUpDownIcon className="ml-2 h-3 w-3 sm:h-4 sm:w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="p-0"
          align="start"
          sideOffset={4}
          style={{
            width: "var(--radix-popover-trigger-width)",
          }}
        >
          <Command>
            <CommandList>
              <CommandGroup>
                <CommandItem
                  onSelect={() => {
                    onEntityTypeFilter("all");
                    setIsEntityTypeFilterOpen(false);
                  }}
                  className={cn(
                    !filters.entity_type &&
                      "bg-amber-100 text-amber-700 font-medium"
                  )}
                >
                  {t("organization:tabs.all")}
                </CommandItem>
                {ENTITY_TYPES.map((type) => (
                  <CommandItem
                    key={type.value}
                    onSelect={() => {
                      onEntityTypeFilter(type.value);
                      setIsEntityTypeFilterOpen(false);
                    }}
                    className={cn(
                      type.value === filters.entity_type &&
                        "bg-amber-100 text-amber-700 font-medium"
                    )}
                  >
                    {type.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {(filters.status || filters.document_type || filters.entity_type) && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearFilters}
          className="h-9 text-xs sm:text-sm"
        >
          {t("common:buttons.clear", { defaultValue: "Clear" })}
        </Button>
      )}
    </>
  );
}
