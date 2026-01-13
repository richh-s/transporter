"use client";

import { Ship } from "@/types/ship";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Ship as ShipIcon, MapPin, ArrowRight } from "lucide-react";

interface ShipSummaryProps {
    ships: Ship[];
    isLoading?: boolean;
}

export function ShipSummary({ ships, isLoading }: ShipSummaryProps) {
    if (isLoading) {
        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
                {[...Array(4)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div className="h-4 w-24 bg-muted rounded" />
                        </CardHeader>
                        <CardContent>
                            <div className="h-8 w-12 bg-muted rounded" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    const totalShips = ships.length;

    // Calculate route summaries
    const routes = ships.reduce((acc, ship) => {
        const routeKey = `${ship.origin} -> ${ship.destination}`;
        acc[routeKey] = (acc[routeKey] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const routeEntries = Object.entries(routes).sort((a, b) => b[1] - a[1]);

    return (
        <div className="space-y-6 mb-10 flex justify-center">
            <div className="grid gap-6 md:grid-cols-2 w-full max-w-5xl">
                <Card className="hover:shadow-md transition-all duration-300 border-primary/10">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Ships</CardTitle>
                        <ShipIcon className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold tracking-tight">{totalShips}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Current assigned shipments
                        </p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-all duration-300 border-primary/10 flex flex-col">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Route Summary</CardTitle>
                        <MapPin className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent className="flex-1 overflow-hidden">
                        <div className="space-y-3 max-h-[140px] overflow-y-auto pr-2 scrollbar-hide">
                            {routeEntries.map(([route, count]) => {
                                const [origin, destination] = route.split(" -> ");
                                return (
                                    <div key={route} className="flex items-center justify-between group hover:bg-muted/50 p-2 rounded-lg transition-colors border border-transparent hover:border-border">
                                        <div className="flex items-center gap-2 text-sm capitalize">
                                            <span className="font-semibold">{origin.replace(/_/g, " ")}</span>
                                            <ArrowRight className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
                                            <span className="font-semibold">{destination.replace(/_/g, " ")}</span>
                                        </div>
                                        <div className="text-xs font-bold bg-primary/10 text-primary px-2.5 py-1 rounded-full">
                                            {count} {count === 1 ? 'Ship' : 'Ships'}
                                        </div>
                                    </div>
                                );
                            })}
                            {routeEntries.length === 0 && (
                                <p className="text-sm text-muted-foreground text-center py-4">No active routes found</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
