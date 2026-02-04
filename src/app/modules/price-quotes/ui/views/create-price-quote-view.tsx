"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Loader2,
  AlertCircle,
  FileText,
  MapPin,
  Truck,
  Package,
  Scale,
  DollarSign,
} from "lucide-react";
import { CompactBreadcrumb } from "@/components/ui/mobile-breadcrumb";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Form,
  FormControl,
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
import {
  LOCATION_OPTIONS,
  locationEnumToDisplayName,
} from "@/lib/price-quote-utils";
import { cn } from "@/lib/utils";

const formSchema = z
  .object({
    origin: z.nativeEnum(LocationEnum, { message: "Origin is required" }),
    destination: z.nativeEnum(LocationEnum, {
      message: "Destination is required",
    }),
    gross_weight_min: z
      .number({ message: "Min weight is required" })
      .min(1, "Must be > 0"),
    gross_weight_max: z
      .number({ message: "Max weight is required" })
      .min(1, "Must be > 0"),
    truck_type: z.nativeEnum(TruckTypeEnum, {
      message: "Truck type is required",
    }),
    container_size: z.nativeEnum(ContainerSizeEnum, {
      message: "Container size is required",
    }),
    amount: z
      .number({ message: "Amount is required" })
      .min(0.01, "Must be > 0"),
    currency: z.string().max(3).optional(),
    axle_type: z.nativeEnum(TruckAxleTypeEnum).optional().nullable(),
  })
  .refine((data) => data.origin !== data.destination, {
    message: "Origin and destination must be different",
    path: ["destination"],
  })
  .refine((data) => data.gross_weight_max >= data.gross_weight_min, {
    message: "Max weight must be >= min weight",
    path: ["gross_weight_max"],
  });

type FormValues = z.infer<typeof formSchema>;

