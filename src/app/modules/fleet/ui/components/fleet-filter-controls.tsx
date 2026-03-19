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

const TRUCK_TYPES = [
  { value: "flatbed", label: "Flatbed" },
  { value: "trailer", label: "Trailer" },
] as const;

const TRUCK_STATUSES = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "maintenance", label: "Maintenance" },
  { value: "out_of_service", label: "Out of Service" },
] as const;

interface FleetFilterControlsProps {
  filters: {
    status?: "active" | "inactive" | "maintenance" | "out_of_service" | null;
    truck_type?: "flatbed" | "trailer" | null;
  };
  onStatusFilter: (
    status:
      | "active"
      | "inactive"
      | "maintenance"
      | "out_of_service"
      | "all"
      | null
  ) => void;
  onTypeFilter: (type: "flatbed" | "trailer" | "all" | null) => void;
  onClearFilters: () => void;
}

import { useTranslation } from "react-i18next";

export function FleetFilterControls({
  filters,
  onStatusFilter,
  onTypeFilter,
  onClearFilters,
}: FleetFilterControlsProps) {
  const { t } = useTranslation(["fleet", "common"]);
  const [isStatusFilterOpen, setIsStatusFilterOpen] = useState(false);
  const [isTypeFilterOpen, setIsTypeFilterOpen] = useState(false);

  // Use keys for translation
  const statusLabel = filters.status
    ? t(`fleet:status.${filters.status.toLowerCase()}`)
    : t("common:labels.all");

  const typeLabel = filters.truck_type
    ? t(`fleet:types.${filters.truck_type.toLowerCase()}`)
    : t("common:labels.all");

  return (
    <>
      <Popover open={isStatusFilterOpen} onOpenChange={setIsStatusFilterOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="h-9 text-xs sm:text-sm">
            {t("fleet:fields.status")}: {statusLabel}
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
                  {t("common:labels.all")}
                </CommandItem>
                {TRUCK_STATUSES.map((status) => (
                  <CommandItem
                    key={status.value}
                    onSelect={() => {
                      onStatusFilter(status.value as any);
                      setIsStatusFilterOpen(false);
                    }}
                    className={cn(
                      status.value === filters.status &&
                        "bg-amber-100 text-amber-700 font-medium"
                    )}
                  >
                    {t(`fleet:status.${status.value.toLowerCase()}`)}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <Popover open={isTypeFilterOpen} onOpenChange={setIsTypeFilterOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="h-9 text-xs sm:text-sm">
            {t("fleet:fields.truck_type")}: {typeLabel}
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
                    onTypeFilter("all");
                    setIsTypeFilterOpen(false);
                  }}
                  className={cn(
                    !filters.truck_type &&
                      "bg-amber-100 text-amber-700 font-medium"
                  )}
                >
                  {t("common:labels.all")}
                </CommandItem>
                {TRUCK_TYPES.map((type) => (
                  <CommandItem
                    key={type.value}
                    onSelect={() => {
                      onTypeFilter(type.value as any);
                      setIsTypeFilterOpen(false);
                    }}
                    className={cn(
                      type.value === filters.truck_type &&
                        "bg-amber-100 text-amber-700 font-medium"
                    )}
                  >
                    {t(`fleet:types.${type.value.toLowerCase()}`)}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {(filters.status || filters.truck_type) && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearFilters}
          className="h-9 text-xs sm:text-sm"
        >
          {t("common:buttons.clear_filters")}
        </Button>
      )}
    </>
  );
}
