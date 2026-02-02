"use client";

import React, { useEffect, useState } from "react";
import { ShipItem, Ship, Container } from "@/types/ship";
import { shipApi } from "@/lib/api/ships";
import { ShipItemPodCard } from "@/components/pod/ShipItemPodCard";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface GroupedShip {
    id: number;
    origin: string;
    destination: string;
    pickup_date: string;
    items: ShipItem[];
}

export default function PodDocumentsPage() {
    const [loading, setLoading] = useState(true);
    const [groupedShips, setGroupedShips] = useState<GroupedShip[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchShipItems = async () => {
            try {
                setLoading(true);
                // Use getShips because getShipItems returned 404.
                // Note: The backend may return duplicate Ship entries in the list if there are multiple assignments;
                // our grouping logic below handles deduplication and merging correctly.
                const response = await shipApi.getShips({ per_page: 100 });
                console.log("POD Page - Raw getShips response:", response.data);

                if (response.data && response.data.items) {
                    const groupsMap = new Map<number, GroupedShip>();

                    (response.data.items as Ship[]).forEach((ship: Ship) => {
                        if (ship.ship_items && ship.ship_items.length > 0) {
                            const filteredItems = ship.ship_items
                                .map((item: ShipItem) => {
                                    const shipContainers = (ship.containers as unknown as Record<string, unknown>[]) || [];
                                    // Normalize data for the UI
                                    const normalizedTruck = item.assigned_truck || item.truck || null;
                                    const normalizedDriver = item.assigned_driver || item.driver || null;

                                    // Robust container normalization:
                                    // 1. Try item.containers (plural) or item.container (singular)
                                    // 2. Look up in parent ship.containers using item.container_id or item.id
                                    let normalizedContainers = item.containers || (item.container ? [item.container] : []);

                                    if (normalizedContainers.length === 0 && shipContainers.length > 0) {
                                        const containerId = (item.container_id || item.id);
                                        const found = shipContainers.find((c) => c.id === containerId);
                                        if (found) normalizedContainers = [found as unknown as Container];
                                    }

                                    return {
                                        ...item,
                                        ship_id: ship.id,
                                        origin: ship.origin,
                                        destination: ship.destination,
                                        pickup_date: ship.pickup_date,
                                        assigned_truck: normalizedTruck,
                                        assigned_driver: normalizedDriver,
                                        containers: normalizedContainers
                                    } as ShipItem;
                                })
                                .filter((item: ShipItem) => {
                                    // Only show items with truck and driver assigned
                                    const hasTruck = !!item.assigned_truck || !!item.truck_id || !!item.assigned_truck_id;
                                    const hasDriver = !!item.assigned_driver || !!item.driver_id || !!item.assigned_driver_id;

                                    if (!hasTruck || !hasDriver) return false;

                                    // Filter out pending status
                                    const status = (item.status || "").toLowerCase();
                                    if (status === 'pending') return false;

                                    return true;
                                });

                            if (filteredItems.length > 0) {
                                if (groupsMap.has(ship.id)) {
                                    const existingGroup = groupsMap.get(ship.id)!;
                                    // Merge unique items from this ship record into the group
                                    filteredItems.forEach(item => {
                                        if (!existingGroup.items.find((i: ShipItem) => i.id === item.id)) {
                                            existingGroup.items.push(item);
                                        }
                                    });
                                } else {
                                    groupsMap.set(ship.id, {
                                        id: ship.id,
                                        origin: ship.origin || "Unknown",
                                        destination: ship.destination || "Unknown",
                                        pickup_date: ship.pickup_date || "N/A",
                                        items: filteredItems
                                    });
                                }
                            }
                        }
                    });

                    const finalizedGroups = Array.from(groupsMap.values());
                    console.log("POD Page - Finalized grouped shipments:", finalizedGroups);
                    setGroupedShips(finalizedGroups);
                }
            } catch (err: unknown) {
                const errorMessage = err instanceof Error ? err.message : "Failed to load shipments";
                setError(errorMessage);
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

            {groupedShips.length === 0 && !error ? (
                <div className="text-center py-12 bg-muted/20 rounded-lg border border-dashed">
                    <h3 className="text-lg font-medium text-muted-foreground">No eligible shipments found</h3>
                    <p className="text-sm text-muted-foreground mt-2">
                        Shipments with assigned truck and driver will appear here.
                    </p>
                </div>
            ) : (
                <div className="space-y-8">
                    {groupedShips.map((group) => (
                        <div key={group.id} className="space-y-4">
                            <div className="flex items-center gap-4 bg-muted/50 p-4 rounded-lg border border-border/50">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-lg font-bold">Shipment #{group.id}</h2>
                                        <div className="flex gap-2">
                                            <div className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                                                {group.items.length} {group.items.length === 1 ? 'Item' : 'Items'}
                                            </div>
                                            <div className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 text-xs font-medium">
                                                {group.items.reduce((acc, item) => acc + (item.containers?.length || 0), 0)} Containers
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                        <span className="capitalize">{group.origin.replace(/_/g, " ")}</span>
                                        <span>→</span>
                                        <span className="capitalize">{group.destination.replace(/_/g, " ")}</span>
                                        <span className="mx-2">•</span>
                                        <span>Pickup: {new Date(group.pickup_date).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="grid gap-4 pl-4 border-l-2 border-primary/20">
                                {group.items.map((item) => (
                                    <ShipItemPodCard key={item.id} shipItem={item} />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
