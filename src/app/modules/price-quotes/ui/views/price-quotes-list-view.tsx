"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Plus,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Filter,
  MapPin,
  Truck,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { DataTable } from "@/components/ui/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  priceQuoteColumns,
  type PriceQuoteTableRow,
} from "../columns/price-quote-columns";
import { PriceQuoteCard } from "../components/price-quote-card";
import type { PriceQuoteFilters, PriceQuote } from "@/types/price-quote";
import {
  LocationEnum,
  TruckTypeEnum,
  PriceQuoteStatusEnum,
} from "@/types/price-quote";
import { LOCATION_OPTIONS } from "@/lib/price-quote-utils";
import {
  usePriceQuotes,
  useDeletePriceQuote,
  useUpdatePriceQuote,
} from "@/app/modules/price-quotes/server/hooks";
import { DeleteQuoteDialog } from "@/app/modules/price-quotes/ui/components";
import { cn } from "@/lib/utils";

// Stats Card Component
function StatsCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  value: number | string;
  accent: string;
}) {
  return (
    <div className="flex items-center gap-3 p-3 sm:p-4 rounded-xl bg-card border border-border/50 shadow-sm h-full">
      <div className={cn("p-2 rounded-lg", accent)}>
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-lg font-bold text-foreground">{value}</p>
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
          {label}
        </p>
      </div>
    </div>
  );
}

