"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { usePriceQuote, useDeletePriceQuote } from "@/app/modules/price-quotes/server/hooks";
import { PriceQuoteStatusEnum } from "@/types/price-quote";
import { formatLocation, formatTruckType, formatContainerSize, formatAxleType, formatStatus, getStatusVariant } from "@/lib/price-quote-utils";
import { DeleteQuoteDialog } from "@/app/modules/price-quotes/ui/components";

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

    const formatDate = (dateString: string) => {
        try {
            return format(new Date(dateString), "MMMM dd, yyyy");
        } catch {
            return dateString;
        }
    };

    const formatDateTime = (dateString: string) => {
        try {
            return format(new Date(dateString), "MMMM dd, yyyy 'at' HH:mm");
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
            <div className="space-y-6 animate-in fade-in duration-500">
                <Skeleton className="h-10 w-64" />
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-48" />
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!quote) {
        return (
            <div className="space-y-6 animate-in fade-in duration-500">
                <div className="text-center py-12">
                    <p className="text-muted-foreground">Price quote not found</p>
                    <Button
                        variant="outline"
                        className="mt-4"
                        onClick={() => router.push("/price-quotes")}
                    >
                        Back to List
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500 w-full pb-6 sm:pb-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push("/price-quotes")}
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-brand-primary">
                            Price Quote Details
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Quote #{quote.id}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    {(quote.status === PriceQuoteStatusEnum.DRAFT || quote.status === PriceQuoteStatusEnum.EXPIRED) && (
                        <Button
                            variant="outline"
                            onClick={() => router.push(`/price-quotes/${quote.id}/edit`)}
                        >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                        </Button>
                    )}
                    <Button
                        variant="destructive"
                        onClick={() => setDeleteDialogOpen(true)}
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                    </Button>
                </div>
            </div>

            {/* Quote Information Card */}
            <Card className="overflow-visible">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Quote Information</CardTitle>
                        <Badge variant={getStatusVariant(quote.status)}>
                            {formatStatus(quote.status)}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6 overflow-visible pb-8 sm:pb-10">
                    {/* Route Information */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Route Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <p className="text-sm text-muted-foreground">Origin</p>
                                <p className="font-medium">{formatLocation(quote.origin)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Destination</p>
                                <p className="font-medium">{formatLocation(quote.destination)}</p>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Cargo Details */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Cargo Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <p className="text-sm text-muted-foreground">Weight Range</p>
                                <p className="font-medium">
                                    {quote.gross_weight_min.toLocaleString()} - {quote.gross_weight_max.toLocaleString()} kg
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Truck Type</p>
                                <p className="font-medium">{formatTruckType(quote.truck_type)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Container Size</p>
                                <p className="font-medium">{formatContainerSize(quote.container_size)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Axle Type</p>
                                <p className="font-medium">
                                    {formatAxleType(quote.axle_type)}
                                </p>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Pricing */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Pricing</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <p className="text-sm text-muted-foreground">Amount</p>
                                <p className="text-2xl font-bold">
                                    {formatCurrency(quote.amount, quote.currency)}
                                </p>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    <div>
                        <p className="text-sm text-muted-foreground">Created</p>
                        <p className="font-medium">
                            {formatDateTime(quote.created_at)}
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Delete Confirmation Dialog */}
            {quote && (
                <DeleteQuoteDialog
                    open={deleteDialogOpen}
                    onOpenChange={setDeleteDialogOpen}
                    quote={quote}
                    onConfirm={handleDeleteConfirm}
                    isDeleting={deleteMutation.isPending}
                />
            )}
        </div>
    );
}
