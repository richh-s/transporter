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
import { Package, Scale, Move, Truck, Info, CheckCircle2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

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
            <DialogContent className="w-[95vw] sm:max-w-4xl max-h-[90vh] overflow-y-auto p-0 border-none bg-background/95 backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden shadow-primary/5">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none" />

                <DialogHeader className="p-6 pb-2 border-b border-border/40 relative z-10">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <DialogTitle className="flex items-center gap-3 text-2xl font-bold tracking-tight text-foreground">
                            <div className="p-2.5 rounded-2xl bg-primary/10 text-primary shadow-inner">
                                <Package className="h-6 w-6" />
                            </div>
                            Containers
                            <span className="text-muted-foreground/40 font-normal ml-1">({containers.length})</span>
                        </DialogTitle>
                        {containers.length > 0 && (
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/50 dark:bg-card/50 border border-border/50 shadow-sm backdrop-blur-md">
                                    <Scale className="h-3.5 w-3.5 text-primary" />
                                    <span className="text-xs font-bold text-foreground">{totalWeight.toLocaleString()} <span className="text-[10px] text-muted-foreground uppercase">kg</span></span>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/50 dark:bg-card/50 border border-border/50 shadow-sm backdrop-blur-md">
                                    <Move className="h-3.5 w-3.5 text-secondary" />
                                    <span className="text-xs font-bold text-foreground">{totalVolume.toLocaleString()} <span className="text-[10px] text-muted-foreground uppercase">m³</span></span>
                                </div>
                            </div>
                        )}
                    </div>
                </DialogHeader>

                <div className="p-6 space-y-5 relative z-10 scrollbar-hide">
                    {containers.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="p-4 rounded-full bg-muted/20 mb-4">
                                <Package className="h-8 w-8 opacity-20" />
                            </div>
                            <p className="font-medium text-lg italic">No containers found</p>
                            <p className="text-sm opacity-60">This shipment item currently has no containers assigned.</p>
                        </div>
                    ) : (
                        <div className="grid gap-5">
                            {containers.map((container, index) => (
                                <div
                                    key={container.id}
                                    className="relative overflow-hidden group rounded-2xl border border-border/40 bg-white/40 dark:bg-card/40 backdrop-blur-md p-5 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-500 animate-in fade-in slide-in-from-bottom-2"
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-primary/[0.02] group-hover:bg-primary/[0.05] blur-3xl transition-colors duration-700" />

                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10 mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold shadow-inner">
                                                {index + 1}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg text-foreground leading-tight">
                                                    {container.container_number || `Container #${container.id}`}
                                                </h3>
                                                <p className="text-xs font-semibold text-muted-foreground/60 uppercase tracking-widest">{container.container_type || "Standard"} {container.container_size ? `• ${container.container_size}` : ""}</p>
                                            </div>
                                        </div>

                                        <div className={cn(
                                            "flex items-center gap-2 px-3 py-1.5 rounded-full border border-transparent transition-all shadow-sm",
                                            container.status === "DELIVERED" ? "bg-primary/10 text-primary" :
                                                container.status === "IN_TRANSIT" ? "bg-amber-500/10 text-amber-500" :
                                                    "bg-secondary/10 text-secondary"
                                        )}>
                                            <span className={cn(
                                                "h-1.5 w-1.5 rounded-full animate-pulse",
                                                container.status === "DELIVERED" ? "bg-primary" :
                                                    container.status === "IN_TRANSIT" ? "bg-amber-500" :
                                                        "bg-secondary"
                                            )} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">{container.status || "PENDING"}</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-y-4 gap-x-4 relative z-10">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">Truck Type</p>
                                            <div className="flex items-center gap-1.5">
                                                <Truck className="h-3.5 w-3.5 text-secondary/60" />
                                                <span className="text-sm font-bold text-foreground">{container.recommended_truck_type || "Standard"}</span>
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">Weight</p>
                                            <div className="flex items-center gap-1.5">
                                                <Scale className="h-3.5 w-3.5 text-primary/60" />
                                                <span className="text-sm font-bold text-foreground">
                                                    {(container.gross_weight ?? container.weight)?.toLocaleString() ?? "-"}
                                                    <span className="text-[10px] text-muted-foreground ml-1">kg</span>
                                                </span>
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">Volume</p>
                                            <div className="flex items-center gap-1.5">
                                                <Move className="h-3.5 w-3.5 text-blue-500/60" />
                                                <span className="text-sm font-bold text-foreground">
                                                    {container.volume?.toLocaleString() ?? "-"}
                                                    <span className="text-[10px] text-muted-foreground ml-1">m³</span>
                                                </span>
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">Return Trip</p>
                                            <div className="flex items-center gap-1.5">
                                                {container.is_returning ? (
                                                    <>
                                                        <CheckCircle2 className="h-4 w-4 text-primary" />
                                                        <span className="text-sm font-bold text-primary">Required</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Clock className="h-4 w-4 text-muted-foreground/40" />
                                                        <span className="text-sm font-medium text-muted-foreground/60">One Way</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        {(container.container_details?.commodity || container.container_details?.instruction) && (
                                            <div className="col-span-full pt-2">
                                                <Separator className="mb-4 bg-border/40" />
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    {container.container_details?.commodity && (
                                                        <div className="space-y-2">
                                                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 pr-2">Commodities</p>
                                                            <div className="flex flex-wrap gap-1.5">
                                                                {container.container_details.commodity.map((c, i) => (
                                                                    <Badge
                                                                        key={i}
                                                                        variant="secondary"
                                                                        className="bg-primary/5 hover:bg-primary/10 text-primary border-none text-[9px] font-bold uppercase px-2 py-0.5 rounded-md transition-colors"
                                                                    >
                                                                        {c}
                                                                    </Badge>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                    {container.container_details?.instruction && (
                                                        <div className="space-y-2">
                                                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 flex items-center gap-1">
                                                                Instructions
                                                                <Info className="h-3 w-3" />
                                                            </p>
                                                            <div className="relative p-3 rounded-xl bg-amber-500/[0.03] border border-amber-500/10 transition-all group-hover:bg-amber-500/[0.05]">
                                                                <p className="text-[11px] italic font-medium text-amber-900/70 dark:text-amber-400/70 leading-relaxed">
                                                                    &ldquo;{container.container_details.instruction}&rdquo;
                                                                </p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

