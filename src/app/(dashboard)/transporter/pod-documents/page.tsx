"use client";

import React, { useEffect, useState } from "react";
import { ShipItem, ShipStatusEnum } from "@/types/ship";
import { shipApi } from "@/lib/api/ships";
import { ShipItemPodCard } from "@/components/pod/ShipItemPodCard";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function PodDocumentsPage() {
    const [loading, setLoading] = useState(true);
    const [shipItems, setShipItems] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchShipItems = async () => {
            try {
                setLoading(true);
                // Requirement: 
                // - Only show ship items with both truck AND driver assigned
                // - Only show ship items where ship status allows document upload

                // Fetch ships using the updated endpoint /transporter/ship/
                const response = await shipApi.getShips({ per_page: 100 });

                if (response.data && response.data.items) {
                    const allItems: any[] = [];

                    response.data.items.forEach(ship => {
                        if (ship.ship_items) {
                            const enrichedItems = ship.ship_items.map(item => ({
                                ...item,
                                origin: ship.origin,
                                destination: ship.destination,
                                pickup_date: ship.pickup_date
                            }));
                            allItems.push(...enrichedItems);
                        }
                    });

                    const filtered = allItems.filter(item => {
                        // 1. Assigned Truck and Driver
                        const hasTruck = !!item.assigned_truck || !!item.truck_id;
                        const hasDriver = !!item.assigned_driver || !!item.driver_id;

                        if (!hasTruck || !hasDriver) return false;

                        // 2. Status check
                        const status = item.status;
                        const s = status.toLowerCase();
                        if (s === 'created' || s === 'pending') return false;

                        return true;
                    });
                    setShipItems(filtered);
                }
            } catch (err: any) {
                setError(err.message || "Failed to load shipments");
            } finally {
                setLoading(false);
            }
        };

        fetchShipItems();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[50vh]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">POD & Returning Documents</h1>
                    <p className="text-muted-foreground">
                        Upload and manage Proof of Delivery and Container Return Receipts.
                    </p>
                </div>
            </div>

            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {shipItems.length === 0 && !error ? (
                <div className="text-center py-12 bg-muted/20 rounded-lg border border-dashed">
                    <h3 className="text-lg font-medium text-muted-foreground">No eligible shipments found</h3>
                    <p className="text-sm text-muted-foreground mt-2">
                        Shipments with assigned truck and driver will appear here.
                    </p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {shipItems.map((item) => (
                        <ShipItemPodCard key={item.id} shipItem={item} />
                    ))}
                </div>
            )}
        </div>
    );
}
