"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ShipItem, ShipItemStatusEnum } from "@/types/ship";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils"; // Assuming this utility exists, otherwise I'll just format manually

// Dummy Options
const TRUCK_OPTIONS = [
    { id: 1, plate: "ET-A-12345" },
    { id: 2, plate: "ET-B-67890" },
    { id: 3, plate: "ET-C-11223" },
];

const DRIVER_OPTIONS = [
    { id: 1, name: "Abebe Kebede" },
    { id: 2, name: "Chala Muhe" },
    { id: 3, name: "Dawit Girma" },
];

export const columns: ColumnDef<ShipItem>[] = [
    {
        accessorKey: "id",
        header: "ID",
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as ShipItemStatusEnum;
            return (
                <Badge variant={status === ShipItemStatusEnum.DELIVERED ? "default" : "secondary"}>
                    {status}
                </Badge>
            );
        },
    },
    {
        accessorKey: "computed_price",
        header: "Computed Price",
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("computed_price"));
            const currency = row.original.currency;
            return <div>{formatCurrency(amount, currency)}</div>;
        },
    },
    {
        id: "truck",
        header: "Truck",
        cell: ({ row }) => {
            const item = row.original;
            // In a real app, we'd have an onChange handler to update the backend
            return (
                <Select defaultValue={item.truck_id?.toString()}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select Truck" />
                    </SelectTrigger>
                    <SelectContent>
                        {TRUCK_OPTIONS.map((truck) => (
                            <SelectItem key={truck.id} value={truck.id.toString()}>
                                {truck.plate}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            );
        },
    },
    {
        id: "driver",
        header: "Driver",
        cell: ({ row }) => {
            const item = row.original;
            return (
                <Select defaultValue={item.driver_id?.toString()}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select Driver" />
                    </SelectTrigger>
                    <SelectContent>
                        {DRIVER_OPTIONS.map((driver) => (
                            <SelectItem key={driver.id} value={driver.id.toString()}>
                                {driver.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            );
        },
    },
];
