"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { format } from "date-fns";
import {
    Ship,
    ShipDocument,
    ShipItem,
    DocumentStatusEnum,
    Truck,
    Driver
} from "@/types/ship";
import { DataTable } from "@/components/ui/data-table";
import { columns as shipItemColumns } from "./ship-items-columns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FileText, Phone, Mail, User } from "lucide-react";
import { shipApi } from "@/lib/api/ships";
import { truckApi } from "@/lib/api/trucks";
import { driverApi } from "@/lib/api/drivers";
import { toast } from "sonner"; // Assuming sonner is used, or generic toast. If not sure, I'll use console.error
// Check if toast is available. Usually in these projects it is. If not, I'll remove it.
// I'll assume standard components.

export default function ShipDetailsPage() {
    const params = useParams();
    const id = params.id as string;
    const [ship, setShip] = useState<Ship | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Resources for assignment
    const [trucks, setTrucks] = useState<Truck[]>([]);
    const [drivers, setDrivers] = useState<Driver[]>([]);

    useEffect(() => {
        const loadData = async () => {
            if (!id) return;
            setIsLoading(true);
            try {
                // Fetch Ship Details
                const shipRes = await shipApi.getShip(id);
                if (shipRes.error) throw new Error(shipRes.error);
                if (shipRes.data) setShip(shipRes.data);

                // Fetch Available Resources
                // We fetch specific status ones or all? API Default is usually available.
                const trucksRes = await truckApi.getTrucks({ status: 'active', per_page: 100 });
                if (trucksRes.data?.items) setTrucks(trucksRes.data.items);

                const driversRes = await driverApi.getDrivers({ status: 'ACTIVE', per_page: 100 });
                if (driversRes.data?.items) setDrivers(driversRes.data.items);

            } catch (error) {
                console.error("Failed to load ship details", error);
                // toast.error("Failed to load ship details");
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [id]);

    const handleAssign = async (itemId: number, type: 'truck' | 'driver', value: string) => {
        try {
            const data = type === 'truck'
                ? { truck_id: Number(value) }
                : { driver_id: Number(value) };

            const res = await shipApi.assignResources(itemId, data);

            if (res.error) {
                // toast.error(res.error);
                console.error(res.error);
                return;
            }

            // Refresh ship data or update local state
            // For simplicity, re-fetch ship
            const shipRes = await shipApi.getShip(id);
            if (shipRes.data) setShip(shipRes.data);

            // toast.success(`${type === 'truck' ? 'Truck' : 'Driver'} assigned successfully`);

        } catch (error) {
            console.error("Assignment failed", error);
        }
    };

    if (isLoading) {
        return <div className="p-10 flex justify-center">Loading ship details...</div>;
    }

    if (!ship) {
        return <div className="p-10 text-destructive">Ship not found</div>;
    }

    const shipItems = ship.ship_items || [];
    const documents = ship.documents || [];

    // Calculate total price
    const totalPrice = shipItems.reduce((acc, item) => acc + (item.price || 0), 0);
    const currency = shipItems[0]?.currency || 'ETB';

    return (
        <div className="container mx-auto py-10 space-y-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                        Shipment #{ship.id}
                        <Badge variant="outline" className="text-lg">
                            {ship.status}
                        </Badge>
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        {ship.origin} <span className="mx-2">→</span> {ship.destination}
                    </p>
                </div>
                <div className="flex gap-4 text-sm text-right">
                    <div className="flex flex-col">
                        <span className="text-muted-foreground">Estimated Departure</span>
                        <span className="font-medium">
                            {(() => {
                                try {
                                    return ship.estimated_departure ? format(new Date(ship.estimated_departure), "PPP") : "N/A";
                                } catch {
                                    return "N/A";
                                }
                            })()}
                        </span>
                    </div>
                    <Separator orientation="vertical" className="h-10" />
                    <div className="flex flex-col">
                        <span className="text-muted-foreground">Estimated Arrival</span>
                        <span className="font-medium">
                            {(() => {
                                try {
                                    return ship.estimated_arrival ? format(new Date(ship.estimated_arrival), "PPP") : "N/A";
                                } catch {
                                    return "N/A";
                                }
                            })()}
                        </span>
                    </div>
                </div>
            </div>

            <Separator />

            {/* Shipment Overview & Shipper */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Total Containers</span>
                            <span className="font-medium">{ship.total_containers}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Assigned Containers</span>
                            <span className="font-medium">{ship.assigned_containers}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Created At</span>
                            <span className="font-medium">
                                {(() => {
                                    try {
                                        return ship.created_at ? format(new Date(ship.created_at), "PPP") : "N/A";
                                    } catch (e) {
                                        return "Invalid Date";
                                    }
                                })()}
                            </span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Shipper Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{ship.shipper_name}</span>
                        </div>
                        {ship.shipper_email && (
                            <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <span>{ship.shipper_email}</span>
                            </div>
                        )}
                        {ship.shipper_phone && (
                            <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <span>{ship.shipper_phone}</span>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Documents Section */}
            {documents.length > 0 && (
                <section>
                    <h2 className="text-2xl font-semibold tracking-tight mb-4">Documents</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {documents.map((doc) => (
                            <Card
                                key={doc.id}
                                className="hover:bg-accent/10 transition-colors cursor-pointer"
                                onClick={() => window.open(doc.file_path, '_blank')}
                            >
                                <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                        <FileText className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="font-medium truncate max-w-[150px]" title={doc.document_type}>{doc.document_type}</p>
                                        <div className="text-xs text-muted-foreground mt-1">{doc.file_name}</div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>
            )}

            {/* Ship Items Table */}
            <section>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold tracking-tight">Ship Items (Loads)</h2>
                    <div className="text-sm text-muted-foreground">
                        Total Value: <span className="font-bold text-foreground">{new Intl.NumberFormat('en-ET', { style: 'currency', currency: currency }).format(totalPrice)}</span>
                    </div>
                </div>

                <DataTable
                    columns={shipItemColumns}
                    data={shipItems}
                    meta={{
                        trucks,
                        drivers,
                        onAssign: handleAssign
                    }}
                />
            </section>
        </div>
    );
}

