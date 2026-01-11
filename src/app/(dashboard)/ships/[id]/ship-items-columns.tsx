"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ShipItem, Truck, Driver } from "@/types/ship";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface ShipItemsTableMeta {
    onViewContainers: (containers: any[]) => void;
    trucks: Truck[];
    drivers: Driver[];
    onAssign: (shipItemId: number, truckId: number | null, driverId: number | null) => void;
    selectedTrucks: Record<number, number | null>;
    selectedDrivers: Record<number, number | null>;
    onTruckChange: (shipItemId: number, truckId: number | null) => void;
    onDriverChange: (shipItemId: number, driverId: number | null) => void;
}

export const columns: ColumnDef<ShipItem>[] = [
    {
        accessorKey: "id",
        header: "Ship Item ID",
        cell: ({ row }) => <div className="font-medium">{row.getValue("id")}</div>,
    },
    {
        id: "origin",
        header: "Origin",
        cell: ({ row, table }) => {
            // Access ship data from table meta if available
            const meta = table.options.meta as any;
            return <div>{meta?.ship?.origin || "-"}</div>;
        },
    },
    {
        id: "destination",
        header: "Destination",
        cell: ({ row, table }) => {
            // Access ship data from table meta if available
            const meta = table.options.meta as any;
            return <div>{meta?.ship?.destination || "-"}</div>;
        },
    },
    {
        id: "truck",
        header: "Truck",
        cell: ({ row, table }) => {
            const item = row.original;
            const meta = table.options.meta as unknown as ShipItemsTableMeta;
            const trucks = meta?.trucks || [];
            const selectedTruckId = meta?.selectedTrucks?.[item.id] ?? (item.truck_id || item.assigned_truck_id);

            return (
                <Select
                    value={selectedTruckId?.toString() || ""}
                    onValueChange={(value) => meta?.onTruckChange(item.id, value ? Number(value) : null)}
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select truck" />
                    </SelectTrigger>
                    <SelectContent>
                        {trucks.map((truck) => (
                            <SelectItem key={truck.id} value={truck.id.toString()}>
                                {truck.plate_number} - {truck.make} {truck.model}
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
            const meta = table.options.meta as unknown as ShipItemsTableMeta;
            const drivers = meta?.drivers || [];
            const selectedDriverId = meta?.selectedDrivers?.[item.id] ?? (item.driver_id || item.assigned_driver_id);

            return (
                <Select
                    value={selectedDriverId?.toString() || ""}
                    onValueChange={(value) => meta?.onDriverChange(item.id, value ? Number(value) : null)}
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select driver" />
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
    {
        id: "containers",
        header: "Containers",
        cell: ({ row, table }) => {
            const containers = row.original.containers || [];
            const meta = table.options.meta as unknown as ShipItemsTableMeta;

            return (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => meta?.onViewContainers(containers)}
                    className="flex items-center gap-2"
                >
                    <Badge variant="secondary">{containers.length}</Badge>
                    View
                </Button>
            );
        },
    },
    {
        id: "actions",
        header: "Actions",
        cell: ({ row, table }) => {
            const item = row.original;
            const meta = table.options.meta as unknown as ShipItemsTableMeta;
            const selectedTruckId = meta?.selectedTrucks?.[item.id] ?? (item.truck_id || item.assigned_truck_id);
            const selectedDriverId = meta?.selectedDrivers?.[item.id] ?? (item.driver_id || item.assigned_driver_id);

            return (
                <Button
                    size="sm"
                    onClick={() => meta?.onAssign(item.id, selectedTruckId || null, selectedDriverId || null)}
                    disabled={!selectedTruckId && !selectedDriverId}
                >
                    Assign
                </Button>
            );
        },
    },
];
