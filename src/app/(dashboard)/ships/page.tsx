"use client";

import { useRouter } from "next/navigation";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./columns";
import { useShips } from "@/hooks/use-ships";


export default function ShipsPage() {
    const router = useRouter();

    const { data, isLoading } = useShips({
        per_page: 100,
    });

    const ships = data?.items || [];

    return (
        <div className="container mx-auto py-10">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold tracking-tight">Ships</h1>
            </div>

            <DataTable
                columns={columns}
                data={ships}
                isLoading={isLoading}
                onRowClick={(row) => router.push(`/ships/${row.id}`)}
            />
        </div>
    );
}
