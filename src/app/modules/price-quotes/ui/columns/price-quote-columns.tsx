"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal, Edit, Trash2, Eye, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { PriceQuote } from "@/types/price-quote";
import { PriceQuoteStatusEnum } from "@/types/price-quote";
import {
    formatLocation,
    formatTruckType,
    formatContainerSize,
    formatAxleType,
} from "@/lib/price-quote-utils";

export type PriceQuoteTableRow = PriceQuote;

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

function ActionsCell({
    quote,
    meta,
}: {
    quote: PriceQuote;
    meta?: {
        onEdit?: (quote: PriceQuote) => void;
        onDelete?: (quote: PriceQuote) => void;
    };
}) {
    const router = useRouter();

    return (
        <div
            className="text-right min-w-[50px] flex items-center justify-end"
            onClick={(e) => e.stopPropagation()}
        >
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40 rounded-xl">
                    <DropdownMenuItem
                        onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/price-quotes/placeholder?id=${quote.id}`);
                        }}
                        className="rounded-lg"
                    >
                        <Eye className="mr-2 h-4 w-4" /> View
                    </DropdownMenuItem>
                    {meta?.onEdit && (
                        <DropdownMenuItem
                            onClick={(e) => {
                                e.stopPropagation();
                                meta.onEdit?.(quote);
                            }}
                            className="rounded-lg"
                        >
                            <Edit className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                    )}
                    {quote.status !== PriceQuoteStatusEnum.ACTIVE && meta?.onDelete && (
                        <DropdownMenuItem
                            className="text-destructive focus:text-destructive rounded-lg"
                            onClick={(e) => {
                                e.stopPropagation();
                                meta.onDelete?.(quote);
                            }}
                        >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}

export const priceQuoteColumns: ColumnDef<PriceQuoteTableRow>[] = [
    {
        accessorKey: "id",
        header: ({ column }) => (
            <span
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                className="text-xs font-semibold uppercase tracking-wider flex items-center cursor-pointer"
            >
                ID / Route
                <ArrowUpDown className="ml-2 h-3 w-3" />
            </span>
        ),
        cell: ({ row }) => {
            const quote = row.original;
            return (
                <div className="flex flex-col min-w-[150px]">
                    <span className="font-bold text-sm">Quote #{quote.id}</span>
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-0.5">
                        <span className="truncate max-w-[60px]">{formatLocation(quote.origin)}</span>
                        <ChevronRight className="h-2 w-2" />
                        <span className="truncate max-w-[60px]">{formatLocation(quote.destination)}</span>
                    </div>
                </div>
            );
        },
        meta: { sticky: true },
    },
    {
        accessorKey: "truck_type",
        header: () => <span className="text-xs font-semibold uppercase tracking-wider">Vehicle</span>,
        cell: ({ row }) => {
            const quote = row.original;
            return (
                <div className="flex flex-col min-w-[100px]">
                    <span className="text-xs font-medium">{formatTruckType(quote.truck_type)}</span>
                    <span className="text-[10px] text-muted-foreground">{formatAxleType(quote.axle_type)}</span>
                </div>
            );
        },
    },
    {
        accessorKey: "container_size",
        header: () => <span className="text-xs font-semibold uppercase tracking-wider">Container</span>,
        cell: ({ row }) => (
            <span className="text-xs whitespace-nowrap">{formatContainerSize(row.getValue("container_size"))}</span>
        ),
    },
    {
        accessorKey: "gross_weight_max",
        header: () => <span className="text-xs font-semibold uppercase tracking-wider text-right">Weight (kg)</span>,
        cell: ({ row }) => {
            const quote = row.original;
            return (
                <div className="text-right text-xs whitespace-nowrap min-w-[100px]">
                    {quote.gross_weight_min.toLocaleString()} - {quote.gross_weight_max.toLocaleString()}
                </div>
            );
        },
    },
    {
        accessorKey: "amount",
        header: ({ column }) => (
            <div className="text-right">
                <span
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="text-xs font-semibold uppercase tracking-wider flex items-center justify-end cursor-pointer"
                >
                    Price
                    <ArrowUpDown className="ml-2 h-3 w-3" />
                </span>
            </div>
        ),
        cell: ({ row }) => {
            const quote = row.original;
            return (
                <div className="text-right flex flex-col min-w-[80px]">
                    <span className="text-sm font-bold text-primary">
                        {quote.amount.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-muted-foreground uppercase">{quote.currency}</span>
                </div>
            );
        },
    },
    {
        accessorKey: "status",
        header: () => <span className="text-xs font-semibold uppercase tracking-wider">Status</span>,
        cell: ({ row, table }) => {
            const quote = row.original;
            const meta = table.options.meta as {
                onStatusChange?: (id: number, status: PriceQuoteStatusEnum) => void;
            };

            if (quote.status === PriceQuoteStatusEnum.ACTIVE) {
                return <StatusBadge status={quote.status} />;
            }

            return (
                <div onClick={(e) => e.stopPropagation()}>
                    <Select
                        value={quote.status}
                        onValueChange={(value) =>
                            meta.onStatusChange?.(quote.id, value as PriceQuoteStatusEnum)
                        }
                    >
                        <SelectTrigger className="h-7 w-auto gap-1 border-0 bg-transparent p-0 focus:ring-0 hover:bg-transparent">
                            <StatusBadge status={quote.status} />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                            <SelectItem value={PriceQuoteStatusEnum.DRAFT}>Draft</SelectItem>
                            <SelectItem value={PriceQuoteStatusEnum.ACTIVE}>Active</SelectItem>
                            <SelectItem value={PriceQuoteStatusEnum.INACTIVE}>Inactive</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            );
        },
    },
    {
        id: "actions",
        cell: ({ row, table }) => {
            const quote = row.original;
            const meta = table.options.meta as {
                onEdit?: (quote: PriceQuote) => void;
                onDelete?: (quote: PriceQuote) => void;
            };

            return <ActionsCell quote={quote} meta={meta} />;
        },
    },
];
