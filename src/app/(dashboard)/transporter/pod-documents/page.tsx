"use client";

import React, { useEffect, useState } from "react";
import { ShipItem, Ship, Container } from "@/types/ship";
import { shipApi } from "@/lib/api/ships";
import { ShipItemPodCard } from "@/components/pod/ShipItemPodCard";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Package, Box, AlertCircle, MapPin } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

interface GroupedShip {
  id: number;
  origin: string;
  destination: string;
  pickup_date: string;
  items: ShipItem[];
}

// Stats card (scrollable on mobile, equal gap - same as other pages)
function StatsCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  value: number | string;
  accent: string;
}) {
  return (
    <div className="flex items-center gap-2 p-2 sm:p-2.5 rounded-lg bg-card border border-border/50 shadow-sm h-full">
      <div className={cn("p-1.5 rounded-md", accent)}>
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div>
        <p className="text-base font-bold text-foreground leading-tight">
          {value}
        </p>
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
          {label}
        </p>
      </div>
    </div>
  );
}

// Loading skeleton for POD page
function PodPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-80" />
        </div>
        <div className="flex gap-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-28 rounded-xl" />
          ))}
        </div>
      </div>
      <div className="space-y-8">
        {[1, 2].map((g) => (
          <div key={g} className="space-y-4">
            <Skeleton className="h-16 w-full rounded-lg" />
            <div className="space-y-3 pl-4 border-l-2 border-border">
              <Skeleton className="h-32 w-full rounded-xl" />
              <Skeleton className="h-32 w-full rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
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
                  const shipContainers =
                    (ship.containers as unknown as Record<string, unknown>[]) ||
                    [];
                  // Normalize data for the UI
                  const normalizedTruck =
                    item.assigned_truck || item.truck || null;
                  const normalizedDriver =
                    item.assigned_driver || item.driver || null;

                  // Robust container normalization:
                  // 1. Try item.containers (plural) or item.container (singular)
                  // 2. Look up in parent ship.containers using item.container_id or item.id
                  let normalizedContainers =
                    item.containers || (item.container ? [item.container] : []);

                  if (
                    normalizedContainers.length === 0 &&
                    shipContainers.length > 0
                  ) {
                    const containerId = item.container_id || item.id;
                    const found = shipContainers.find(
                      (c) => c.id === containerId,
                    );
                    if (found)
                      normalizedContainers = [found as unknown as Container];
                  }

                  return {
                    ...item,
                    ship_id: ship.id,
                    origin: ship.origin,
                    destination: ship.destination,
                    pickup_date: ship.pickup_date,
                    assigned_truck: normalizedTruck,
                    assigned_driver: normalizedDriver,
                    containers: normalizedContainers,
                  } as ShipItem;
                })
                .filter((item: ShipItem) => {
                  // Only show items with truck and driver assigned
                  const hasTruck =
                    !!item.assigned_truck ||
                    !!item.truck_id ||
                    !!item.assigned_truck_id;
                  const hasDriver =
                    !!item.assigned_driver ||
                    !!item.driver_id ||
                    !!item.assigned_driver_id;

                  if (!hasTruck || !hasDriver) return false;

                  // Filter out pending status
                  const status = (item.status || "").toLowerCase();
                  if (status === "pending") return false;

                  return true;
                });

              if (filteredItems.length > 0) {
                if (groupsMap.has(ship.id)) {
                  const existingGroup = groupsMap.get(ship.id)!;
                  // Merge unique items from this ship record into the group
                  filteredItems.forEach((item) => {
                    if (
                      !existingGroup.items.find(
                        (i: ShipItem) => i.id === item.id,
                      )
                    ) {
                      existingGroup.items.push(item);
                    }
                  });
                } else {
                  groupsMap.set(ship.id, {
                    id: ship.id,
                    origin: ship.origin || "Unknown",
                    destination: ship.destination || "Unknown",
                    pickup_date: ship.pickup_date || "N/A",
                    items: filteredItems,
                  });
                }
              }
            }
          });

          const finalizedGroups = Array.from(groupsMap.values());
          console.log(
            "POD Page - Finalized grouped shipments:",
            finalizedGroups,
          );
          setGroupedShips(finalizedGroups);
        }
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load shipments";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchShipItems();
  }, []);

  const totalItems = groupedShips.reduce((acc, g) => acc + g.items.length, 0);
  const totalContainers = groupedShips.reduce(
    (acc, g) =>
      acc +
      g.items.reduce((sum, item) => sum + (item.containers?.length || 0), 0),
    0,
  );

  if (loading) {
    return (
      <div className="flex flex-col h-full space-y-4 sm:space-y-6 animate-in fade-in duration-300 pb-10 sm:pb-6 w-full overflow-x-hidden">
        <div className="shrink-0 px-0">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-4 w-80 mt-2" />
        </div>
        <PodPageSkeleton />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full space-y-3 sm:space-y-4 animate-in fade-in duration-300 pb-10 sm:pb-6 w-full overflow-x-hidden">
      <div className="shrink-0 px-0">
        <h1 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
          POD & Returning Documents
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Upload and manage Proof of Delivery and Container Return Receipts.
        </p>
      </div>

      {groupedShips.length > 0 && (
        <div className="w-full shrink-0">
          <div className="grid grid-cols-3 gap-3 w-full">
            <StatsCard
              icon={FileText}
              label="Shipments"
              value={groupedShips.length}
              accent="bg-primary/10 text-primary"
            />
            <StatsCard
              icon={Package}
              label="Items"
              value={totalItems}
              accent="bg-primary/10 text-primary"
            />
            <StatsCard
              icon={Box}
              label="Containers"
              value={totalContainers}
              accent="bg-primary/10 text-primary"
            />
          </div>
        </div>
      )}

      {error && (
        <Alert variant="destructive" className="shrink-0">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex-1 min-h-0 min-w-0 overflow-y-auto overflow-x-hidden">
        {groupedShips.length === 0 && !error ? (
          <div className="text-center py-12 bg-muted/20 rounded-xl border border-dashed border-border">
            <h3 className="text-lg font-medium text-muted-foreground">
              No eligible shipments found
            </h3>
            <p className="text-sm text-muted-foreground mt-2">
              Shipments with assigned truck and driver will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4 min-w-0">
            {groupedShips.map((group) => {
              const containerCount = group.items.reduce(
                (acc, item) => acc + (item.containers?.length || 0),
                0,
              );
              return (
                <div key={group.id} className="space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 bg-muted/50 px-3 py-2 rounded-lg border border-border/50">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <h2 className="text-base font-bold">
                        Shipment #{group.id}
                      </h2>
                      <span className="px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-medium">
                        {group.items.length}{" "}
                        {group.items.length === 1 ? "Item" : "Items"}
                      </span>
                      <span className="px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 text-[10px] font-medium">
                        {containerCount} Containers
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-muted-foreground sm:text-right">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 shrink-0 text-muted-foreground" />
                        <span className="capitalize">
                          {group.origin.replace(/_/g, " ")}
                        </span>
                        <span>→</span>
                        <span className="capitalize">
                          {group.destination.replace(/_/g, " ")}
                        </span>
                      </span>
                      <span className="sm:ml-1">
                        Pickup:{" "}
                        {new Date(group.pickup_date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="grid gap-2 border-l-2 border-primary/20 pl-3 min-w-0">
                    {group.items.map((item) => (
                      <ShipItemPodCard key={item.id} shipItem={item} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
