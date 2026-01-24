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
        <div className="space-y-6 mb-10 w-full">
            <div className="grid gap-6 md:grid-cols-2">
                {/* Total Ships Card */}
                <Card className="relative overflow-hidden border-none bg-gradient-to-br from-primary/10 via-background to-background shadow-lg shadow-primary/5 hover:shadow-xl hover:shadow-primary/10 transition-all duration-500 group">
                    {/* Decorative Background Element */}
                    <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/5 blur-3xl group-hover:bg-primary/10 transition-colors" />

                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                        <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Total Ships</CardTitle>
                        <div className="p-2 rounded-xl bg-primary/10 text-primary group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                            <ShipIcon className="h-5 w-5" />
                        </div>
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <div className="flex items-baseline gap-2">
                            <div className="text-5xl font-extrabold tracking-tight text-foreground">{totalShips}</div>
                            <div className="text-sm font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                                </span>
                                Active
                            </div>
                        </div>
                        <p className="text-sm text-secondary mt-2 font-medium">
                            Manage and track your assigned shipments
                        </p>
                    </CardContent>
                </Card>

                {/* Route Summary Card */}
                <Card className="relative overflow-hidden border-none bg-gradient-to-br from-secondary/5 via-background to-background shadow-lg hover:shadow-xl transition-all duration-500 flex flex-col group">
                    {/* Decorative Background Element */}
                    <div className="absolute -left-8 -bottom-8 h-32 w-32 rounded-full bg-secondary/5 blur-3xl group-hover:bg-secondary/10 transition-colors" />

                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                        <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Route Summary</CardTitle>
                        <div className="p-2 rounded-xl bg-red-500/10 text-red-500 transition-all">
                            <MapPin className="h-5 w-5" />
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 min-h-0 relative z-10">
                        <div className="space-y-4 max-h-[160px] overflow-y-auto pr-2 scrollbar-hide custom-scrollbar">
                            {routeEntries.map(([route, count]) => {
                                const [origin, destination] = route.split(" -> ");
                                return (
                                    <div
                                        key={route}
                                        className="group/item flex items-center justify-between p-3 rounded-2xl bg-card/40 dark:bg-card/20 backdrop-blur-sm border border-border/50 hover:border-primary/30 hover:bg-card/60 dark:hover:bg-card/40 transition-all duration-300 shadow-sm hover:shadow-md"
                                    >
                                        <div className="flex items-center gap-3 text-sm">
                                            <div className="flex flex-col">
                                                <span className="text-xs text-muted-foreground font-medium uppercase tracking-tight">Origin</span>
                                                <span className="font-bold text-foreground capitalize">{origin.replace(/_/g, " ")}</span>
                                            </div>
                                            <div className="flex flex-col items-center px-1">
                                                <ArrowRight className="h-4 w-4 text-primary opacity-40 group-hover/item:opacity-100 group-hover/item:translate-x-1 transition-all" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-xs text-muted-foreground font-medium uppercase tracking-tight">Destination</span>
                                                <span className="font-bold text-foreground capitalize">{destination.replace(/_/g, " ")}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="px-3 py-1 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-sm shadow-primary/20">
                                                {count} {count === 1 ? 'Ship' : 'Ships'}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            {routeEntries.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground opacity-50">
                                    <ShipIcon className="h-8 w-8 mb-2" />
                                    <p className="text-sm font-medium">No active routes found</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
