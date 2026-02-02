"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowLeft, Loader2, AlertCircle, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import { useCreatePriceQuote } from "@/app/modules/price-quotes/server/hooks";
import {
    LocationEnum,
    TruckTypeEnum,
    ContainerSizeEnum,
    TruckAxleTypeEnum,
} from "@/types/price-quote";
import type { CreatePriceQuoteRequest } from "@/types/price-quote";
import { LOCATION_OPTIONS, locationEnumToDisplayName } from "@/lib/price-quote-utils";

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
    currency: z.string().max(3).optional(),
    axle_type: z.nativeEnum(TruckAxleTypeEnum).optional().nullable(),
}).refine((data) => data.origin !== data.destination, {
    message: "Origin and destination must be different",
    path: ["destination"],
}).refine((data) => data.gross_weight_max >= data.gross_weight_min, {
    message: "Maximum weight must be greater than or equal to minimum weight",
    path: ["gross_weight_max"],
});

type FormValues = z.infer<typeof formSchema>;

export function CreatePriceQuoteView() {
    const router = useRouter();
    const createMutation = useCreatePriceQuote();

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
        },
    });

    const onSubmit = async (values: FormValues) => {
        // Validate and convert numbers, ensuring no NaN or invalid values
        // Form validation should ensure these are numbers, but double-check
        if (
            typeof values.gross_weight_min !== "number" ||
            typeof values.gross_weight_max !== "number" ||
            typeof values.amount !== "number" ||
            isNaN(values.gross_weight_min) ||
            isNaN(values.gross_weight_max) ||
            isNaN(values.amount)
        ) {
            console.error("Invalid numeric values detected", values);
            return;
        }

        // Prepare the quote data according to API specification
        // Convert location enums to display names as expected by backend
        const quoteData: CreatePriceQuoteRequest = {
            origin: locationEnumToDisplayName(values.origin),
            destination: locationEnumToDisplayName(values.destination),
            gross_weight_min: Math.floor(values.gross_weight_min), // int
            gross_weight_max: Math.floor(values.gross_weight_max), // int
            gross_weight_unit: "kg", // Required field - backend expects this
            truck_type: values.truck_type,
            container_size: values.container_size,
            amount: values.amount, // float (already validated as number)
        };

        // Only include currency if it's not the default "ETB" (per API spec)
        if (values.currency && values.currency !== "ETB") {
            quoteData.currency = values.currency;
        }

        // Only include axle_type if it's provided (optional field)
        if (values.axle_type !== null && values.axle_type !== undefined) {
            quoteData.axle_type = values.axle_type;
        }

        // Log the data being sent for debugging
        if (process.env.NODE_ENV === "development") {
            console.log("Sending quote data:", JSON.stringify(quoteData, null, 2));
        }

        createMutation.mutate(quoteData, {
            onSuccess: (quote) => {
                router.push(`/price-quotes/${quote.id}`);
            },
        });
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 w-full pb-6 sm:pb-8">
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
                        Create New Price Quote
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Add a new transportation price quote
                    </p>
                </div>
            </div>

            {/* Error Alert for Missing Documents */}
            {createMutation.error && (createMutation.error as Error & { code?: string }).code === "MISSING_DOCUMENTS" && (
                <Alert variant="destructive" className="mb-6">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Document Required</AlertTitle>
                    <AlertDescription className="mt-2">
                        <p className="mb-3">
                            {createMutation.error.message || "The required Trade License document is missing or has not been approved."}
                        </p>
                        <p className="mb-3 text-sm">
                            Please upload your Trade License document and wait for approval before creating price quotes.
                        </p>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push("/organization/documents")}
                            className="mt-2"
                        >
                            <FileText className="mr-2 h-4 w-4" />
                            Go to Documents Page
                        </Button>
                    </AlertDescription>
                </Alert>
            )}

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
                                                        value={field.value || ""}
                                                        onChange={(e) => {
                                                            const value = e.target.value;
                                                            field.onChange(value === "" ? undefined : Number(value));
                                                        }}
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
                                                        value={field.value || ""}
                                                        onChange={(e) => {
                                                            const value = e.target.value;
                                                            field.onChange(value === "" ? undefined : Number(value));
                                                        }}
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
                                                        value={field.value || ""}
                                                        onChange={(e) => {
                                                            const value = e.target.value;
                                                            field.onChange(value === "" ? undefined : parseFloat(value));
                                                        }}
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
                                                    value={field.value || "ETB"}
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
                                                    Currency for this quote (default: ETB)
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            {/* Actions */}
                            <Separator className="my-6" />
                            <div className="flex flex-col sm:flex-row justify-end gap-4 pt-4 pb-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.push("/price-quotes")}
                                    disabled={createMutation.isPending}
                                    className="w-full sm:w-auto"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={createMutation.isPending}
                                    className="w-full sm:w-auto"
                                >
                                    {createMutation.isPending ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        "Create Quote"
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
