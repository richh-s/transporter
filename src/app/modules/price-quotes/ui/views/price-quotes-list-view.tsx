"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  MoreHorizontal,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Filter,
  MapPin,
  Truck,
  Package,
  DollarSign,
  ChevronRight,
  Eye,
  Pencil,
  Trash2,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { PriceQuoteFilters, PriceQuote } from "@/types/price-quote";
import {
  LocationEnum,
  TruckTypeEnum,
  PriceQuoteStatusEnum,
} from "@/types/price-quote";
import {
  formatLocation,
  formatTruckType,
  formatContainerSize,
  LOCATION_OPTIONS,
} from "@/lib/price-quote-utils";
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
    <div className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/50 shadow-sm">
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

// Status Badge Component
function StatusBadge({ status }: { status: PriceQuoteStatusEnum }) {
  const config = {
    [PriceQuoteStatusEnum.ACTIVE]: {
      bg: "bg-emerald-500/10",
      text: "text-emerald-600",
      dot: "bg-emerald-500",
    },
    [PriceQuoteStatusEnum.DRAFT]: {
      bg: "bg-amber-500/10",
      text: "text-amber-600",
      dot: "bg-amber-500",
    },
    [PriceQuoteStatusEnum.INACTIVE]: {
      bg: "bg-gray-500/10",
      text: "text-gray-600",
      dot: "bg-gray-400",
    },
  }[status] || { bg: "bg-gray-100", text: "text-gray-600", dot: "bg-gray-400" };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold",
        config.bg,
        config.text,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", config.dot)} />
      {status}
    </span>
  );
}

