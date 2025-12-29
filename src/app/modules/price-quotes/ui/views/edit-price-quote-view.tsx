"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import {
    usePriceQuote,
    useUpdatePriceQuote,
} from "@/app/modules/price-quotes/server/hooks";
import type { UpdatePriceQuoteRequest } from "@/types/price-quote";
import {
    LocationEnum,
    TruckTypeEnum,
    ContainerSizeEnum,
    TruckAxleTypeEnum,
    PriceQuoteStatusEnum,
} from "@/types/price-quote";
import { LOCATION_OPTIONS } from "@/lib/price-quote-utils";

const formSchema = z.object({
    origin: z.nativeEnum(LocationEnum, {
        message: "Origin is required",
    }),
    destination: z.nativeEnum(LocationEnum, {
        message: "Destination is required",
    }),
    gross_weight_min: z.number({
        message: "Gross Weight Min is required",
    }).min(1, "Minimum weight must be greater than 0"),
    gross_weight_max: z.number({
        message: "Gross Weight Max is required",
    }).min(1, "Maximum weight must be greater than 0"),
    truck_type: z.nativeEnum(TruckTypeEnum, {
        message: "Truck type is required",
    }),
    container_size: z.nativeEnum(ContainerSizeEnum, {
        message: "Container size is required",
    }),
    amount: z.number({
        message: "Amount is required",
    }).min(0.01, "Amount must be greater than 0"),
    currency: z.string().max(3),
    axle_type: z.nativeEnum(TruckAxleTypeEnum).optional().nullable(),
    status: z.nativeEnum(PriceQuoteStatusEnum).optional(),
}).refine((data) => data.origin !== data.destination, {
    message: "Origin and destination must be different",
    path: ["destination"],
}).refine((data) => data.gross_weight_max >= data.gross_weight_min, {
    message: "Maximum weight must be greater than or equal to minimum weight",
    path: ["gross_weight_max"],
});

type FormValues = z.infer<typeof formSchema>;

