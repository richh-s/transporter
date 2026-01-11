"use client";

import { useEffect, useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./columns";
import { LocationEnum, Ship, ShipStatusEnum } from "@/types/ship";
import { shipApi } from "@/lib/api/ships";


export default function ShipsPage() {
    const [data, setData] = useState<Ship[]>([]);

    useEffect(() => {
        const fetchShips = async () => {
            try {
                const response = await shipApi.getShips({ per_page: 100 });
                if (response.data) {
                    setData(response.data.items);
                }
            } catch (error) {
                console.error("Failed to fetch ships", error);
            }
        };

        fetchShips();
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
