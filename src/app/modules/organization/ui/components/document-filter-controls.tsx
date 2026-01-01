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

const DOCUMENT_TYPES = [
  { value: "trade_licence", label: "Trade Licence" },
  { value: "id", label: "ID" },
  { value: "other", label: "Other" },
] as const;

const DOCUMENT_STATUSES = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
] as const;

const ENTITY_TYPES = [
  { value: "truck", label: "Truck" },
  { value: "driver", label: "Driver" },
] as const;

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
  const [isStatusFilterOpen, setIsStatusFilterOpen] = useState(false);
  const [isDocumentTypeFilterOpen, setIsDocumentTypeFilterOpen] = useState(false);
  const [isEntityTypeFilterOpen, setIsEntityTypeFilterOpen] = useState(false);

  return (
    <>
      <Popover open={isStatusFilterOpen} onOpenChange={setIsStatusFilterOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="h-9 text-xs sm:text-sm">
            <span className="hidden sm:inline">Status: </span>
            {filters.status
              ? DOCUMENT_STATUSES.find((s) => s.value === filters.status)?.label
              : "All"}
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
                  All
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
            <span className="hidden sm:inline">Document Type: </span>
            {filters.document_type
              ? DOCUMENT_TYPES.find((t) => t.value === filters.document_type)
                  ?.label
              : "All"}
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
                  All
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
            <span className="hidden sm:inline">Entity Type: </span>
            {filters.entity_type
              ? ENTITY_TYPES.find((t) => t.value === filters.entity_type)?.label
              : "All"}
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
                  All
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
          Clear
        </Button>
      )}
    </>
  );
}

