"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Trash2, Edit, MapPin, Truck, Scale, Move, CreditCard, Calendar, ArrowRight, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { usePriceQuote, useDeletePriceQuote } from "@/app/modules/price-quotes/server/hooks";
import { PriceQuoteStatusEnum } from "@/types/price-quote";
import { formatLocation, formatTruckType, formatContainerSize, formatAxleType, formatStatus } from "@/lib/price-quote-utils";
import { DeleteQuoteDialog } from "@/app/modules/price-quotes/ui/components";
import { cn } from "@/lib/utils";

export function PriceQuoteDetailView() {
    const router = useRouter();
    const params = useParams();
    const id = Number(params.id);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const { data: quote, isLoading, error } = usePriceQuote(id);
    const deleteMutation = useDeletePriceQuote();

    if (error && !isLoading) {
        router.push("/price-quotes");
        return null;
    }

    const formatDateTime = (dateString: string) => {
        try {
            if (!dateString) return "—";
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return dateString;
            return format(date, "MMMM dd, yyyy 'at' h:mm a");
        } catch {
            return dateString;
        }
    };

    const formatCurrency = (amount: number, currency: string) => {
        const currencySymbol = currency === "USD" ? "$" : currency === "EUR" ? "€" : "ETB";
        return `${currencySymbol}${amount.toLocaleString()}`;
    };

    const handleDeleteConfirm = () => {
        if (quote) {
            deleteMutation.mutate(quote.id, {
                onSuccess: () => {
                    setDeleteDialogOpen(false);
                    router.push("/price-quotes");
                },
            });
        }
    };

    if (isLoading) {
        return (
            <div className="container mx-auto py-10 space-y-8 max-w-6xl animate-pulse">
                <Skeleton className="h-4 w-24" />
                <div className="flex justify-between items-end">
                    <div className="space-y-2">
                        <Skeleton className="h-10 w-64" />
                        <Skeleton className="h-5 w-32" />
                    </div>
                    <Skeleton className="h-10 w-48" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Skeleton className="h-64 rounded-3xl" />
                    <Skeleton className="h-64 rounded-3xl" />
                    <Skeleton className="h-64 rounded-3xl" />
                </div>
            </div>
        );
    }

    if (!quote) return null;

    const getStatusConfig = (status: PriceQuoteStatusEnum) => {
        switch (status) {
            case PriceQuoteStatusEnum.ACTIVE:
                return { color: "bg-primary", text: "text-primary dark:text-primary-foreground", bg: "bg-primary/10 dark:bg-primary/20", label: "Active" };
            case PriceQuoteStatusEnum.DRAFT:
                return { color: "bg-amber-500", text: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10 dark:bg-amber-500/20", label: "Draft" };
            case PriceQuoteStatusEnum.INACTIVE:
                return { color: "bg-secondary", text: "text-secondary dark:text-secondary-foreground", bg: "bg-secondary/10 dark:bg-secondary/20", label: "Inactive" };
            default:
                return { color: "bg-muted-foreground", text: "text-muted-foreground", bg: "bg-muted/10", label: status };
        }
    };

    const statusConfig = getStatusConfig(quote.status);

    return (
        <div className="container mx-auto py-10 space-y-8 max-w-6xl animate-in fade-in duration-700">
            {/* Navigation & Actions */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push("/price-quotes")}
                        className="group text-muted-foreground hover:text-foreground transition-all p-0 h-auto font-bold uppercase tracking-widest text-[10px]"
                    >
                        <ArrowLeft className="mr-2 h-3 w-3 group-hover:-translate-x-1 transition-transform" />
                        Back to Quotes
                    </Button>
                    <div className="space-y-1">
                        <div className="flex items-center gap-4">
                            <h1 className="text-4xl font-black tracking-tight text-foreground">
                                Quote Details
                            </h1>
                            <div className={cn(
                                "flex items-center gap-2 px-3 py-1.5 rounded-full border border-transparent shadow-sm",
                                statusConfig.bg, statusConfig.text
                            )}>
                                <span className={cn("h-1.5 w-1.5 rounded-full animate-pulse", statusConfig.color)} />
                                <span className="text-[10px] font-black uppercase tracking-widest">{statusConfig.label}</span>
                            </div>
                        </div>
                        <p className="text-muted-foreground font-mono text-sm">Case #MQ-{quote.id.toString().padStart(4, '0')}</p>
                    </div>
                </div>

                <div className="flex gap-3">
                    {(quote.status === PriceQuoteStatusEnum.DRAFT || quote.status === PriceQuoteStatusEnum.INACTIVE) && (
                        <Button
                            variant="outline"
                            onClick={() => router.push(`/price-quotes/${quote.id}/edit`)}
                            className="rounded-xl border-border/40 hover:bg-primary/5 hover:text-primary hover:border-primary/30 transition-all font-bold group"
                        >
                            <Edit className="mr-2 h-4 w-4 opacity-70 group-hover:rotate-12 transition-transform" />
                            Edit Quote
                        </Button>
                    )}
                    {quote.status !== PriceQuoteStatusEnum.ACTIVE && (
                        <Button
                            variant="destructive"
                            onClick={() => setDeleteDialogOpen(true)}
                            className="rounded-xl shadow-lg border-none hover:opacity-90 transition-all font-bold group"
                        >
                            <Trash2 className="mr-2 h-4 w-4 opacity-70 group-hover:scale-110 transition-transform" />
                            Delete
                        </Button>
                    )}
                </div>
            </div>

            <Separator className="bg-border/40" />

            {/* Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Route Card */}
                <Card className="relative overflow-hidden border-none bg-gradient-to-br from-primary/5 via-background to-background shadow-lg shadow-primary/5 hover:shadow-xl transition-all duration-500 group rounded-3xl">
                    <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/5 blur-3xl group-hover:bg-primary/10 transition-colors" />
                    <CardHeader className="relative z-10">
                        <CardTitle className="flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/60">
                            <div className="p-2.5 rounded-2xl bg-red-500/10 text-red-500 shadow-inner">
                                <MapPin className="h-4 w-4" />
                            </div>
                            Route Path
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-8 relative z-10 pt-4">
                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="flex flex-col items-center gap-2 pt-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full border-2 border-primary bg-background shadow-[0_0_0_4px_rgba(75,169,77,0.1)]" />
                                    <div className="w-0.5 h-12 bg-dashed-gradient from-primary to-secondary/30" />
                                    <div className="w-2.5 h-2.5 rounded-full border-2 border-secondary bg-background shadow-[0_0_0_4px_rgba(31,41,55,0.1)]" />
                                </div>
                                <div className="space-y-8 flex-1">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Departure</p>
                                        <p className="font-bold text-lg text-foreground leading-tight">{formatLocation(quote.origin)}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Arrival</p>
                                        <p className="font-bold text-lg text-foreground leading-tight">{formatLocation(quote.destination)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Logistics Stats Card */}
                <Card className="relative overflow-hidden border-none bg-gradient-to-br from-secondary/5 via-background to-background shadow-lg hover:shadow-xl transition-all duration-500 group rounded-3xl">
                    <div className="absolute -left-8 -bottom-8 h-32 w-32 rounded-full bg-secondary/5 blur-3xl group-hover:bg-secondary/10 transition-colors" />
                    <CardHeader className="relative z-10">
                        <CardTitle className="flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/60">
                            <div className="p-2.5 rounded-2xl bg-primary/10 text-primary shadow-inner">
                                <Truck className="h-4 w-4" />
                            </div>
                            Logistics Info
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-y-6 gap-x-4 relative z-10 pt-4">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Vehicle Type</p>
                            <p className="text-sm font-bold text-foreground leading-tight">{formatTruckType(quote.truck_type)}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Container Size</p>
                            <p className="text-sm font-bold text-foreground leading-tight">{formatContainerSize(quote.container_size)}</p>
                        </div>
                        <div className="space-y-1 border-t border-border/30 pt-4">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Min Weight</p>
                            <div className="flex items-center gap-1.5">
                                <Scale className="h-3 w-3 text-primary/60" />
                                <span className="text-sm font-bold text-foreground">{quote.gross_weight_min.toLocaleString()} <span className="text-[10px] text-muted-foreground font-medium">KG</span></span>
                            </div>
                        </div>
                        <div className="space-y-1 border-t border-border/30 pt-4">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Max Weight</p>
                            <div className="flex items-center gap-1.5">
                                <Move className="h-3 w-3 text-blue-500/60" />
                                <span className="text-sm font-bold text-foreground">{quote.gross_weight_max.toLocaleString()} <span className="text-[10px] text-muted-foreground font-medium">KG</span></span>
                            </div>
                        </div>
                        <div className="col-span-full pt-2">
                            <div className="p-3 rounded-2xl bg-white/40 dark:bg-card/30 border border-border/50 shadow-sm backdrop-blur-md">
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 mb-1">Axle Configuration</p>
                                <p className="text-xs font-bold text-foreground">{formatAxleType(quote.axle_type)}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Pricing & Timeline Card */}
                <Card className="relative overflow-hidden border-none bg-gradient-to-br from-amber-500/5 via-background to-background shadow-lg hover:shadow-xl transition-all duration-500 group rounded-3xl">
                    <CardHeader className="relative z-10">
                        <CardTitle className="flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/60">
                            <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-600 shadow-inner">
                                <CreditCard className="h-4 w-4" />
                            </div>
                            Investment
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-8 relative z-10 pt-4">
                        <div className="space-y-2">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 leading-none">Total Amount</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-black text-brand-primary tracking-tighter">
                                    {formatCurrency(quote.amount, quote.currency)}
                                </span>
                                <span className="text-sm font-bold text-muted-foreground/60 uppercase">{quote.currency}</span>
                            </div>
                        </div>

                        <div className="p-4 rounded-2xl bg-white/40 dark:bg-card/40 backdrop-blur-sm border border-border/50 shadow-sm transition-all group-hover:border-amber-500/20">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-background/80 shadow-inner text-muted-foreground">
                                    <Calendar className="h-4 w-4" />
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/50">Timestamp</p>
                                    <p className="text-xs font-bold text-foreground">{formatDateTime(quote.created_at)}</p>
                                </div>
                            </div>
                        </div>


                    </CardContent>
                </Card>
            </div>

            <DeleteQuoteDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                quote={quote}
                onConfirm={handleDeleteConfirm}
                isDeleting={deleteMutation.isPending}
            />
        </div>
    );
}