// Section Header Component
function SectionHeader({
  icon: Icon,
  title,
  accent,
}: {
  icon: React.ElementType;
  title: string;
  accent: string;
}) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className={cn("p-1.5 rounded-lg", accent)}>
        <Icon className="h-3.5 w-3.5" />
      </div>
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </span>
    </div>
  );
}

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
    if (
      typeof values.gross_weight_min !== "number" ||
      typeof values.gross_weight_max !== "number" ||
      typeof values.amount !== "number" ||
      isNaN(values.gross_weight_min) ||
      isNaN(values.gross_weight_max) ||
      isNaN(values.amount)
    ) {
      return;
    }

    const quoteData: CreatePriceQuoteRequest = {
      origin: locationEnumToDisplayName(values.origin),
      destination: locationEnumToDisplayName(values.destination),
      gross_weight_min: Math.floor(values.gross_weight_min),
      gross_weight_max: Math.floor(values.gross_weight_max),
      gross_weight_unit: "kg",
      truck_type: values.truck_type,
      container_size: values.container_size,
      amount: values.amount,
    };

    if (values.currency && values.currency !== "ETB") {
      quoteData.currency = values.currency;
    }
    if (values.axle_type !== null && values.axle_type !== undefined) {
      quoteData.axle_type = values.axle_type;
    }

    createMutation.mutate(quoteData, {
      onSuccess: (quote) => {
        router.push(`/price-quotes/placeholder?id=${quote.id}`);
      },
    });
  };

  return (
    <div className="min-h-screen bg-background animate-in fade-in duration-300">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/50">
        <div className="p-4 space-y-2">
          <CompactBreadcrumb
            parentLabel="Price Quotes"
            parentHref="/price-quotes"
            currentLabel="Create Quote"
          />
          <h1 className="text-lg font-bold">Create New Quote</h1>
        </div>
      </div>

      {/* Error Alert */}
      {createMutation.error &&
        (createMutation.error as Error & { code?: string }).code ===
          "MISSING_DOCUMENTS" && (
          <div className="p-4">
            <Alert variant="destructive" className="rounded-xl">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Document Required</AlertTitle>
              <AlertDescription className="mt-2">
                <p className="mb-3 text-sm">
                  {createMutation.error.message ||
                    "The required Trade License document is missing or has not been approved."}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push("/organization/documents")}
                  className="rounded-xl"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Go to Documents
                </Button>
              </AlertDescription>
            </Alert>
          </div>
        )}

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="p-4 space-y-4 pb-40 lg:pb-28"
        >
          {/* Route Section */}
          <div className="p-4 rounded-xl bg-card border border-border/50 shadow-sm">
            <SectionHeader
              icon={MapPin}
              title="Route"
              accent="bg-red-500/10 text-red-500"
            />
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="origin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">
                      Origin <span className="text-red-500">*</span>
                    </FormLabel>
                    <Select
                      onValueChange={(value) =>
                        field.onChange(value as LocationEnum)
                      }
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="h-11 rounded-xl">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-xl">
                        {LOCATION_OPTIONS.map((loc) => (
                          <SelectItem key={loc.value} value={loc.value}>
                            {loc.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="destination"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">
                      Destination <span className="text-red-500">*</span>
                    </FormLabel>
                    <Select
                      onValueChange={(value) =>
                        field.onChange(value as LocationEnum)
                      }
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="h-11 rounded-xl">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-xl">
                        {LOCATION_OPTIONS.map((loc) => (
                          <SelectItem key={loc.value} value={loc.value}>
                            {loc.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Truck & Container Section */}
          <div className="p-4 rounded-xl bg-card border border-border/50 shadow-sm">
            <SectionHeader
              icon={Truck}
              title="Vehicle"
              accent="bg-blue-500/10 text-blue-500"
            />
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="truck_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">
                      Truck Type <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="flex gap-3"
                      >
                        <Label
                          htmlFor="flatbed"
                          className={cn(
                            "flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer transition-all",
                            field.value === TruckTypeEnum.FLATBED
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50",
                          )}
                        >
                          <RadioGroupItem
                            value={TruckTypeEnum.FLATBED}
                            id="flatbed"
                            className="sr-only"
                          />
                          <Truck className="h-4 w-4" />
                          <span className="text-sm font-medium">Flatbed</span>
                        </Label>
                        <Label
                          htmlFor="trailer"
                          className={cn(
                            "flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer transition-all",
                            field.value === TruckTypeEnum.TRAILER
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50",
                          )}
                        >
                          <RadioGroupItem
                            value={TruckTypeEnum.TRAILER}
                            id="trailer"
                            className="sr-only"
                          />
                          <Truck className="h-4 w-4" />
                          <span className="text-sm font-medium">Trailer</span>
                        </Label>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="container_size"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">
                      Container Size <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="flex gap-3"
                      >
                        <Label
                          htmlFor="twenty_feet"
                          className={cn(
                            "flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer transition-all",
                            field.value === ContainerSizeEnum.TWENTY_FEET
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50",
                          )}
                        >
                          <RadioGroupItem
                            value={ContainerSizeEnum.TWENTY_FEET}
                            id="twenty_feet"
                            className="sr-only"
                          />
                          <Package className="h-4 w-4" />
                          <span className="text-sm font-medium">20 ft</span>
                        </Label>
                        <Label
                          htmlFor="forty_feet"
                          className={cn(
                            "flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer transition-all",
                            field.value === ContainerSizeEnum.FORTY_FEET
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50",
                          )}
                        >
                          <RadioGroupItem
                            value={ContainerSizeEnum.FORTY_FEET}
                            id="forty_feet"
                            className="sr-only"
                          />
                          <Package className="h-4 w-4" />
                          <span className="text-sm font-medium">40 ft</span>
                        </Label>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="axle_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">
                      Axle Type (Optional)
                    </FormLabel>
                    <Select
                      onValueChange={(value) =>
                        field.onChange(
                          value === "none"
                            ? null
                            : (value as TruckAxleTypeEnum),
                        )
                      }
                      value={field.value || "none"}
                    >
                      <FormControl>
                        <SelectTrigger className="h-11 rounded-xl">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value={TruckAxleTypeEnum.SINGLE}>
                          Single
                        </SelectItem>
                        <SelectItem value={TruckAxleTypeEnum.DOUBLE}>
                          Double
                        </SelectItem>
                        <SelectItem value={TruckAxleTypeEnum.TRIPLE}>
                          Triple
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Weight Section */}
          <div className="p-4 rounded-xl bg-card border border-border/50 shadow-sm">
            <SectionHeader
              icon={Scale}
              title="Weight Range"
              accent="bg-amber-500/10 text-amber-600"
            />
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="gross_weight_min"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">
                      Min (kg) <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="1000"
                        className="h-11 rounded-xl"
                        value={field.value || ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          field.onChange(val === "" ? undefined : Number(val));
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gross_weight_max"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">
                      Max (kg) <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="20000"
                        className="h-11 rounded-xl"
                        value={field.value || ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          field.onChange(val === "" ? undefined : Number(val));
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Pricing Section */}
          <div className="p-4 rounded-xl bg-card border border-border/50 shadow-sm">
            <SectionHeader
              icon={DollarSign}
              title="Pricing"
              accent="bg-emerald-500/10 text-emerald-600"
            />
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">
                      Amount <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="50000"
                        className="h-11 rounded-xl"
                        value={field.value || ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          field.onChange(
                            val === "" ? undefined : parseFloat(val),
                          );
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Currency</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || "ETB"}
                    >
                      <FormControl>
                        <SelectTrigger className="h-11 rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="ETB">ETB</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </form>
      </Form>

      {/* Fixed Bottom Actions - above mobile nav */}
      <div className="fixed bottom-16 lg:bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-sm border-t border-border/50 flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/price-quotes")}
          disabled={createMutation.isPending}
          className="flex-1 h-11 rounded-xl"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={createMutation.isPending}
          className="flex-1 h-11 rounded-xl"
          onClick={form.handleSubmit(onSubmit)}
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
    </div>
  );
}
