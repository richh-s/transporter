"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Container } from "@/types/ship";
import { Badge } from "@/components/ui/badge";

export const columns: ColumnDef<Container>[] = [
    {
        accessorKey: "id",
        header: "ID",
        cell: ({ row }) => <div className="w-[50px]">{row.getValue("id")}</div>,
    },
    {
        accessorKey: "container_number",
        header: "Container Number",
        cell: ({ row }) => {
            const value = row.getValue("container_number") as string;
            return <div className="font-medium">{value || "-"}</div>;
        },
    },
    {
        accessorKey: "container_type",
        header: "Type",
        cell: ({ row }) => {
            const value = row.getValue("container_type") as string;
            return <div>{value || "-"}</div>;
        },
    },
    {
        accessorKey: "weight",
        header: "Weight",
        cell: ({ row }) => {
            const value = row.getValue("weight") as number;
            return <div>{value ? `${value} kg` : "-"}</div>;
        },
    },
    {
        accessorKey: "volume",
        header: "Volume",
        cell: ({ row }) => {
            const value = row.getValue("volume") as number;
            return <div>{value ? `${value} m³` : "-"}</div>;
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
                        status === "DELIVERED"
                            ? "default"
                            : status === "IN_TRANSIT"
                                ? "secondary"
                                : "outline"
                    }
                >
                    {status || "-"}
                </Badge>
            );
        },
    },
];
