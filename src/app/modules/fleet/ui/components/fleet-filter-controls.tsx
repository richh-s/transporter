"use client";

import { useState } from "react";
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
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

export function FleetFilterControls({
  filters,
  onStatusFilter,
  onTypeFilter,
  onClearFilters,
}: FleetFilterControlsProps) {
  const [isStatusFilterOpen, setIsStatusFilterOpen] = useState(false);
  const [isTypeFilterOpen, setIsTypeFilterOpen] = useState(false);

  return (
    <>
      <Popover open={isStatusFilterOpen} onOpenChange={setIsStatusFilterOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="h-9 text-xs sm:text-sm">
            Status:{" "}
            {filters.status
              ? TRUCK_STATUSES.find((s) => s.value === filters.status)?.label
              : "All"}
            <ChevronsUpDownIcon className="ml-2 h-3 w-3 sm:h-4 sm:w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0" align="start" sideOffset={4}>
          <Command>
            <CommandInput placeholder="Search status..." />
            <CommandList>
              <CommandEmpty>No status found.</CommandEmpty>
              <CommandGroup>
                <CommandItem
                  onSelect={() => {
                    onStatusFilter("all");
                    setIsStatusFilterOpen(false);
                  }}
                >
                  <CheckIcon
                    className={cn(
                      "mr-2 h-4 w-4",
                      !filters.status ? "opacity-100" : "opacity-0"
                    )}
                  />
                  All
                </CommandItem>
                {TRUCK_STATUSES.map((status) => (
                  <CommandItem
                    key={status.value}
                    onSelect={() => {
                      onStatusFilter(status.value);
                      setIsStatusFilterOpen(false);
                    }}
                  >
                    <CheckIcon
                      className={cn(
                        "mr-2 h-4 w-4",
                        status.value === filters.status
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    {status.label}
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
            Type:{" "}
            {filters.truck_type
              ? TRUCK_TYPES.find((t) => t.value === filters.truck_type)?.label
              : "All"}
            <ChevronsUpDownIcon className="ml-2 h-3 w-3 sm:h-4 sm:w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0" align="start" sideOffset={4}>
          <Command>
            <CommandInput placeholder="Search type..." />
            <CommandList>
              <CommandEmpty>No type found.</CommandEmpty>
              <CommandGroup>
                <CommandItem
                  onSelect={() => {
                    onTypeFilter("all");
                    setIsTypeFilterOpen(false);
                  }}
                >
                  <CheckIcon
                    className={cn(
                      "mr-2 h-4 w-4",
                      !filters.truck_type ? "opacity-100" : "opacity-0"
                    )}
                  />
                  All
                </CommandItem>
                {TRUCK_TYPES.map((type) => (
                  <CommandItem
                    key={type.value}
                    onSelect={() => {
                      onTypeFilter(type.value);
                      setIsTypeFilterOpen(false);
                    }}
                  >
                    <CheckIcon
                      className={cn(
                        "mr-2 h-4 w-4",
                        type.value === filters.truck_type
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    {type.label}
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
          Clear Filters
        </Button>
      )}
    </>
  );
}