// Table loading skeleton (same as ships/fleet/drivers/gps-devices)
function TableLoadingSkeleton() {
  const rows = 8;
  const cols = 6;
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="p-4 border-b border-border flex items-center justify-between gap-4">
        <Skeleton className="h-9 w-48 sm:w-64" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-9" />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              {[...Array(cols)].map((_, i) => (
                <th key={i} className="px-4 py-3 text-left">
                  <Skeleton className="h-4 w-16 sm:w-24" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {[...Array(rows)].map((_, rowIdx) => (
              <tr key={rowIdx}>
                {[...Array(cols)].map((_, colIdx) => (
                  <td key={colIdx} className="px-4 py-3">
                    <Skeleton
                      className={cn(
                        "h-4",
                        colIdx === 0 ? "w-20 sm:w-28" : "w-16 sm:w-24",
                      )}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function PriceQuotesListView() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [quoteToDelete, setQuoteToDelete] = useState<PriceQuote | null>(null);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);

  // Filters
  const [filters, setFilters] = useState<PriceQuoteFilters>({
    origin: undefined,
    destination: undefined,
    truck_type: undefined,
    container_size: undefined,
    status: undefined,
    currency: undefined,
  });
  const [appliedFilters, setAppliedFilters] = useState<PriceQuoteFilters>({});

  const { data: quotesResponse, isLoading } = usePriceQuotes(
    page,
    perPage,
    appliedFilters,
  );

  const deleteMutation = useDeletePriceQuote();
  const updateMutation = useUpdatePriceQuote();

  const quotes = quotesResponse?.items || [];
  const total = quotesResponse?.total || 0;
  const pages = quotesResponse?.pages || 0;

  // Calculate stats (Note: these are for the current page only if using server-side pagination)
  const activeCount = quotes.filter(
    (q) => q.status === PriceQuoteStatusEnum.ACTIVE,
  ).length;
  const draftCount = quotes.filter(
    (q) => q.status === PriceQuoteStatusEnum.DRAFT,
  ).length;
  const inactiveCount = quotes.filter(
    (q) => q.status === PriceQuoteStatusEnum.INACTIVE,
  ).length;

  const handleApplyFilters = () => {
    setAppliedFilters(filters);
    setPage(1);
    setFilterSheetOpen(false);
  };

  const handleClearFilters = () => {
    const emptyFilters: PriceQuoteFilters = {
      origin: undefined,
      destination: undefined,
      truck_type: undefined,
      container_size: undefined,
      status: undefined,
      currency: undefined,
    };
    setFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
    setPage(1);
  };

  const handleDeleteClick = (quote: PriceQuote) => {
    setQuoteToDelete(quote);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (quoteToDelete) {
      deleteMutation.mutate(quoteToDelete.id, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setQuoteToDelete(null);
          toast.success("Price quote deleted successfully");
        },
      });
    }
  };

  const handleStatusChange = (
    quoteId: number,
    newStatus: PriceQuoteStatusEnum,
  ) => {
    updateMutation.mutate({ id: quoteId, data: { status: newStatus } });
  };

  const hasActiveFilters = Object.values(appliedFilters).some(
    (v) => v !== undefined,
  );

  return (
    <div className="flex flex-col h-full space-y-4 sm:space-y-6 animate-in fade-in duration-300 pb-10 sm:pb-6 w-full overflow-x-hidden">
      {/* Header - same as ships/fleet/drivers/gps-devices */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 shrink-0 px-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Price Quotes
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Manage biweekly price quotes
          </p>
        </div>
        <Button
          onClick={() => router.push("/price-quotes/create")}
          size="sm"
          className="rounded-xl h-9 gap-1.5 shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Create Quote</span>
          <span className="sm:hidden">New</span>
        </Button>
      </div>

      {/* Stats - scrollable on mobile, equal gap */}
      <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 sm:overflow-visible shrink-0">
        <div className="flex sm:grid sm:grid-cols-4 gap-3 sm:gap-4 min-w-0 sm:min-w-full pr-4 sm:pr-0">
          <div className="shrink-0 w-[72%] min-w-[160px] sm:w-auto sm:min-w-0">
            <StatsCard
              icon={FileText}
              label="Total"
              value={total}
              accent="bg-primary/10 text-primary"
            />
          </div>
          <div className="shrink-0 w-[72%] min-w-[160px] sm:w-auto sm:min-w-0">
            <StatsCard
              icon={CheckCircle}
              label="Active"
              value={activeCount}
              accent="bg-primary/10 text-primary"
            />
          </div>
          <div className="shrink-0 w-[72%] min-w-[160px] sm:w-auto sm:min-w-0">
            <StatsCard
              icon={Clock}
              label="Draft"
              value={draftCount}
              accent="bg-amber-500/10 text-amber-600"
            />
          </div>
          <div className="shrink-0 w-[72%] min-w-[160px] sm:w-auto sm:min-w-0">
            <StatsCard
              icon={XCircle}
              label="Inactive"
              value={inactiveCount}
              accent="bg-gray-500/10 text-gray-600"
            />
          </div>
        </div>
      </div>

      {/* Table - desktop same as others; mobile = cards via renderMobileCard */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {isLoading ? (
          <TableLoadingSkeleton />
        ) : (
          <DataTable
            columns={priceQuoteColumns}
            data={quotes as PriceQuoteTableRow[]}
            onRowClick={(quote) =>
              router.push(`/price-quotes/placeholder?id=${quote.id}`)
            }
            meta={{
              onEdit: (quote: PriceQuote) =>
                router.push(`/price-quotes/placeholder/edit?id=${quote.id}`),
              onDelete: (quote: PriceQuote) => handleDeleteClick(quote),
              onStatusChange: handleStatusChange,
            }}
            manualPagination
            page={page}
            pageCount={pages}
            total={total}
            perPage={perPage}
            onPageChange={setPage}
            onPerPageChange={setPerPage}
            variant="clean"
            hideColumnVisibility
            renderMobileCard={(quote) => (
              <PriceQuoteCard
                quote={quote}
                onClick={() =>
                  router.push(`/price-quotes/placeholder?id=${quote.id}`)
                }
              />
            )}
            filterControls={
              <div className="flex items-center gap-2">
                <Sheet open={filterSheetOpen} onOpenChange={setFilterSheetOpen}>
                  <SheetTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className={cn(
                        "rounded-xl h-9 gap-2",
                        hasActiveFilters && "border-primary text-primary",
                      )}
                    >
                      <Filter className="h-4 w-4" />
                      Filters
                      {hasActiveFilters && (
                        <span className="h-5 w-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                          {
                            Object.values(appliedFilters).filter(
                              (v) => v !== undefined,
                            ).length
                          }
                        </span>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="bottom" className="rounded-t-3xl">
                    <SheetHeader className="pb-4">
                      <SheetTitle>Filter Quotes</SheetTitle>
                    </SheetHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                            <MapPin className="h-3 w-3" /> Origin
                          </label>
                          <Select
                            value={filters.origin || "all"}
                            onValueChange={(value) =>
                              setFilters({
                                ...filters,
                                origin:
                                  value === "all"
                                    ? undefined
                                    : (value as LocationEnum),
                              })
                            }
                          >
                            <SelectTrigger className="h-10 rounded-xl">
                              <SelectValue placeholder="All" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                              <SelectItem value="all">All Origins</SelectItem>
                              {LOCATION_OPTIONS.map((loc) => (
                                <SelectItem key={loc.value} value={loc.value}>
                                  {loc.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                            <MapPin className="h-3 w-3" /> Destination
                          </label>
                          <Select
                            value={filters.destination || "all"}
                            onValueChange={(value) =>
                              setFilters({
                                ...filters,
                                destination:
                                  value === "all"
                                    ? undefined
                                    : (value as LocationEnum),
                              })
                            }
                          >
                            <SelectTrigger className="h-10 rounded-xl">
                              <SelectValue placeholder="All" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                              <SelectItem value="all">
                                All Destinations
                              </SelectItem>
                              {LOCATION_OPTIONS.map((loc) => (
                                <SelectItem key={loc.value} value={loc.value}>
                                  {loc.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                            <Truck className="h-3 w-3" /> Truck Type
                          </label>
                          <Select
                            value={filters.truck_type || "all"}
                            onValueChange={(value) =>
                              setFilters({
                                ...filters,
                                truck_type:
                                  value === "all"
                                    ? undefined
                                    : (value as TruckTypeEnum),
                              })
                            }
                          >
                            <SelectTrigger className="h-10 rounded-xl">
                              <SelectValue placeholder="All" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                              <SelectItem value="all">All Types</SelectItem>
                              <SelectItem value={TruckTypeEnum.FLATBED}>
                                Flatbed
                              </SelectItem>
                              <SelectItem value={TruckTypeEnum.TRAILER}>
                                Trailer
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                            <DollarSign className="h-3 w-3" /> Status
                          </label>
                          <Select
                            value={filters.status || "all"}
                            onValueChange={(value) =>
                              setFilters({
                                ...filters,
                                status:
                                  value === "all"
                                    ? undefined
                                    : (value as PriceQuoteStatusEnum),
                              })
                            }
                          >
                            <SelectTrigger className="h-10 rounded-xl">
                              <SelectValue placeholder="All" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                              <SelectItem value="all">All Status</SelectItem>
                              <SelectItem value={PriceQuoteStatusEnum.DRAFT}>
                                Draft
                              </SelectItem>
                              <SelectItem value={PriceQuoteStatusEnum.ACTIVE}>
                                Active
                              </SelectItem>
                              <SelectItem value={PriceQuoteStatusEnum.INACTIVE}>
                                Inactive
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="flex gap-3 pt-2">
                        <Button
                          variant="outline"
                          onClick={handleClearFilters}
                          className="flex-1 rounded-xl"
                        >
                          Clear
                        </Button>
                        <Button
                          onClick={handleApplyFilters}
                          className="flex-1 rounded-xl"
                        >
                          Apply Filters
                        </Button>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>

                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearFilters}
                    className="text-xs text-muted-foreground"
                  >
                    Clear all
                  </Button>
                )}
              </div>
            }
          />
        )}
      </div>

      {/* Delete Dialog */}
      {quoteToDelete && (
        <DeleteQuoteDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          quote={quoteToDelete}
          onConfirm={handleDeleteConfirm}
          isDeleting={deleteMutation.isPending}
        />
      )}
    </div>
  );
}
