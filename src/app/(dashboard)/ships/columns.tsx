"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Ship, ShipStatusEnum } from "@/types/ship";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, MoreHorizontal, Eye } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { format } from "date-fns";

export const columns: ColumnDef<Ship>[] = [
    {
        accessorKey: "id",
        header: "ID",
    },
    {
        accessorKey: "origin",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Origin
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
    },
    {
        accessorKey: "destination",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Destination
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
    },
    {
        accessorKey: "estimated_departure",
        header: "Est. Departure",
        cell: ({ row }) => {
            const dateStr = row.getValue("estimated_departure") as string;
            if (!dateStr) return <div>-</div>;
            const date = new Date(dateStr);
            return <div>{format(date, "PPP")}</div>;
        },
    },
    {
        accessorKey: "estimated_arrival",
        header: "Est. Arrival",
        cell: ({ row }) => {
            const dateStr = row.getValue("estimated_arrival") as string;
            if (!dateStr) return <div>-</div>;
            const date = new Date(dateStr);
            return <div>{format(date, "PPP")}</div>;
        },
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as string;
            return (
                <Badge
                    variant={
                        status === "COMPLETED" || status === "DELIVERED"
                            ? "default"
                            : status === "IN_TRANSIT"
                                ? "secondary"
                                : "outline"
                    }
                >
                    {status}
                </Badge>
            );
        },
    },

    {
        id: "actions",
        cell: ({ row }) => {
            const ship = row.original;

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                            asChild
                        >
                            <Link href={`/ships/${ship.id}`} className="flex items-center cursor-pointer">
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];
