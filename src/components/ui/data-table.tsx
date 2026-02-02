"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type Row,
  type Column,
} from "@tanstack/react-table";
import {
  ChevronDown,
  ChevronsUpDown,
  ChevronRight,
  ChevronLeft,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchKey?: string;
  searchPlaceholder?: string;
  meta?: Record<string, unknown>;
  // Server-side pagination
  pageCount?: number;
  page?: number;
  onPageChange?: (page: number) => void;
  onPageCountChange?: (pageCount: number) => void;
  total?: number;
  perPage?: number;
  onPerPageChange?: (perPage: number) => void;
  // Server-side filtering
  onSearchChange?: (search: string) => void;
  onSearchFocus?: (isFocused: boolean) => void;
  manualPagination?: boolean;
  manualFiltering?: boolean;
  // Filter controls
  filterControls?: React.ReactNode;
  // Header actions (e.g., Add button)
  headerActions?: React.ReactNode;
  // Scroll change callback (for mobile card view)
  onScrollChange?: (isScrolled: boolean) => void;
  // Scroll state (to conditionally show mobile add button)
  isScrolled?: boolean;
  // Mobile add button (shown in filter area when scrolled)
  mobileAddButton?: React.ReactNode;
  // Loading state
  isLoading?: boolean;
  // Row click handler
  onRowClick?: (row: TData) => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
  searchPlaceholder = "Search...",
  meta,
  pageCount,
  page = 1,
  onPageChange,
  onPageCountChange,
  total,
  perPage = 20,
  onPerPageChange,
  onSearchChange,
  onSearchFocus,
  manualPagination = false,
  manualFiltering = false,
  filterControls,
  headerActions,
  onScrollChange,
  mobileAddButton,
  isLoading = false,
  onRowClick,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [isPerPageOpen, setIsPerPageOpen] = React.useState(false);
  const [isColumnsOpen, setIsColumnsOpen] = React.useState(false);
  const mobileScrollRef = React.useRef<HTMLDivElement>(null);

  // Debounce search to prevent excessive API calls
  const searchTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // Handle search change for server-side filtering with debouncing
  const handleSearchChange = (value: string) => {
    // Update local state immediately for responsive UI
    setGlobalFilter(value);

    // Debounce the API call
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      if (onSearchChange) {
        onSearchChange(value);
      }
    }, 500); // 500ms debounce delay
  };

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Debounce scroll handler to prevent flickering
  const scrollTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // Handle scroll for mobile card view with debouncing
  const handleScroll = React.useCallback(() => {
    if (mobileScrollRef.current && onScrollChange) {
      // Clear existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      // Debounce the scroll check
      scrollTimeoutRef.current = setTimeout(() => {
        if (mobileScrollRef.current) {
          const scrollTop = mobileScrollRef.current.scrollTop;
          const scrollHeight = mobileScrollRef.current.scrollHeight;
          const clientHeight = mobileScrollRef.current.clientHeight;

          // Check if content is scrollable and if we've scrolled enough
          const isScrollable = scrollHeight > clientHeight;
          // Use a reasonable threshold that works for single cards but prevents flickering
          const isScrolled = isScrollable && scrollTop > 20;

          onScrollChange(isScrolled);
        }
      }, 50); // 50ms debounce
    }
  }, [onScrollChange]);

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  // Check scroll position on mount and when data changes
  React.useEffect(() => {
    if (mobileScrollRef.current && onScrollChange) {
      // Check after a delay to allow layout to settle
      const timeout = setTimeout(() => {
        if (mobileScrollRef.current) {
          const scrollTop = mobileScrollRef.current.scrollTop;
          const scrollHeight = mobileScrollRef.current.scrollHeight;
          const clientHeight = mobileScrollRef.current.clientHeight;

          const isScrollable = scrollHeight > clientHeight;
          const isScrolled = isScrollable && scrollTop > 20;

          onScrollChange(isScrolled);
        }
      }, 200);

      return () => clearTimeout(timeout);
    }
  }, [data, onScrollChange]);

  // Mobile Card View Component - Renders table rows as cards on mobile screens
  const MobileCardView = ({ row }: { row: Row<TData> }) => {
    const visibleCells = row.getVisibleCells().filter((cell) => {
      // Always show plate_number and actions, filter others based on visibility
      if (cell.column.id === "actions" || cell.column.id === "plate_number")
        return true;
      if (cell.column.columnDef.enableHiding === false) return true;
      return columnVisibility[cell.column.id] !== false;
    });

    // Find plate_number cell for header
    const plateCell = visibleCells.find(
      (cell) =>
        cell.column.id === "plate_number" ||
        (cell.column.columnDef as { accessorKey?: string }).accessorKey ===
        "plate_number"
    );

    // Find actions cell
    const actionsCell = visibleCells.find(
      (cell) => cell.column.id === "actions"
    );

    // Other cells for body
    const bodyCells = visibleCells.filter(
      (cell) =>
        cell.column.id !== "plate_number" &&
        cell.column.id !== "actions" &&
        (cell.column.columnDef as { accessorKey?: string }).accessorKey !==
        "plate_number"
    );

    // Get header label for a column
    const getHeaderLabel = (column: Column<TData, unknown>) => {
      const labelMap: Record<string, string> = {
        plate_number: "Plate / VIN",
        truck_type: "Type",
        make: "Make / Model",
        capacity_quintal: "Capacity",
        status: "Status",
      };

      if (column.id && labelMap[column.id]) {
        return labelMap[column.id];
      }

      if (typeof column.columnDef.header === "string") {
        return column.columnDef.header;
      }

      return (
        column.id
          ?.replace(/_/g, " ")
          .replace(/\b\w/g, (l: string) => l.toUpperCase()) || ""
      );
    };

    return (
      <div
        onClick={() => onRowClick?.(row.original)}
        className={cn(
          "bg-white dark:bg-card/40 border border-primary/5 rounded-2xl p-4 space-y-3 shadow-sm hover:shadow-md transition-all duration-300 h-full flex flex-col group relative overflow-hidden",
          onRowClick && "cursor-pointer"
        )}
      >
        {/* Brand Tint Overlay */}
        <div className="absolute inset-0 bg-primary/[0.03] dark:bg-primary/[0.05] pointer-events-none" />

        {/* Card Header - Primary Info (Plate Number) */}
        <div className="flex items-start justify-between pb-2 border-b border-border/50">
          <div className="flex-1 min-w-0 pr-2">
            {plateCell &&
              flexRender(
                plateCell.column.columnDef.cell,
                plateCell.getContext()
              )}
          </div>
          {/* Actions Button */}
          {actionsCell && (
            <div className="flex-shrink-0 -mr-1 -mt-1" onClick={(e) => e.stopPropagation()}>
              {flexRender(
                actionsCell.column.columnDef.cell,
                actionsCell.getContext()
              )}
            </div>
          )}
        </div>

        {/* Card Body - Compact Label-Value Pairs */}
        <div className="flex-1 space-y-2">
          {bodyCells.map((cell) => {
            const headerLabel = getHeaderLabel(cell.column);
            const cellValue = flexRender(
              cell.column.columnDef.cell,
              cell.getContext()
            );

            return (
              <div key={cell.id} className="flex flex-col space-y-0.5">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide leading-tight">
                  {headerLabel}
                </span>
                <div className="text-xs font-medium text-foreground break-words leading-tight">
                  {cellValue}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: manualPagination
      ? undefined
      : getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: manualFiltering ? undefined : getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: handleSearchChange,
    globalFilterFn: "includesString",
    manualPagination,
    manualFiltering,
    pageCount: pageCount,
    meta,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
      pagination: {
        pageIndex: page - 1,
        pageSize: perPage,
      },
    },
  });

  // Get visible rows for mobile (after table is created)
  // Show all rows from current page (server fetches 10 per page)
  const allRows = table.getRowModel().rows;
  const visibleRows = allRows; // Show all fetched cards

  // Calculate page count for client-side pagination
  const calculatedPageCount = manualPagination
    ? pageCount
    : Math.ceil(data.length / perPage);

  // Notify parent of page count changes
  React.useEffect(() => {
    if (onPageCountChange && !manualPagination) {
      onPageCountChange(calculatedPageCount ?? 0);
    } else if (onPageCountChange && manualPagination && pageCount !== undefined) {
      onPageCountChange(pageCount);
    }
  }, [calculatedPageCount, pageCount, manualPagination, onPageCountChange]);

  const hasMore = pageCount ? page < pageCount : calculatedPageCount ? page < calculatedPageCount : false;

  // Handle "See More" click - fetch next page from server
  const handleSeeMore = () => {
    if (hasMore && onPageChange && pageCount && page < pageCount) {
      onPageChange(page + 1);
      // Scroll to top when new page loads
      setTimeout(() => {
        if (mobileScrollRef.current) {
          mobileScrollRef.current.scrollTop = 0;
        }
      }, 100);
    }
  };

  // Handle "See Previous" click - fetch previous page from server
  const handleSeePrevious = () => {
    if (onPageChange && page > 1) {
      onPageChange(page - 1);
      // Scroll to top when new page loads
      setTimeout(() => {
        if (mobileScrollRef.current) {
          mobileScrollRef.current.scrollTop = 0;
        }
      }, 100);
    }
  };

  return (
    <div className="w-full h-full flex flex-col space-y-3 sm:space-y-3 overflow-hidden">
      {/* Search and Filters - Fixed, no scroll */}
      <div className="space-y-3 shrink-0 overflow-x-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex flex-col md:flex-row flex-1 items-stretch md:items-center gap-2 w-full sm:w-auto">
            {searchKey && (
              <Input
                placeholder={searchPlaceholder}
                value={globalFilter ?? ""}
                onChange={(event) => handleSearchChange(event.target.value)}
                onFocus={() => onSearchFocus?.(true)}
                onBlur={() => onSearchFocus?.(false)}
                className="flex-1 md:max-w-sm h-9 text-xs sm:text-sm focus-visible:ring-0 focus-visible:ring-offset-0 py-2"
              />
            )}
            <div className="flex flex-1 md:flex-initial items-center gap-2">
              {filterControls}
              {/* Mobile Add Button - Always visible on mobile */}
              {mobileAddButton && (
                <div className="md:hidden flex-1">{mobileAddButton}</div>
              )}
            </div>
          </div>
          {headerActions && (
            <div className="w-full sm:w-auto">{headerActions}</div>
          )}
        </div>
      </div>

      {/* Mobile Card View - Only visible on mobile screens (< 768px) - 2 Column Grid - Scrollable */}
      <div
        ref={mobileScrollRef}
        onScroll={handleScroll}
        className="md:hidden w-full flex-1 min-h-0 overflow-y-auto overflow-x-hidden"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        <div className="grid grid-cols-2 gap-2 p-1 pb-2">
          {isLoading ? (
            <div className="col-span-2 flex items-center justify-center py-8">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="text-sm">Loading...</span>
              </div>
            </div>
          ) : visibleRows.length ? (
            <>
              {visibleRows.map((row) => (
                <MobileCardView key={row.id} row={row} />
              ))}

              {/* Pagination Buttons - After cards */}
              {(page > 1 || hasMore) && (
                <div className="col-span-2 mt-3 mb-2 flex items-center justify-center gap-3 sticky bottom-4 py-2 z-10">
                  {/* Previous Button */}
                  <Button
                    onClick={handleSeePrevious}
                    variant="outline"
                    disabled={page <= 1}
                    className="h-10 w-10 p-0 bg-background/80 backdrop-blur-md shadow-lg border-border hover:bg-primary/5 hover:text-primary transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shrink-0 rounded-xl"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  {/* Page Indicator */}
                  <div className="flex items-center gap-1.5 px-4 py-2 bg-background/80 dark:bg-card/80 backdrop-blur-md shadow-lg border border-border/50 rounded-xl shrink-0">
                    <span className="text-sm font-bold text-foreground">
                      {page}
                    </span>
                    <span className="text-xs text-muted-foreground/60 font-medium italic">of</span>
                    <span className="text-sm font-bold text-muted-foreground">
                      {pageCount || 1}
                    </span>
                  </div>

                  {/* Next Button */}
                  <Button
                    onClick={handleSeeMore}
                    variant="outline"
                    disabled={!hasMore}
                    className="h-10 w-10 p-0 bg-background/80 dark:bg-card/80 backdrop-blur-md shadow-lg border-primary/20 dark:border-primary/40 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed shrink-0 rounded-xl"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="col-span-2 bg-card border rounded-lg p-8 text-center text-muted-foreground">
              No results.
            </div>
          )}
        </div>
      </div>

      {/* Table View - Hidden on mobile, visible on tablet and desktop (>= 768px) */}
      <div className="hidden md:flex bg-card/50 dark:bg-card/30 backdrop-blur-sm rounded-2xl border border-border/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(75,169,77,0.05)] w-full flex-col h-[200px] sm:h-[450px] overflow-hidden transition-all duration-500 hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)] dark:hover:shadow-[0_8px_40px_rgba(75,169,77,0.1)]">
        {/* Table Container - Single scrollable container for header and body */}
        <div className="flex-1 min-h-0 overflow-x-auto overflow-y-auto">
          <div className="min-w-full">
            <Table className="min-w-full w-full">
              <TableHeader className="bg-muted/30 sticky top-0 z-20">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} className="border-b border-border/40 hover:bg-transparent">
                    {headerGroup.headers.map((header, index) => {
                      const isSticky = (
                        header.column.columnDef.meta as { sticky?: boolean }
                      )?.sticky;
                      return (
                        <TableHead
                          key={header.id}
                          className={cn(
                            "bg-transparent h-12",
                            isSticky &&
                            "sticky left-0 z-30 bg-muted/80 backdrop-blur-md border-r",
                            index === 0
                              ? "pl-4 pr-2"
                              : "px-2",
                            "align-middle"
                          )}
                        >
                          <div className="flex items-center h-full">
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                          </div>
                        </TableHead>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  [...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      {columns.map((column, j) => (
                        <TableCell key={j}>
                          <Skeleton className="h-6 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                      onClick={() => onRowClick?.(row.original)}
                      className={cn(
                        "group border-b border-border/30 last:border-0 transition-all duration-300",
                        onRowClick && "cursor-pointer hover:bg-primary/[0.02] hover:shadow-[inset_4px_0_0_0_var(--primary)]"
                      )}
                    >
                      {row.getVisibleCells().map((cell) => {
                        const isSticky = (
                          cell.column.columnDef.meta as { sticky?: boolean }
                        )?.sticky;
                        return (
                          <TableCell
                            key={cell.id}
                            className={cn(
                              isSticky &&
                              "sticky left-0 z-10 bg-background border-r",
                              "align-middle"
                            )}
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Pagination - Hidden on mobile, visible on tablet and above */}
      <div className="hidden sm:flex flex-col md:flex-row items-center justify-between gap-1.5 sm:gap-2 flex-shrink-0 mt-2 sm:mt-0">
        <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
          <div className="text-muted-foreground hidden sm:block">
            {total !== undefined
              ? `Showing ${(page - 1) * perPage + 1} to ${Math.min(
                page * perPage,
                total
              )} of ${total}`
              : `${table.getFilteredRowModel().rows.length} total`}
          </div>
          {onPerPageChange && (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                Per page:
              </span>
              <Popover open={isPerPageOpen} onOpenChange={setIsPerPageOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="h-8 w-[70px] sm:w-[80px] justify-between text-xs sm:text-sm"
                  >
                    {perPage}
                    <ChevronsUpDown className="ml-1.5 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="p-0 w-[70px] sm:w-[80px]"
                  align="start"
                  sideOffset={4}
                >
                  <Command>
                    <CommandList>
                      <CommandGroup>
                        {[10, 20, 50, 100].map((value) => (
                          <CommandItem
                            key={value}
                            value={String(value)}
                            onSelect={() => {
                              onPerPageChange(value);
                              if (onPageChange) {
                                onPageChange(1); // Reset to first page when changing per page
                              }
                              setIsPerPageOpen(false);
                            }}
                            className={cn(
                              perPage === value && "bg-amber-100 text-amber-700"
                            )}
                          >
                            {value}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          )}
          <DropdownMenu open={isColumnsOpen} onOpenChange={setIsColumnsOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="h-8 sm:h-9 text-xs sm:text-sm"
              >
                Columns <ChevronDown className="ml-2 h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px] sm:w-auto">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize text-xs sm:text-sm"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) => {
                        column.toggleVisibility(!!value);
                        setIsColumnsOpen(false);
                      }}
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          {manualPagination && onPageChange ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(page - 1)}
                disabled={page <= 1}
                className="h-8 sm:h-9 text-xs sm:text-sm px-2 sm:px-4"
              >
                <span className="hidden sm:inline">Previous</span>
                <span className="sm:hidden">Prev</span>
              </Button>
              <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap px-1">
                {page}/{pageCount || 1}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(page + 1)}
                disabled={pageCount ? page >= pageCount : false}
                className="h-8 sm:h-9 text-xs sm:text-sm px-2 sm:px-4"
              >
                Next
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="h-8 sm:h-9 text-xs sm:text-sm px-2 sm:px-4"
              >
                <span className="hidden sm:inline">Previous</span>
                <span className="sm:hidden">Prev</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="h-8 sm:h-9 text-xs sm:text-sm px-2 sm:px-4"
              >
                Next
              </Button>
            </>
          )}
        </div>
      </div>
    </div >
  );
}
