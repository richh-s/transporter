"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
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
    getStatusVariant,
    LOCATION_OPTIONS,
} from "@/lib/price-quote-utils";
import {
    usePriceQuotes,
    useDeletePriceQuote,
    useUpdatePriceQuote,
} from "@/app/modules/price-quotes/server/hooks";
import { DeleteQuoteDialog } from "@/app/modules/price-quotes/ui/components";

export function PriceQuotesListView() {
    const router = useRouter();
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(20);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [quoteToDelete, setQuoteToDelete] = useState<PriceQuote | null>(null);

    // Filters
    const [filters, setFilters] = useState<PriceQuoteFilters>({
        origin: undefined,
        destination: undefined,
        truck_type: undefined,
        container_size: undefined,
        status: undefined,
        currency: undefined,
    });
    console.log(setPerPage)
    const [appliedFilters, setAppliedFilters] = useState<PriceQuoteFilters>({});

    const { data: quotesResponse, isLoading } = usePriceQuotes(
        page,
        perPage,
        appliedFilters
    );

    const deleteMutation = useDeletePriceQuote();
    const updateMutation = useUpdatePriceQuote();

    const quotes = quotesResponse?.items || [];
    const total = quotesResponse?.total || 0;
    const pages = quotesResponse?.pages || 0;

    const handleApplyFilters = () => {
        setAppliedFilters(filters);
        setPage(1);
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

    // Generate pagination page numbers with ellipses
    const getPaginationPages = () => {
        if (pages <= 7) {
            // If 7 or fewer pages, show all
            return Array.from({ length: pages }, (_, i) => i + 1);
        }

        const pagesToShow: (number | string)[] = [];
        const delta = 2; // Number of pages to show on each side of current page

        // Always show first page
        pagesToShow.push(1);

        let start = Math.max(2, page - delta);
        let end = Math.min(pages - 1, page + delta);

        // Adjust if we're near the start
        if (page <= delta + 1) {
            end = Math.min(pages - 1, 2 * delta + 2);
        }

        // Adjust if we're near the end
        if (page >= pages - delta) {
            start = Math.max(2, pages - 2 * delta - 1);
        }

        // Add ellipsis after first page if needed
        if (start > 2) {
            pagesToShow.push("ellipsis-start");
        }

        // Add pages around current page
        for (let i = start; i <= end; i++) {
            pagesToShow.push(i);
        }

        // Add ellipsis before last page if needed
        if (end < pages - 1) {
            pagesToShow.push("ellipsis-end");
        }

        // Always show last page
        if (pages > 1) {
            pagesToShow.push(pages);
        }

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

    const handleStatusChange = (quoteId: number, newStatus: PriceQuoteStatusEnum) => {
        updateMutation.mutate({
            id: quoteId,
            data: { status: newStatus },
        });
    };

    return (
        <div className="space-y-3 sm:space-y-4 md:space-y-5 lg:space-y-6 animate-in fade-in duration-500 w-full overflow-x-hidden overflow-y-auto min-h-0 pb-4 sm:pb-6 px-2 sm:px-4 md:px-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-brand-primary">
                    Price Quotes
                </h1>
                <Button
                    onClick={() => router.push("/price-quotes/create")}
                    className="w-full sm:w-auto text-xs sm:text-sm"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">Create Quote</span>
                    <span className="sm:hidden">Create</span>
                </Button>
            </div>

            {/* Filters Card */}
            <Card>
                <CardHeader className="pb-3 sm:pb-4">
                    <CardTitle className="text-base sm:text-lg">Filters</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4">
                        <Select
                            value={filters.origin || "all"}
                            onValueChange={(value) =>
                                setFilters({
                                    ...filters,
                                    origin: value === "all" ? undefined : (value as LocationEnum),
                                })
                            }
                        >
                            <SelectTrigger className="w-full text-xs sm:text-sm">
                                <SelectValue placeholder="Origin" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Origins</SelectItem>
                                {LOCATION_OPTIONS.map((location) => (
                                    <SelectItem key={location.value} value={location.value}>
                                        {location.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select
                            value={filters.destination || "all"}
                            onValueChange={(value) =>
                                setFilters({
                                    ...filters,
                                    destination: value === "all" ? undefined : (value as LocationEnum),
                                })
                            }
                        >
                            <SelectTrigger className="w-full text-xs sm:text-sm">
                                <SelectValue placeholder="Destination" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Destinations</SelectItem>
                                {LOCATION_OPTIONS.map((location) => (
                                    <SelectItem key={location.value} value={location.value}>
                                        {location.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select
                            value={filters.status || "all"}
                            onValueChange={(value) =>
                                setFilters({
                                    ...filters,
                                    status: value === "all" ? undefined : (value as PriceQuoteStatusEnum),
                                })
                            }
                        >
                            <SelectTrigger className="w-full text-xs sm:text-sm">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value={PriceQuoteStatusEnum.DRAFT}>Draft</SelectItem>
                                <SelectItem value={PriceQuoteStatusEnum.ACTIVE}>Active</SelectItem>
                                <SelectItem value={PriceQuoteStatusEnum.INACTIVE}>Inactive</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select
                            value={filters.truck_type || "all"}
                            onValueChange={(value) =>
                                setFilters({
                                    ...filters,
                                    truck_type: value === "all" ? undefined : (value as TruckTypeEnum),
                                })
                            }
                        >
                            <SelectTrigger className="w-full text-xs sm:text-sm">
                                <SelectValue placeholder="Truck Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value={TruckTypeEnum.FLATBED}>Flatbed</SelectItem>
                                <SelectItem value={TruckTypeEnum.TRAILER}>Trailer</SelectItem>
                            </SelectContent>
                        </Select>

                        <div className="flex gap-2 col-span-2 sm:col-span-1 xl:col-span-2">
                            <Button
                                variant="outline"
                                onClick={handleClearFilters}
                                className="flex-1 sm:flex-none text-xs sm:text-sm"
                            >
                                Clear
                            </Button>
                            <Button
                                onClick={handleApplyFilters}
                                className="flex-1 sm:flex-none text-xs sm:text-sm"
                            >
                                Apply
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Table Card */}
            <Card className="overflow-visible">
                <CardHeader className="pb-3 sm:pb-4">
                    <CardTitle className="text-base sm:text-lg">Price Quotes</CardTitle>
                </CardHeader>
                <CardContent className="p-0 sm:p-6 overflow-visible">
                    <div className="overflow-x-auto overflow-y-visible min-w-[400px] sm:min-w-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="sticky left-0 z-10 bg-background border-r whitespace-nowrap text-xs sm:text-sm">
                                        ID
                                    </TableHead>
                                    <TableHead className="hidden sm:table-cell whitespace-nowrap text-xs sm:text-sm">
                                        Origin
                                    </TableHead>
                                    <TableHead className="hidden sm:table-cell whitespace-nowrap text-xs sm:text-sm">
                                        Destination
                                    </TableHead>
                                    <TableHead className="sm:hidden whitespace-nowrap text-xs sm:text-sm">
                                        Route
                                    </TableHead>
                                    <TableHead className="hidden md:table-cell whitespace-nowrap text-xs sm:text-sm">
                                        Weight Range
                                    </TableHead>
                                    <TableHead className="hidden lg:table-cell whitespace-nowrap text-xs sm:text-sm">
                                        Truck Type
                                    </TableHead>
                                    <TableHead className="hidden lg:table-cell whitespace-nowrap text-xs sm:text-sm">
                                        Container
                                    </TableHead>
                                    <TableHead className="whitespace-nowrap text-xs sm:text-sm">
                                        Amount
                                    </TableHead>
                                    <TableHead className="whitespace-nowrap text-xs sm:text-sm">
                                        Status
                                    </TableHead>
                                    <TableHead className="sticky right-0 z-10 bg-background whitespace-nowrap text-xs sm:text-sm">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    // Show skeleton rows while loading
                                    [...Array(5)].map((_, i) => (
                                        <TableRow key={`skeleton-${i}`}>
                                            <TableCell className="sticky left-0 z-10 bg-background border-r">
                                                <Skeleton className="h-4 w-8" />
                                            </TableCell>
                                            <TableCell className="hidden sm:table-cell">
                                                <Skeleton className="h-4 w-20" />
                                            </TableCell>
                                            <TableCell className="hidden sm:table-cell">
                                                <Skeleton className="h-4 w-20" />
                                            </TableCell>
                                            <TableCell className="sm:hidden">
                                                <Skeleton className="h-8 w-32" />
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell">
                                                <Skeleton className="h-4 w-24" />
                                            </TableCell>
                                            <TableCell className="hidden lg:table-cell">
                                                <Skeleton className="h-4 w-16" />
                                            </TableCell>
                                            <TableCell className="hidden lg:table-cell">
                                                <Skeleton className="h-4 w-20" />
                                            </TableCell>
                                            <TableCell>
                                                <Skeleton className="h-4 w-16" />
                                            </TableCell>
                                            <TableCell>
                                                <Skeleton className="h-5 w-16" />
                                            </TableCell>
                                            <TableCell className="sticky right-0 z-10 bg-background">
                                                <Skeleton className="h-6 w-6 rounded" />
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : quotes.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={10} className="text-center py-12">
                                            <p className="text-sm sm:text-base text-muted-foreground">
                                                No price quotes found. Create your first quote.
                                            </p>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    quotes.map((quote) => (
                                        <TableRow
                                            key={quote.id}
                                            className="cursor-pointer"
                                            onClick={() => router.push(`/price-quotes/${quote.id}`)}
                                        >
                                            <TableCell className="font-medium sticky left-0 z-10 bg-background border-r text-xs sm:text-sm">
                                                {quote.id}
                                            </TableCell>
                                            <TableCell className="hidden sm:table-cell text-xs sm:text-sm">
                                                {formatLocation(quote.origin)}
                                            </TableCell>
                                            <TableCell className="hidden sm:table-cell text-xs sm:text-sm">
                                                {formatLocation(quote.destination)}
                                            </TableCell>
                                            <TableCell className="text-xs sm:text-sm sm:hidden">
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{formatLocation(quote.origin)}</span>
                                                    <span className="text-muted-foreground">→ {formatLocation(quote.destination)}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell text-xs sm:text-sm">
                                                {quote.gross_weight_min.toLocaleString()} - {quote.gross_weight_max.toLocaleString()} kg
                                            </TableCell>
                                            <TableCell className="hidden lg:table-cell text-xs sm:text-sm">
                                                {formatTruckType(quote.truck_type)}
                                            </TableCell>
                                            <TableCell className="hidden lg:table-cell text-xs sm:text-sm">
                                                {formatContainerSize(quote.container_size)}
                                            </TableCell>
                                            <TableCell className="text-xs sm:text-sm font-medium">
                                                {quote.amount.toLocaleString()} {quote.currency}
                                            </TableCell>
                                            <TableCell onClick={(e) => e.stopPropagation()}>
                                                {quote.status === PriceQuoteStatusEnum.ACTIVE ? (
                                                    <Badge variant={getStatusVariant(quote.status)} className="text-xs">
                                                        {quote.status}
                                                    </Badge>
                                                ) : (
                                                    <Select
                                                        value={quote.status}
                                                        onValueChange={(value) => handleStatusChange(quote.id, value as PriceQuoteStatusEnum)}
                                                    >
                                                        <SelectTrigger className="w-[100px] sm:w-[120px] h-7 sm:h-8 text-xs border-0 bg-transparent hover:bg-transparent focus:ring-0 focus:ring-offset-0 p-0 h-auto">
                                                            <SelectValue>
                                                                <Badge variant={getStatusVariant(quote.status)} className="text-xs cursor-pointer">
                                                                    {quote.status}
                                                                </Badge>
                                                            </SelectValue>
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value={PriceQuoteStatusEnum.DRAFT}>Draft</SelectItem>
                                                            <SelectItem value={PriceQuoteStatusEnum.ACTIVE}>Active</SelectItem>
                                                            <SelectItem value={PriceQuoteStatusEnum.INACTIVE}>Inactive</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            </TableCell>
                                            <TableCell onClick={(e) => e.stopPropagation()} className="sticky right-0 z-10 bg-background text-xs sm:text-sm">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8">
                                                            <MoreHorizontal className="h-3 w-3 sm:h-4 sm:w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem
                                                            onClick={() => router.push(`/price-quotes/${quote.id}`)}
                                                        >
                                                            View
                                                        </DropdownMenuItem>
                                                        {(quote.status === PriceQuoteStatusEnum.DRAFT || quote.status === PriceQuoteStatusEnum.INACTIVE) && (
                                                            <DropdownMenuItem
                                                                onClick={() => router.push(`/price-quotes/${quote.id}/edit`)}
                                                            >
                                                                Edit
                                                            </DropdownMenuItem>
                                                        )}
                                                        {quote.status !== PriceQuoteStatusEnum.ACTIVE && (
                                                            <DropdownMenuItem
                                                                onClick={() => handleDeleteClick(quote)}
                                                                className="text-destructive"
                                                            >
                                                                Delete
                                                            </DropdownMenuItem>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    {!isLoading && (
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 mt-4 p-4 sm:p-6 pt-4 border-t">
                            <div className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
                                Showing {(page - 1) * perPage + 1} to {Math.min(page * perPage, total)} of {total} quotes
                            </div>
                            <Pagination>
                                <PaginationContent className="gap-1 sm:gap-2">
                                    <PaginationItem>
                                        <PaginationPrevious
                                            onClick={() => setPage(Math.max(1, page - 1))}
                                            className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                            size="sm"
                                        />
                                    </PaginationItem>
                                    {getPaginationPages().map((pageItem, index) => {
                                        if (typeof pageItem === "string") {
                                            // Render ellipsis
                                            return (
                                                <PaginationItem key={`${pageItem}-${index}`}>
                                                    <span className="h-8 w-8 sm:h-10 sm:w-10 flex items-center justify-center text-xs sm:text-sm text-muted-foreground">
                                                        ...
                                                    </span>
                                                </PaginationItem>
                                            );
                                        }
                                        return (
                                            <PaginationItem key={pageItem}>
                                                <PaginationLink
                                                    onClick={() => setPage(pageItem)}
                                                    isActive={page === pageItem}
                                                    className="h-8 w-8 sm:h-10 sm:w-10 text-xs sm:text-sm"
                                                >
                                                    {pageItem}
                                                </PaginationLink>
                                            </PaginationItem>
                                        );
                                    })}
                                    <PaginationItem>
                                        <PaginationNext
                                            onClick={() => setPage(Math.min(pages, page + 1))}
                                            className={page >= pages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                            size="sm"
                                        />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Delete Confirmation Dialog */}
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
