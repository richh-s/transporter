"use client";

import { useEffect, useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./columns";
import { LocationEnum, Ship, ShipStatusEnum } from "@/types/ship";
import { addDays } from "date-fns";

// Dummy Data Generator
const generateDummyShips = (count: number): Ship[] => {
    return Array.from({ length: count }).map((_, i) => ({
        id: i + 1,
        shipper_id: 100 + i,
        origin: Object.values(LocationEnum)[i % Object.values(LocationEnum).length],
        destination: Object.values(LocationEnum)[(i + 1) % Object.values(LocationEnum).length],
        pickup_date: addDays(new Date(), i).toISOString(),
        delivery_date: addDays(new Date(), i + 3).toISOString(),
        pickup_facility: { name: `Facility A-${i}`, address: "123 Pickup St" },
        delivery_facility: { name: `Facility B-${i}`, address: "456 Delivery Ave" },
        shipment_details: { weight: "20 tons", cargo: "Coffee" },
        status: Object.values(ShipStatusEnum)[i % Object.values(ShipStatusEnum).length],
    }));
};

export default function ShipsPage() {
    const [data, setData] = useState<Ship[]>([]);

    useEffect(() => {
        // Simulate API call
        const ships = generateDummyShips(20);
        setData(ships);
    }, []);

    return (
        <div className="container mx-auto py-10">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold tracking-tight">Ships</h1>
            </div>
            <DataTable columns={columns} data={data} searchKey="origin" />
        </div>
    );
}
