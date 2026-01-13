"use client";

import { Container } from "@/types/ship";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Package } from "lucide-react";

interface ContainersModalProps {
    containers: Container[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ContainersModal({ containers, open, onOpenChange }: ContainersModalProps) {
    const totalWeight = containers.reduce((sum, c) => sum + (c.gross_weight || c.weight || 0), 0);
    const totalVolume = containers.reduce((sum, c) => sum + (c.volume || 0), 0);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <DialogTitle className="flex items-center gap-2">
                            <Package className="h-5 w-5" />
                            Containers ({containers.length})
                        </DialogTitle>
                        {containers.length > 0 && (
                            <div className="flex items-center gap-3">
                                <Badge variant="outline" className="text-brand-primary border-brand-primary/20">
                                    Total Weight: {totalWeight.toLocaleString()} kg
                                </Badge>
                                <Badge variant="outline" className="text-brand-secondary border-brand-secondary/20">
                                    Total Volume: {totalVolume.toLocaleString()} m³
                                </Badge>
                            </div>
                        )}
                    </div>
                </DialogHeader>

                <div className="space-y-4 mt-4">
                    {containers.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">No containers available</p>
                    ) : (
                        containers.map((container, index) => (
                            <div key={container.id} className="border rounded-lg p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-semibold text-lg">Container #{index + 1}</h3>
                                    <Badge
                                        variant={
                                            container.status === "DELIVERED"
                                                ? "default"
                                                : container.status === "IN_TRANSIT"
                                                    ? "secondary"
                                                    : "outline"
                                        }
                                    >
                                        {container.status || "N/A"}
                                    </Badge>
                                </div>

                                <Separator />

                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Container ID</p>
                                        <p className="font-medium">{container.id}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Container Number</p>
                                        <p className="font-medium">{container.container_number || "-"}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Type & Size</p>
                                        <p className="font-medium text-sm">
                                            {container.container_type || "-"} {container.container_size ? `(${container.container_size})` : ""}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Truck Recommendation</p>
                                        <Badge variant="outline" className="capitalize mt-0.5">
                                            {container.recommended_truck_type || "Standard"}
                                        </Badge>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Returning</p>
                                        <Badge variant={container.is_returning ? "default" : "secondary"} className="mt-0.5">
                                            {container.is_returning ? "Yes" : "No"}
                                        </Badge>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Weight</p>
                                        <p className="font-medium text-sm">
                                            {container.gross_weight || container.weight ? `${container.gross_weight || container.weight} ${container.gross_weight_unit || 'kg'}` : "-"}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Volume</p>
                                        <p className="font-medium text-sm">
                                            {container.volume ? `${container.volume} m³` : "-"}
                                        </p>
                                    </div>
                                    {container.container_details?.commodity && (
                                        <div className="md:col-span-2 lg:col-span-3">
                                            <p className="text-sm text-muted-foreground">Commodities</p>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {container.container_details.commodity.map((c, i) => (
                                                    <Badge key={i} variant="secondary" className="text-[10px] uppercase">
                                                        {c}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {container.container_details?.instruction && (
                                        <div className="md:col-span-2 lg:col-span-3">
                                            <p className="text-sm text-muted-foreground">Instructions</p>
                                            <p className="text-sm italic text-muted-foreground mt-1 bg-muted/50 p-2 rounded border border-dashed">
                                                "{container.container_details.instruction}"
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
