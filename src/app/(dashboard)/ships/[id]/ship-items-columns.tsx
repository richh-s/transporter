"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ShipItem, ShipItemStatusEnum, Truck, Driver } from "@/types/ship";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";

// Define the shape of our table meta
interface TableMeta {
    trucks: Truck[];
    drivers: Driver[];
    onAssign: (itemId: number, type: 'truck' | 'driver', value: string) => void;
}

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
        accessorKey: "price",
        header: "Price",
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("price"));
            const currency = row.original.currency;
            return <div>{formatCurrency(amount, currency)}</div>;
        },
    },
    {
        id: "truck",
        header: "Truck",
        cell: ({ row, table }) => {
            const item = row.original;
            const meta = table.options.meta as unknown as TableMeta;
            const trucks = meta?.trucks || [];

            return (
                <Select
                    defaultValue={item.assigned_truck_id?.toString()}
                    onValueChange={(value) => meta?.onAssign(item.id, 'truck', value)}
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select Truck" />
                    </SelectTrigger>
                    <SelectContent>
                        {trucks.map((truck) => (
                            <SelectItem key={truck.id} value={truck.id.toString()}>
                                {truck.plate_number}
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
        cell: ({ row, table }) => {
            const item = row.original;
            const meta = table.options.meta as unknown as TableMeta;
            const drivers = meta?.drivers || [];

            return (
                <Select
                    defaultValue={item.assigned_driver_id?.toString()}
                    onValueChange={(value) => meta?.onAssign(item.id, 'driver', value)}
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select Driver" />
                    </SelectTrigger>
                    <SelectContent>
                        {drivers.map((driver) => (
                            <SelectItem key={driver.id} value={driver.id.toString()}>
                                {driver.first_name} {driver.last_name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            );
        },
    },
];