// Quote Card Component for mobile view
function QuoteCard({
  quote,
  onView,
  onEdit,
  onDelete,
  onStatusChange,
}: {
  quote: PriceQuote;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onStatusChange: (status: PriceQuoteStatusEnum) => void;
}) {
  return (
    <div
      className="p-4 rounded-xl bg-card border border-border/50 shadow-sm space-y-3 active:scale-[0.99] transition-transform"
      onClick={onView}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <FileText className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-bold">Quote #{quote.id}</p>
            <p className="text-[10px] text-muted-foreground">
              {formatTruckType(quote.truck_type)} •{" "}
              {formatContainerSize(quote.container_size)}
            </p>
          </div>
        </div>
        <div onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 rounded-xl">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onView();
                }}
                className="rounded-lg"
              >
                <Eye className="mr-2 h-4 w-4" />
                View
              </DropdownMenuItem>
              {(quote.status === PriceQuoteStatusEnum.DRAFT ||
                quote.status === PriceQuoteStatusEnum.INACTIVE) && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit();
                  }}
                  className="rounded-lg"
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
              )}
              {quote.status !== PriceQuoteStatusEnum.ACTIVE && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                  className="text-destructive rounded-lg"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Route */}
      <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
        <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-xs font-medium">
          {formatLocation(quote.origin)}
        </span>
        <ChevronRight className="h-3 w-3 text-muted-foreground" />
        <span className="text-xs font-medium">
          {formatLocation(quote.destination)}
        </span>
      </div>

      {/* Details Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Package className="h-3.5 w-3.5" />
            <span>
              {quote.gross_weight_min.toLocaleString()}-
              {quote.gross_weight_max.toLocaleString()} kg
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-primary">
            {quote.amount.toLocaleString()} {quote.currency}
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-border/50">
        <div onClick={(e) => e.stopPropagation()}>
          {quote.status === PriceQuoteStatusEnum.ACTIVE ? (
            <StatusBadge status={quote.status} />
          ) : (
            <Select
              value={quote.status}
              onValueChange={(value) =>
                onStatusChange(value as PriceQuoteStatusEnum)
              }
            >
              <SelectTrigger className="h-6 w-auto gap-1 border-0 bg-transparent p-0 text-xs hover:bg-transparent focus:ring-0">
                <StatusBadge status={quote.status} />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
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
          )}
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </div>
    </div>
  );
}

// Loading Skeleton
function QuoteCardSkeleton() {
  return (
    <div className="p-4 rounded-xl bg-card border border-border/50 shadow-sm space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-9 rounded-lg" />
          <div className="space-y-1">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
      <Skeleton className="h-8 w-full rounded-lg" />
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-5 w-16" />
      </div>
      <div className="flex items-center justify-between pt-2 border-t">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-4 w-4" />
      </div>
    </div>
  );
}

export function PriceQuotesListView() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [perPage] = useState(20);
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

  // Calculate stats
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

  const getPaginationPages = () => {
    if (pages <= 5) return Array.from({ length: pages }, (_, i) => i + 1);
    const pagesToShow: (number | string)[] = [1];
    if (page > 3) pagesToShow.push("...");
    const start = Math.max(2, page - 1);
    const end = Math.min(pages - 1, page + 1);
    for (let i = start; i <= end; i++) pagesToShow.push(i);
    if (page < pages - 2) pagesToShow.push("...");
    if (pages > 1) pagesToShow.push(pages);
    return pagesToShow;
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
    <div className="space-y-4 animate-in fade-in duration-300 pb-6 px-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Price Quotes</h1>
          <p className="text-xs text-muted-foreground">{total} total quotes</p>
        </div>
        <Button
          onClick={() => router.push("/price-quotes/create")}
          size="sm"
          className="rounded-xl h-9 gap-1.5"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Create Quote</span>
          <span className="sm:hidden">New</span>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatsCard
          icon={FileText}
          label="Total"
          value={total}
          accent="bg-primary/10 text-primary"
        />
        <StatsCard
          icon={CheckCircle}
          label="Active"
          value={activeCount}
          accent="bg-emerald-500/10 text-emerald-600"
        />
        <StatsCard
          icon={Clock}
          label="Draft"
          value={draftCount}
          accent="bg-amber-500/10 text-amber-600"
        />
        <StatsCard
          icon={XCircle}
          label="Inactive"
          value={inactiveCount}
          accent="bg-gray-500/10 text-gray-600"
        />
      </div>

      {/* Filter Button */}
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
                    Object.values(appliedFilters).filter((v) => v !== undefined)
                      .length
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
                          value === "all" ? undefined : (value as LocationEnum),
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
                          value === "all" ? undefined : (value as LocationEnum),
                      })
                    }
                  >
                    <SelectTrigger className="h-10 rounded-xl">
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="all">All Destinations</SelectItem>
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

      {/* Quote Cards List */}
      <div className="space-y-3">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => <QuoteCardSkeleton key={i} />)
        ) : quotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="p-4 rounded-full bg-muted/50 mb-4">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">No quotes found</p>
            <p className="text-xs text-muted-foreground mb-4">
              Create your first price quote
            </p>
            <Button
              onClick={() => router.push("/price-quotes/create")}
              size="sm"
              className="rounded-xl"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Quote
            </Button>
          </div>
        ) : (
          quotes.map((quote) => (
            <QuoteCard
              key={quote.id}
              quote={quote}
              onView={() =>
                router.push(`/price-quotes/placeholder?id=${quote.id}`)
              }
              onEdit={() =>
                router.push(`/price-quotes/placeholder/edit?id=${quote.id}`)
              }
              onDelete={() => handleDeleteClick(quote)}
              onStatusChange={(status) => handleStatusChange(quote.id, status)}
            />
          ))
        )}
      </div>

      {/* Pagination */}
      {!isLoading && pages > 1 && (
        <div className="flex flex-col items-center gap-3 pt-4">
          <div className="text-xs text-muted-foreground">
            Page {page} of {pages} • {total} quotes
          </div>
          <Pagination>
            <PaginationContent className="gap-1">
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setPage(Math.max(1, page - 1))}
                  className={cn(
                    "h-8 rounded-lg",
                    page === 1 && "pointer-events-none opacity-50",
                  )}
                />
              </PaginationItem>
              {getPaginationPages().map((p, idx) =>
                typeof p === "string" ? (
                  <PaginationItem key={`ellipsis-${idx}`}>
                    <span className="h-8 w-8 flex items-center justify-center text-xs">
                      ...
                    </span>
                  </PaginationItem>
                ) : (
                  <PaginationItem key={p}>
                    <PaginationLink
                      onClick={() => setPage(p)}
                      isActive={page === p}
                      className="h-8 w-8 rounded-lg text-xs"
                    >
                      {p}
                    </PaginationLink>
                  </PaginationItem>
                ),
              )}
              <PaginationItem>
                <PaginationNext
                  onClick={() => setPage(Math.min(pages, page + 1))}
                  className={cn(
                    "h-8 rounded-lg",
                    page >= pages && "pointer-events-none opacity-50",
                  )}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

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
