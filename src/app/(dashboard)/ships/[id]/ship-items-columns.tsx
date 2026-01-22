"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ShipItem, Truck, Driver, Ship, Container } from "@/types/ship";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface ShipItemsTableMeta {
    onViewContainers: (containers: Container[]) => void;
    trucks: Truck[];
    drivers: Driver[];
    onAssign: (shipItemId: number, truckId: number | null, driverId: number | null) => void;
    selectedTrucks: Record<number, number | null>;
    selectedDrivers: Record<number, number | null>;
    onTruckChange: (shipItemId: number, truckId: number | null) => void;
    onDriverChange: (shipItemId: number, driverId: number | null) => void;
    ship: Ship;
    isAssigning?: boolean;
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
        cell: ({ table }) => {
            // Access ship data from table meta if available
            const meta = table.options.meta as ShipItemsTableMeta;
            return <div>{meta?.ship?.origin || "-"}</div>;
        },
    },
    {
        id: "destination",
        header: "Destination",
        cell: ({ table }) => {
            // Access ship data from table meta if available
            const meta = table.options.meta as ShipItemsTableMeta;
            return <div>{meta?.ship?.destination || "-"}</div>;
        },
    },
    {
        id: "truck",
        header: "Truck",
        cell: ({ row, table }) => {
            const item = row.original;
            const meta = table.options.meta as unknown as ShipItemsTableMeta;
            const availableTrucks = meta?.trucks || [];

            // The currently assigned truck object from DB
            const assignedTruck = item.truck || item.assigned_truck;
            // The currently assigned truck ID from DB
            const dbTruckId = assignedTruck?.id || item.truck_id || item.assigned_truck_id;

            // The currently selected truck (either from DB or changed by user)
            const selectedTruckId = meta?.selectedTrucks?.[item.id] ?? dbTruckId;

            // Calculate which trucks are "taken" by other items in the current table
            const takenTruckIds = new Set(
                table.options.data
                    .filter(otherItem => Number(otherItem.id) !== Number(item.id))
                    .map(otherItem => {
                        const id = meta?.selectedTrucks?.[otherItem.id] ?? ((otherItem.truck || otherItem.assigned_truck)?.id || otherItem.truck_id || otherItem.assigned_truck_id);
                        return id ? Number(id) : null;
                    })
                    .filter(Boolean) as number[]
            );

            // Merge available trucks with assigned truck, filtering out taken ones AND those assigned to other shipments in the API
            const dropdownTrucks = availableTrucks.filter(t => {
                const isActive = t.status === 'active';
                const tExt = t as Truck & { assigned?: boolean | string; assigend?: boolean | string; is_assigned?: boolean | string };
                const assignedVal = tExt.assigned || tExt.assigend || tExt.is_assigned;
                const isAssigned = !!assignedVal && String(assignedVal) !== "false";

                // Allow if:
                // 1. It is the currently assigned truck for this item (to ensure it shows up)
                // 2. OR (It is Active AND Not Assigned globally)
                const isEligible = String(t.id) === String(dbTruckId) || (isActive && !isAssigned);

                return isEligible && !takenTruckIds.has(Number(t.id));
            });

            console.log(`🚛 Ship Item ${item.id} - Available Trucks in Dropdown:`, dropdownTrucks);

            // If we have an assigned truck object, ensure it's in the list
            if (assignedTruck) {
                if (!dropdownTrucks.find(t => String(t.id) === String(assignedTruck.id))) {
                    dropdownTrucks.unshift(assignedTruck);
                }
            } else if (dbTruckId) {
                // If we only have the ID but no object, add a placeholder
                if (!dropdownTrucks.find(t => String(t.id) === String(dbTruckId))) {
                    dropdownTrucks.unshift({
                        id: Number(dbTruckId),
                        plate_number: `Truck #${dbTruckId}`,
                        make: "",
                        model: ""
                    } as Truck);
                }
            }

            return (
                <Select
                    value={selectedTruckId?.toString() || ""}
                    onValueChange={(value) => meta?.onTruckChange(item.id, value ? Number(value) : null)}
                >
                    <SelectTrigger className="w-[180px] cursor-pointer">
                        <SelectValue placeholder="Select truck" />
                    </SelectTrigger>
                    <SelectContent>
                        {dropdownTrucks.map((truck) => (
                            <SelectItem key={truck.id} value={truck.id.toString()}>
                                {truck.plate_number} {truck.make ? `- ${truck.make}` : ""} {truck.model || ""} ({truck.capacity_quintal || 0} Qtl)
                            </SelectItem>
                        ))}
                        {dropdownTrucks.length === 0 && (
                            <SelectItem value="none" disabled>No active trucks available</SelectItem>
                        )}
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
            const availableDrivers = meta?.drivers || [];

            // The currently assigned driver object from DB
            const assignedDriver = item.driver || item.assigned_driver;
            // The currently assigned driver ID from DB
            const dbDriverId = assignedDriver?.id || item.driver_id || item.assigned_driver_id;

            // The currently selected driver (either from DB or changed by user)
            const selectedDriverId = meta?.selectedDrivers?.[item.id] ?? dbDriverId;

            // Calculate which drivers are "taken" by other items in the current table
            const takenDriverIds = new Set(
                table.options.data
                    .filter(otherItem => Number(otherItem.id) !== Number(item.id))
                    .map(otherItem => {
                        const id = meta?.selectedDrivers?.[otherItem.id] ?? ((otherItem.driver || otherItem.assigned_driver)?.id || otherItem.driver_id || otherItem.assigned_driver_id);
                        return id ? Number(id) : null;
                    })
                    .filter(Boolean) as number[]
            );

            // Merge available drivers with assigned driver, filtering out taken ones AND those assigned to other shipments in the API
            const dropdownDrivers = availableDrivers.filter(d => {
                const isActive = d.status === 'active';
                const dExt = d as Driver & { assigned?: boolean | string; assigend?: boolean | string; is_assigned?: boolean | string };
                const assignedVal = dExt.assigned || dExt.assigend || dExt.is_assigned;
                const isAssigned = !!assignedVal && String(assignedVal) !== "false";

                // Allow if:
                // 1. It is the currently assigned driver for this item
                // 2. OR (It is Active AND Not Assigned globally)
                const isEligible = String(d.id) === String(dbDriverId) || (isActive && !isAssigned);

                return isEligible && !takenDriverIds.has(Number(d.id));
            });

            // If we have an assigned driver object, ensure it's in the list
            if (assignedDriver) {
                if (!dropdownDrivers.find(d => String(d.id) === String(assignedDriver.id))) {
                    dropdownDrivers.unshift(assignedDriver);
                }
            } else if (dbDriverId) {
                // If we only have the ID but no object, add a placeholder
                if (!dropdownDrivers.find(d => String(d.id) === String(dbDriverId))) {
                    dropdownDrivers.unshift({
                        id: Number(dbDriverId),
                        first_name: "Driver",
                        last_name: `#${dbDriverId}`
                    } as Driver);
                }
            }

            return (
                <Select
                    value={selectedDriverId?.toString() || ""}
                    onValueChange={(value) => meta?.onDriverChange(item.id, value ? Number(value) : null)}
                >
                    <SelectTrigger className="w-[180px] cursor-pointer">
                        <SelectValue placeholder="Select driver" />
                    </SelectTrigger>
                    <SelectContent>
                        {dropdownDrivers.map((driver) => (
                            <SelectItem key={driver.id} value={driver.id.toString()}>
                                {driver.first_name} {driver.last_name}
                            </SelectItem>
                        ))}
                        {dropdownDrivers.length === 0 && (
                            <SelectItem value="none" disabled>No active drivers available</SelectItem>
                        )}
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
            const item = row.original;
            const containers = item.containers && item.containers.length > 0
                ? item.containers
                : item.container
                    ? [item.container]
                    : [];
            const meta = table.options.meta as unknown as ShipItemsTableMeta;

            const totalWeight = containers.reduce((acc, c) => acc + (c.gross_weight || c.weight || 0), 0);

            return (
                <div className="flex flex-col gap-1.5">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => meta?.onViewContainers(containers)}
                        className="flex items-center gap-2 h-8 cursor-pointer"
                    >
                        <Badge variant="secondary" className="px-1.5 min-w-[1.25rem] justify-center">
                            {containers.length}
                        </Badge>
                        View
                    </Button>
                    {containers.length > 0 && (
                        <div className="text-[10px] sm:text-xs font-semibold text-brand-primary/80 whitespace-nowrap bg-brand-primary/5 px-1.5 py-0.5 rounded border border-brand-primary/10 w-fit">
                            Σ {totalWeight.toLocaleString()} kg
                        </div>
                    )}
                </div>
            );
        },
    },
    {
        id: "assignment_status",
        header: "Assignment Status",
        cell: ({ row }) => {
            const item = row.original;
            const hasTruck = !!(item.truck || item.truck_id || item.assigned_truck_id);
            const hasDriver = !!(item.driver || item.driver_id || item.assigned_driver_id);

            if (hasTruck && hasDriver) {
                return (
                    <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                        Fully Assigned
                    </Badge>
                );
            } else if (hasTruck || hasDriver) {
                return (
                    <Badge variant="default" className="bg-yellow-600 hover:bg-yellow-700">
                        Partially Assigned
                    </Badge>
                );
            } else {
                return (
                    <Badge variant="default" className="bg-red-600 hover:bg-red-700">
                        Unassigned
                    </Badge>
                );
            }
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
                    disabled={(!selectedTruckId && !selectedDriverId) || meta?.isAssigning}
                    className={cn(
                        "cursor-pointer transition-all duration-200",
                        meta?.isAssigning && "opacity-50 cursor-not-allowed"
                    )}
                >
                    {meta?.isAssigning ? "Assigning..." : "Assign"}
                </Button>
            );
        },
    },
];
