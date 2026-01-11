"use client";

import { useEffect, useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./columns";
import { Ship } from "@/types/ship";
import { shipApi } from "@/lib/api/ships";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

const LOCATIONS = [
    { value: "addis_ababa", label: "Addis Ababa" },
    { value: "adama", label: "Adama" },
    { value: "bahir_dar", label: "Bahir Dar" },
    { value: "dire_dawa", label: "Dire Dawa" },
    { value: "hawassa", label: "Hawassa" },
    { value: "jimma", label: "Jimma" },
    { value: "mekelle", label: "Mekelle" },
    { value: "gondar", label: "Gondar" },
    { value: "dessie", label: "Dessie" },
    { value: "arbaminch", label: "Arbaminch" },
    { value: "djibouti", label: "Djibouti" },
];

export default function ShipsPage() {
    const [data, setData] = useState<Ship[]>([]);
    const [loading, setLoading] = useState(false);
    const [origin, setOrigin] = useState<string>("");
    const [destination, setDestination] = useState<string>("");

    const fetchShips = async () => {
        setLoading(true);
        try {
            const params: any = { per_page: 100 };
            if (origin) params.origin = origin;
            if (destination) params.destination = destination;

            const response = await shipApi.getShips(params);
            if (response.data) {
                setData(response.data.items);
            }
        } catch (error) {
            console.error("Failed to fetch ships", error);
        } finally {
            setLoading(false);
        }
    };

    // Debounce filter changes
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchShips();
        }, 500); // Wait 500ms after user stops selecting

        return () => clearTimeout(timer);
    }, [origin, destination]);

    const clearFilters = () => {
        setOrigin("");
        setDestination("");
    };

    const hasActiveFilters = origin || destination;

    return (
        <div className="container mx-auto py-10">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold tracking-tight">Ships</h1>
            </div>

            {/* Filters */}
            <div className="flex gap-4 mb-6 items-end">
                <div className="flex-1 max-w-xs">
                    <label className="text-sm font-medium mb-2 block">Origin</label>
                    <Select value={origin} onValueChange={setOrigin}>
                        <SelectTrigger>
                            <SelectValue placeholder="All origins" />
                        </SelectTrigger>
                        <SelectContent>
                            {LOCATIONS.map((location) => (
                                <SelectItem key={location.value} value={location.value}>
                                    {location.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex-1 max-w-xs">
                    <label className="text-sm font-medium mb-2 block">Destination</label>
                    <Select value={destination} onValueChange={setDestination}>
                        <SelectTrigger>
                            <SelectValue placeholder="All destinations" />
                        </SelectTrigger>
                        <SelectContent>
                            {LOCATIONS.map((location) => (
                                <SelectItem key={location.value} value={location.value}>
                                    {location.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {hasActiveFilters && (
                    <Button
                        variant="outline"
                        onClick={clearFilters}
                        className="flex items-center gap-2"
                    >
                        <X className="h-4 w-4" />
                        Clear Filters
                    </Button>
                )}
            </div>

            <DataTable columns={columns} data={data} searchKey="origin" />
        </div>
    );
}
