"use client";

import { useTrackShip, useShip } from "@/hooks/use-ships";
import { TrackingTruck } from "@/types/ship";
import { Card, CardContent } from "@/components/ui/card";
import {
    ArrowLeft,
    Calendar,
    Truck,
    Package,
    Navigation2,
    Loader2,
    AlertCircle,
    CheckCircle2,
    Clock,
    FileText,
    DollarSign,
    ThumbsUp,
    Box,
    ClipboardCheck,
    Send,
    MapPin,
    CircleCheckBig,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

// Status steps with icons matching the CS portal
const STATUS_STEPS = [
    { key: "created", label: "Created", icon: FileText },
    { key: "price_requested", label: "Price Requested", icon: DollarSign },
    { key: "priced", label: "Priced", icon: DollarSign },
    { key: "accepted_by_shipper", label: "Accepted", icon: ThumbsUp },
    { key: "allocated", label: "Allocated", icon: Box },
    { key: "ready_for_pickup", label: "Ready for Pickup", icon: ClipboardCheck },
    { key: "in_transit", label: "In Transit", icon: Send },
    { key: "delivered", label: "Delivered", icon: MapPin },
    { key: "completed", label: "Completed", icon: CircleCheckBig },
];

function getStatusIndex(status: string): number {
    return STATUS_STEPS.findIndex(
        (s) => s.key === status?.toLowerCase().replace(/ /g, "_"),
    );
}

function StatusBadge({ status }: { status: string }) {
    const normalized = status?.toLowerCase().replace(/ /g, "_");
    const colorMap: Record<string, string> = {
        created: "bg-slate-100 text-slate-700 border-slate-200",
        price_requested: "bg-orange-100 text-orange-700 border-orange-200",
        priced: "bg-purple-100 text-purple-700 border-purple-200",
        accepted_by_shipper: "bg-emerald-100 text-emerald-700 border-emerald-200",
        allocated: "bg-indigo-100 text-indigo-700 border-indigo-200",
        ready_for_pickup: "bg-lime-100 text-lime-700 border-lime-200",
        started: "bg-blue-100 text-blue-700 border-blue-200",
        in_transit: "bg-amber-100 text-amber-700 border-amber-200",
        delivered: "bg-cyan-100 text-cyan-700 border-cyan-200",
        completed: "bg-emerald-100 text-emerald-700 border-emerald-200",
    };
    const cls =
        colorMap[normalized] || "bg-slate-100 text-slate-700 border-slate-200";
    return (
        <span
            className={cn(
                "inline-flex items-center px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider border",
                cls,
            )}
        >
            {status?.replace(/_/g, " ") || "Unknown"}
        </span>
    );
}

function StatusTimeline({ currentStatus }: { currentStatus: string }) {
    const activeIdx = getStatusIndex(currentStatus);

    return (
        <Card className="border border-border bg-card">
            <CardContent className="p-6">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-8">
                    <Clock className="h-4 w-4 text-emerald-600" />
                    Status Timeline
                </h3>
                <div className="relative flex items-start justify-between">
                    {STATUS_STEPS.map((step, idx) => {
                        const isCompleted = idx <= activeIdx;
                        const isCurrent = idx === activeIdx;
                        const StepIcon = step.icon;

                        return (
                            <div
                                key={step.key}
                                className="flex flex-col items-center relative z-10"
                                style={{ width: `${100 / STATUS_STEPS.length}%` }}
                            >
                                {/* Connector line */}
                                {idx > 0 && (
                                    <div
                                        className={cn(
                                            "absolute top-[18px] h-[3px] -translate-y-1/2 right-1/2",
                                            isCompleted ? "bg-emerald-500" : "bg-gray-200",
                                        )}
                                        style={{ width: "100%" }}
                                    />
                                )}

                                {/* Circle with icon */}
                                <div
                                    className={cn(
                                        "relative h-9 w-9 rounded-full flex items-center justify-center border-2 transition-all",
                                        isCompleted
                                            ? "bg-emerald-500 border-emerald-500 text-white"
                                            : "bg-white border-gray-200 text-gray-400",
                                        isCurrent && "ring-4 ring-emerald-100",
                                    )}
                                >
                                    {isCompleted ? (
                                        <CheckCircle2 className="h-5 w-5 text-white" />
                                    ) : (
                                        <StepIcon className="h-4 w-4" />
                                    )}
                                </div>

                                {/* Label */}
                                <span
                                    className={cn(
                                        "text-[11px] mt-2.5 text-center leading-tight max-w-[72px]",
                                        isCurrent
                                            ? "text-emerald-700 font-bold"
                                            : isCompleted
                                                ? "text-emerald-600 font-medium"
                                                : "text-gray-400 font-medium",
                                    )}
                                >
                                    {step.label}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}

function AssignedTruckCard({ truck }: { truck: TrackingTruck }) {
    const shipItem = truck.ship_item;
    const containers = shipItem.containers || [];

    return (
        <Card className="border border-border bg-card">
            <CardContent className="p-5">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                            <Truck className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm font-bold">Truck #{truck.truck_id}</p>
                        </div>
                    </div>
                    <span className="text-sm text-muted-foreground">
                        {truck.count_location_log} GPS points
                    </span>
                </div>

                {/* Containers */}
                {containers.length > 0 && (
                    <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                            Containers ({containers.length})
                        </p>
                        {containers.map((c, idx) => (
                            <div
                                key={idx}
                                className="flex items-center justify-between p-3 rounded-lg border border-border bg-background"
                            >
                                <div className="flex items-center gap-2">
                                    <Package className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm font-semibold">
                                        {c.container_number}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <span className="capitalize">
                                        {c.container_size?.replace(/_/g, " ").replace("feet", "ft")}
                                    </span>
                                    <span>/</span>
                                    <span className="capitalize">{c.container_type}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

interface ShipTrackingViewProps {
    shipId: string;
    onBack: () => void;
}

export function ShipTrackingView({ shipId, onBack }: ShipTrackingViewProps) {
    const {
        data: trackData,
        isLoading: isTrackLoading,
        error: trackError,
    } = useTrackShip(shipId);

    const {
        data: ship,
        isLoading: isShipLoading,
    } = useShip(shipId);

    const isLoading = isTrackLoading || isShipLoading;
    const error = trackError;

    const trucks: TrackingTruck[] = trackData?.result || [];

    // Compute aggregate info
    const totalContainers = trucks.reduce(
        (sum, t) => sum + (t.ship_item.containers?.length || 0),
        0,
    );
    const shipStatus = ship?.status || trucks[0]?.ship_item.status || "";
    const origin = ship?.origin || trucks[0]?.ship_item.origin;
    const destination = ship?.destination || trucks[0]?.ship_item.destination;
    const pickupDate = ship?.pickup_date || trucks[0]?.ship_item.pickup_date;
    const deliveryDate = ship?.delivery_date || trucks[0]?.ship_item.delivery_date;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-16">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                    <p className="text-sm text-muted-foreground">
                        Fetching tracking data...
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <Card className="border-destructive/50 bg-destructive/5">
                <CardContent className="p-6 flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
                    <p className="text-sm text-destructive">
                        {(error as Error).message || "Failed to fetch tracking data"}
                    </p>
                </CardContent>
            </Card>
        );
    }

    if (trucks.length === 0) {
        return (
            <div className="space-y-4">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Ship Details
                </button>
                <Card className="border border-border bg-card">
                    <CardContent className="p-8 flex flex-col items-center gap-3">
                        <Package className="h-10 w-10 text-muted-foreground/40" />
                        <p className="text-sm text-muted-foreground">
                            No tracking data found for Ship #{shipId}
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-5 animate-in fade-in duration-300">
            {/* Track Shipment Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button
                        onClick={onBack}
                        className="p-1.5 rounded-md hover:bg-muted transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <div>
                        <h2 className="text-xl font-bold">Track Shipment</h2>
                    </div>
                </div>
                <StatusBadge status={shipStatus} />
            </div>

            {/* Route + Stats Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                {/* Route card */}
                <Card className="lg:col-span-3 border border-border bg-card">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            {/* Origin */}
                            <div className="flex-1">
                                <div className="flex items-center gap-1.5 mb-1.5">
                                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                        Origin
                                    </span>
                                </div>
                                <p className="text-xl font-bold capitalize">
                                    {origin?.replace(/_/g, " ") || "—"}
                                </p>
                                {pickupDate && (
                                    <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
                                        <Calendar className="h-3.5 w-3.5" />
                                        {format(new Date(pickupDate), "MMMM d, yyyy")}
                                    </div>
                                )}
                            </div>

                            {/* Arrow / Truck icon */}
                            <div className="flex flex-col items-center mx-6">
                                <div className="flex items-center gap-1">
                                    <div className="w-16 h-px bg-muted-foreground/30" />
                                    <div className="p-2 rounded-full bg-muted border">
                                        <Truck className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <div className="w-16 h-px bg-muted-foreground/30" />
                                </div>
                            </div>

                            {/* Destination */}
                            <div className="flex-1 text-right">
                                <div className="flex items-center justify-end gap-1.5 mb-1.5">
                                    <span className="h-2 w-2 rounded-full bg-red-500" />
                                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                        Destination
                                    </span>
                                </div>
                                <p className="text-xl font-bold capitalize">
                                    {destination?.replace(/_/g, " ") || "—"}
                                </p>
                                {deliveryDate && (
                                    <div className="flex items-center justify-end gap-1.5 mt-2 text-xs text-muted-foreground">
                                        <Calendar className="h-3.5 w-3.5" />
                                        {format(new Date(deliveryDate), "MMMM d, yyyy")}
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Stats */}
                <Card className="border border-border bg-card">
                    <CardContent className="p-5 space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-md bg-emerald-500/10">
                                <Package className="h-4 w-4 text-emerald-600" />
                            </div>
                            <div>
                                <span className="text-xs text-muted-foreground">
                                    Shipment ID
                                </span>
                                <p className="text-lg font-bold">#{shipId}</p>
                            </div>
                        </div>

                        <div className="border-t border-border pt-3 space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="p-1.5 rounded-md bg-blue-500/10">
                                    <Truck className="h-3.5 w-3.5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        Trucks Assigned
                                    </p>
                                    <p className="text-base font-bold">{trucks.length}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-1.5 rounded-md bg-purple-500/10">
                                    <Package className="h-3.5 w-3.5 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Containers</p>
                                    <p className="text-base font-bold">{totalContainers}</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Status Timeline */}
            <StatusTimeline currentStatus={shipStatus} />

            {/* Assigned Trucks */}
            <div>
                <h3 className="text-base font-bold flex items-center gap-2 mb-4">
                    <Truck className="h-5 w-5" />
                    Assigned Trucks ({trucks.length})
                </h3>
                <div className="space-y-3">
                    {trucks.map((truck) => (
                        <AssignedTruckCard key={truck.truck_id} truck={truck} />
                    ))}
                </div>
            </div>
        </div>
    );
}
