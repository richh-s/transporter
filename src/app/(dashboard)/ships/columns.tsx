"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Ship } from "@/types/ship";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, MoreHorizontal, Eye, ArrowRight } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export const columns: ColumnDef<Ship>[] = [
    {
        accessorKey: "id",
        header: () => (
            <div className="pl-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">ID</div>
        ),
        cell: ({ row }) => (
            <div className="pl-4 font-mono text-xs text-secondary/70">#{row.getValue("id")}</div>
        ),
    },
    {
        accessorKey: "origin",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="hover:bg-transparent p-0 font-semibold uppercase tracking-wider text-xs text-muted-foreground"
                >
                    Route
                    <ArrowUpDown className="ml-2 h-3 w-3" />
                </Button>
            );
        },
        cell: ({ row }) => {
            const origin = row.original.origin || "-";
            const destination = row.original.destination || "-";
            return (
                <div className="flex flex-col">
                    <div className="flex items-center gap-2 group/route">
                        <span className="font-bold text-foreground capitalize">{origin.replace(/_/g, " ")}</span>
                        <ArrowRight className="h-3 w-3 text-primary opacity-50 group-hover/route:opacity-100 group-hover/route:translate-x-0.5 transition-all" />
                        <span className="font-bold text-foreground capitalize">{destination.replace(/_/g, " ")}</span>
                    </div>
                </div>
            );
        },
    },
    {
        accessorKey: "pickup_facility",
        header: () => (
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Facilities</div>
        ),
        cell: ({ row }) => {
            const pickup = row.original.pickup_facility;
            const delivery = row.original.delivery_facility;
            return (
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary/40 shrink-0" />
                        <span className="text-xs font-medium text-foreground truncate max-w-[150px]">{pickup?.name || "No Source"}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-secondary/40 shrink-0" />
                        <span className="text-xs font-medium text-foreground truncate max-w-[150px]">{delivery?.name || "No Destination"}</span>
                    </div>
                </div>
            );
        },
    },
    {
        accessorKey: "pickup_date",
        header: () => (
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Timeline</div>
        ),
        cell: ({ row }) => {
            const pickupStr = row.original.pickup_date;
            const deliveryStr = row.original.delivery_date;

            const formatDate = (dateStr: string) => {
                if (!dateStr) return "-";
                return format(new Date(dateStr), "MMM d, yyyy");
            };

            return (
                <div className="flex flex-col text-xs">
                    <div className="flex items-center justify-between gap-4">
                        <span className="text-muted-foreground">Pickup:</span>
                        <span className="font-bold text-foreground">{formatDate(pickupStr)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                        <span className="text-muted-foreground">Delivery:</span>
                        <span className="font-bold text-foreground">{formatDate(deliveryStr)}</span>
                    </div>
                </div>
            );
        },
    },
    {
        accessorKey: "status",
        header: () => (
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-center">Status</div>
        ),
        cell: ({ row }) => {
            const status = row.getValue("status") as string;

            const getStatusConfig = (s: string) => {
                const normalizedStatus = s?.toUpperCase();
                switch (normalizedStatus) {
                    case "COMPLETED":
                    case "DELIVERED":
                        return { color: "bg-primary", text: "text-primary dark:text-primary-foreground", bg: "bg-primary/10 dark:bg-primary/20", label: "Completed" };
                    case "IN_TRANSIT":
                        return { color: "bg-amber-500", text: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10 dark:bg-amber-500/20", label: "In Transit" };
                    case "PENDING":
                        return { color: "bg-blue-500", text: "text-blue-600 dark:text-blue-400", bg: "bg-blue-500/10 dark:bg-blue-500/20", label: "Pending" };
                    case "ASSIGNED":
                        return { color: "bg-emerald-500", text: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10 dark:bg-emerald-500/20", label: "Assigned" };
                    case "CANCELLED":
                        return { color: "bg-destructive", text: "text-destructive dark:text-red-400", bg: "bg-destructive/10 dark:bg-red-950/30", label: "Cancelled" };
                    default:
                        return { color: "bg-secondary", text: "text-secondary dark:text-secondary-foreground", bg: "bg-secondary/10 dark:bg-secondary/20", label: s || "Unknown" };
                }
            };

            const config = getStatusConfig(status);

            return (
                <div className="flex justify-center">
                    <div className={cn("flex items-center gap-2 px-2.5 py-1 rounded-full border border-transparent transition-all hover:border-current", config.bg, config.text)}>
                        <span className={cn("h-1.5 w-1.5 rounded-full animate-pulse", config.color)} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">{config.label}</span>
                    </div>
                </div>
            );
        },
    },

    {
        id: "actions",
        header: () => <div className="pr-4" />,
        cell: ({ row }) => {
            const ship = row.original;

            return (
                <div className="pr-4 flex justify-end">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-primary/5 hover:text-primary transition-all rounded-lg">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40 p-1 rounded-xl shadow-xl border-primary/10">
                            <DropdownMenuLabel className="text-[10px] text-muted-foreground uppercase tracking-widest px-2 py-1.5 font-bold">Options</DropdownMenuLabel>
                            <DropdownMenuItem asChild className="rounded-lg cursor-pointer focus:bg-primary/5 focus:text-primary">
                                <Link href={`/ships/${ship.id}`} className="flex items-center w-full">
                                    <Eye className="mr-2 h-4 w-4 opacity-70" />
                                    <span className="font-semibold text-xs">View Details</span>
                                </Link>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            );
        },
    },
];