export function EditPriceQuoteView() {
    const router = useRouter();
    const params = useParams();
    const id = Number(params.id);

    const { data: quote, isLoading } = usePriceQuote(id);
    const updateMutation = useUpdatePriceQuote();
    const hasPopulatedForm = useRef(false);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            origin: undefined,
            destination: undefined,
            gross_weight_min: undefined,
            gross_weight_max: undefined,
            truck_type: undefined,
            container_size: undefined,
            amount: undefined,
            currency: "ETB",
            axle_type: undefined,
            status: undefined,
        },
    });

    // Populate form when quote data is loaded (only once per quote)
    useEffect(() => {
        if (quote && quote.id === id && !hasPopulatedForm.current) {
            form.reset({
                origin: quote.origin,
                destination: quote.destination,
                gross_weight_min: quote.gross_weight_min,
                gross_weight_max: quote.gross_weight_max,
                truck_type: quote.truck_type,
                container_size: quote.container_size,
                amount: quote.amount,
                currency: quote.currency || "ETB",
                axle_type: quote.axle_type ?? undefined,
                status: quote.status,
            });
            hasPopulatedForm.current = true;
        }
    }, [quote, id, form]);

    // Reset the flag when quote ID changes
    useEffect(() => {
        hasPopulatedForm.current = false;
    }, [id]);

    const onSubmit = async (values: FormValues) => {
        const updateData: UpdatePriceQuoteRequest = {
            origin: values.origin,
            destination: values.destination,
            gross_weight_min: Math.floor(values.gross_weight_min),
            gross_weight_max: Math.floor(values.gross_weight_max),
            truck_type: values.truck_type,
            container_size: values.container_size,
            amount: Number(values.amount),
            currency: values.currency,
            axle_type: values.axle_type ?? null,
            status: values.status,
        };

        updateMutation.mutate(
            { id, data: updateData },
            {
                onSuccess: (updatedQuote) => {
                    router.push(`/price-quotes/${updatedQuote.id}`);
                },
            }
        );
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

    if (quote && quote.status === PriceQuoteStatusEnum.ACTIVE) {
        return (
            <div className="space-y-6 animate-in fade-in duration-500">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push(`/price-quotes/${id}`)}
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-brand-primary">
                            Edit Price Quote
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Quote #{id}
                        </p>
                    </div>
                </div>
                <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Cannot Edit</AlertTitle>
                    <AlertDescription>
                        Only draft and inactive quotes can be edited. This quote is active.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500 w-full pb-6 sm:pb-8">
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.push(`/price-quotes/${id}`)}
                >
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-brand-primary">
                        Edit Price Quote
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Quote #{id}
                    </p>
                </div>
            </div>

            <Card className="overflow-visible">
                <CardHeader>
                    <CardTitle>Quote Information</CardTitle>
                </CardHeader>
                <CardContent className="overflow-visible">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            {/* Route Information */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold">Route Information</h3>
                                <Separator />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="origin"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Origin <span className="text-red-500">*</span>
                                                </FormLabel>
                                                <Select
                                                    onValueChange={(value) => field.onChange(value as LocationEnum)}
                                                    value={field.value}
                                                    key={`origin-${field.value || 'empty'}`}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select origin" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {LOCATION_OPTIONS.map((location) => (
                                                            <SelectItem key={location.value} value={location.value}>
                                                                {location.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormDescription>
                                                    Starting location
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="destination"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Destination <span className="text-red-500">*</span>
                                                </FormLabel>
                                                <Select
                                                    onValueChange={(value) => field.onChange(value as LocationEnum)}
                                                    value={field.value}
                                                    key={`destination-${field.value || 'empty'}`}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select destination" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {LOCATION_OPTIONS.map((location) => (
                                                            <SelectItem key={location.value} value={location.value}>
                                                                {location.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormDescription>
                                                    Destination location
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            {/* Cargo Details */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold">Cargo Details</h3>
                                <Separator />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="gross_weight_min"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Minimum Weight (kg) <span className="text-red-500">*</span>
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        placeholder="e.g., 1000"
                                                        {...field}
                                                        onChange={(e) => field.onChange(Number(e.target.value))}
                                                        value={field.value || ""}
                                                    />
                                                </FormControl>
                                                <FormDescription>
                                                    Minimum weight in kilograms
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="gross_weight_max"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Maximum Weight (kg) <span className="text-red-500">*</span>
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        placeholder="e.g., 20000"
                                                        {...field}
                                                        onChange={(e) => field.onChange(Number(e.target.value))}
                                                        value={field.value || ""}
                                                    />
                                                </FormControl>
                                                <FormDescription>
                                                    Maximum weight in kilograms
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="truck_type"
                                        render={({ field }) => (
                                            <FormItem className="space-y-3">
                                                <FormLabel>
                                                    Truck Type <span className="text-red-500">*</span>
                                                </FormLabel>
                                                <FormControl>
                                                    <RadioGroup
                                                        onValueChange={field.onChange}
                                                        value={field.value}
                                                        className="flex flex-row space-x-4"
                                                        key={`truck_type-${field.value || 'empty'}`}
                                                    >
                                                        <div className="flex items-center space-x-2">
                                                            <RadioGroupItem value={TruckTypeEnum.FLATBED} id="flatbed" />
                                                            <Label htmlFor="flatbed">Flatbed</Label>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <RadioGroupItem value={TruckTypeEnum.TRAILER} id="trailer" />
                                                            <Label htmlFor="trailer">Trailer</Label>
                                                        </div>
                                                    </RadioGroup>
                                                </FormControl>
                                                <FormDescription>
                                                    Type of truck for this quote
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="container_size"
                                        render={({ field }) => (
                                            <FormItem className="space-y-3">
                                                <FormLabel>
                                                    Container Size <span className="text-red-500">*</span>
                                                </FormLabel>
                                                <FormControl>
                                                    <RadioGroup
                                                        onValueChange={field.onChange}
                                                        value={field.value}
                                                        className="flex flex-row space-x-4"
                                                        key={`container_size-${field.value || 'empty'}`}
                                                    >
                                                        <div className="flex items-center space-x-2">
                                                            <RadioGroupItem value={ContainerSizeEnum.TWENTY_FEET} id="twenty_feet" />
                                                            <Label htmlFor="twenty_feet">20 Feet</Label>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <RadioGroupItem value={ContainerSizeEnum.FORTY_FEET} id="forty_feet" />
                                                            <Label htmlFor="forty_feet">40 Feet</Label>
                                                        </div>
                                                    </RadioGroup>
                                                </FormControl>
                                                <FormDescription>
                                                    Container size for this quote
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="axle_type"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Axle Type (Optional)</FormLabel>
                                                <Select
                                                    onValueChange={(value) => field.onChange(value === "none" ? null : (value as TruckAxleTypeEnum))}
                                                    value={field.value || "none"}
                                                    key={`axle_type-${field.value || 'empty'}`}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select axle type" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="none">None</SelectItem>
                                                        <SelectItem value={TruckAxleTypeEnum.SINGLE}>Single</SelectItem>
                                                        <SelectItem value={TruckAxleTypeEnum.DOUBLE}>Double</SelectItem>
                                                        <SelectItem value={TruckAxleTypeEnum.TRIPLE}>Triple</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormDescription>
                                                    Axle type (optional)
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            {/* Pricing */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold">Pricing</h3>
                                <Separator />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="amount"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Amount <span className="text-red-500">*</span>
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        placeholder="e.g., 50000.00"
                                                        {...field}
                                                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                                        value={field.value || ""}
                                                    />
                                                </FormControl>
                                                <FormDescription>
                                                    Price amount
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="currency"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Currency</FormLabel>
                                                <Select
                                                    onValueChange={field.onChange}
                                                    value={field.value}
                                                    key={`currency-${field.value || 'empty'}`}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="ETB">ETB (Ethiopian Birr)</SelectItem>
                                                        <SelectItem value="USD">USD (US Dollar)</SelectItem>
                                                        <SelectItem value="EUR">EUR (Euro)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormDescription>
                                                    Currency for this quote
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            {/* Status */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold">Status</h3>
                                <Separator />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="status"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Status</FormLabel>
                                                <Select
                                                    onValueChange={(value) => field.onChange(value as PriceQuoteStatusEnum)}
                                                    value={field.value}
                                                    key={`status-${field.value || 'empty'}`}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select status" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value={PriceQuoteStatusEnum.DRAFT}>Draft</SelectItem>
                                                        <SelectItem value={PriceQuoteStatusEnum.ACTIVE}>Active</SelectItem>
                                                        <SelectItem value={PriceQuoteStatusEnum.INACTIVE}>Inactive</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormDescription>
                                                    Change the status of this quote. Setting to &quoteActive&quote will automatically set validity dates.
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end gap-4 pb-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.push(`/price-quotes/${id}`)}
                                    disabled={updateMutation.isPending}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={updateMutation.isPending}>
                                    {updateMutation.isPending ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        "Save Changes"
                                    )}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
