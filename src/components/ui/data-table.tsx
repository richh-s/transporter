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
} from "@tanstack/react-table";
import { ChevronDown, ChevronsUpDown } from "lucide-react";

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

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchKey?: string;
  searchPlaceholder?: string;
  meta?: Record<string, any>;
  // Server-side pagination
  pageCount?: number;
  page?: number;
  onPageChange?: (page: number) => void;
  total?: number;
  perPage?: number;
  onPerPageChange?: (perPage: number) => void;
  // Server-side filtering
  onSearchChange?: (search: string) => void;
  manualPagination?: boolean;
  manualFiltering?: boolean;
  // Filter controls
  filterControls?: React.ReactNode;
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
  total,
  perPage = 20,
  onPerPageChange,
  onSearchChange,
  manualPagination = false,
  manualFiltering = false,
  filterControls,
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

  // Handle search change for server-side filtering
  const handleSearchChange = (value: string) => {
    setGlobalFilter(value);
    if (onSearchChange) {
      onSearchChange(value);
    }
  };

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: manualPagination ? undefined : getPaginationRowModel(),
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

  return (
    <div className="w-full h-full flex flex-col space-y-3 sm:space-y-4 overflow-hidden">
      {/* Search and Filters - Fixed, no scroll */}
      <div className="space-y-3 flex-shrink-0 overflow-x-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex flex-1 flex-wrap items-center gap-2 w-full sm:w-auto">
            {searchKey && (
              <Input
                placeholder={searchPlaceholder}
                value={globalFilter ?? ""}
                onChange={(event) => handleSearchChange(event.target.value)}
                className="max-w-sm h-9 text-xs sm:text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            )}
            {filterControls}
          </div>
        </div>
      </div>

      {/* Table - Only this section scrolls horizontally and vertically */}
      <div 
        className="rounded-md border overflow-x-auto overflow-y-auto w-full scrollbar-hide flex-1 min-h-0" 
        style={{ 
          maxHeight: 'calc(100vh - 300px)'
        }}
      >
        <div className="min-w-full">
          <Table className="min-w-full w-full">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header, index) => {
                  const isSticky = header.column.columnDef.meta?.sticky;
                  return (
                    <TableHead 
                      key={header.id}
                      className={cn(
                        isSticky && "sticky left-0 z-10 bg-background border-r",
                        "px-1 sm:px-2"
                      )}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => {
                    const isSticky = cell.column.columnDef.meta?.sticky;
                    return (
                      <TableCell 
                        key={cell.id}
                        className={cn(
                          isSticky && "sticky left-0 z-10 bg-background border-r"
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

      {/* Pagination - Fixed, no scroll */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 flex-shrink-0 pb-2 sm:pb-4">
        <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
          <div className="text-muted-foreground hidden sm:block">
            {total !== undefined
              ? `Showing ${(page - 1) * perPage + 1} to ${Math.min(page * perPage, total)} of ${total}`
              : `${table.getFilteredRowModel().rows.length} total`}
          </div>
          {onPerPageChange && (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">Per page:</span>
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
                <PopoverContent className="p-0 w-[70px] sm:w-[80px]" align="start" sideOffset={4}>
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-8 sm:h-9 text-xs sm:text-sm">
                Columns <ChevronDown className="ml-2 h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize text-xs sm:text-sm"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
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
    </div>
  );
}

