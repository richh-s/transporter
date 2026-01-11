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
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Containers ({containers.length})
                    </DialogTitle>
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
                                        <p className="text-sm text-muted-foreground">Type</p>
                                        <p className="font-medium">{container.container_type || "-"}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Weight</p>
                                        <p className="font-medium">
                                            {container.weight ? `${container.weight} kg` : "-"}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Volume</p>
                                        <p className="font-medium">
                                            {container.volume ? `${container.volume} m³` : "-"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
