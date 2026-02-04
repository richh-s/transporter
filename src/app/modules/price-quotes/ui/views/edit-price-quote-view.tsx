"use client";

import { Suspense, useEffect, useRef } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  MapPin,
  Truck,
  Package,
  Scale,
  DollarSign,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
    currency: z.string().max(3),
    axle_type: z.nativeEnum(TruckAxleTypeEnum).optional().nullable(),
    status: z.nativeEnum(PriceQuoteStatusEnum).optional(),
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

// Status Badge Component
function StatusBadge({ status }: { status: PriceQuoteStatusEnum }) {
  const config = {
    [PriceQuoteStatusEnum.ACTIVE]: {
      bg: "bg-emerald-500/10",
      text: "text-emerald-600",
      dot: "bg-emerald-500",
    },
    [PriceQuoteStatusEnum.DRAFT]: {
      bg: "bg-amber-500/10",
      text: "text-amber-600",
      dot: "bg-amber-500",
    },
    [PriceQuoteStatusEnum.INACTIVE]: {
      bg: "bg-gray-500/10",
      text: "text-gray-600",
      dot: "bg-gray-400",
    },
  }[status] || { bg: "bg-gray-100", text: "text-gray-600", dot: "bg-gray-400" };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold",
        config.bg,
        config.text,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", config.dot)} />
      {status}
    </span>
  );
}

// Loading Skeleton
function EditSkeleton() {
  return (
    <div className="space-y-4 p-4 animate-in fade-in">
      <div className="flex items-center gap-3">
        <Skeleton className="h-9 w-9 rounded-xl" />
        <div className="space-y-1">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      <Skeleton className="h-32 w-full rounded-xl" />
      <Skeleton className="h-40 w-full rounded-xl" />
      <Skeleton className="h-24 w-full rounded-xl" />
      <Skeleton className="h-24 w-full rounded-xl" />
    </div>
  );
}

function EditPriceQuoteContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const rawId = searchParams.get("id") || (params.id as string);
  const id = rawId && rawId !== "placeholder" ? Number(rawId) : NaN;

  const { data: quote, isLoading } = usePriceQuote(isNaN(id) ? 0 : id);
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

  useEffect(() => {
    if (isNaN(id)) {
      router.replace("/price-quotes");
    }
  }, [id, router]);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quote, id]);

  useEffect(() => {
    hasPopulatedForm.current = false;
  }, [id]);

  if (isNaN(id)) {
    return <EditSkeleton />;
  }

  if (isLoading) {
    return <EditSkeleton />;
  }

  if (quote && quote.status === PriceQuoteStatusEnum.ACTIVE) {
    return (
      <div className="min-h-screen bg-background animate-in fade-in duration-300">
        <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/50">
          <div className="flex items-center gap-3 p-4">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-xl"
              onClick={() => router.push(`/price-quotes/placeholder?id=${id}`)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-base font-bold">Edit Quote #{id}</h1>
              <p className="text-xs text-muted-foreground">
                Cannot edit active quotes
              </p>
            </div>
          </div>
        </div>
        <div className="p-4">
          <Alert className="rounded-xl">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Cannot Edit</AlertTitle>
            <AlertDescription>
              Only draft and inactive quotes can be edited. This quote is
              active.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

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
          router.push(`/price-quotes/placeholder?id=${updatedQuote.id}`);
        },
      },
    );
  };

  return (
    <div className="min-h-screen bg-background animate-in fade-in duration-300">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/50">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-xl"
              onClick={() => router.push(`/price-quotes/placeholder?id=${id}`)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold">Edit Quote #{id}</h1>
                {quote?.status && <StatusBadge status={quote.status} />}
              </div>
              <p className="text-xs text-muted-foreground">
                Update quote details
              </p>
            </div>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="p-4 space-y-4 pb-28"
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
                      key={`origin-${field.value || "empty"}`}
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
                      key={`destination-${field.value || "empty"}`}
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
                        key={`truck_type-${field.value || "empty"}`}
                      >
                        <Label
                          htmlFor="flatbed-edit"
                          className={cn(
                            "flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer transition-all",
                            field.value === TruckTypeEnum.FLATBED
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50",
                          )}
                        >
                          <RadioGroupItem
                            value={TruckTypeEnum.FLATBED}
                            id="flatbed-edit"
                            className="sr-only"
                          />
                          <Truck className="h-4 w-4" />
                          <span className="text-sm font-medium">Flatbed</span>
                        </Label>
                        <Label
                          htmlFor="trailer-edit"
                          className={cn(
                            "flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer transition-all",
                            field.value === TruckTypeEnum.TRAILER
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50",
                          )}
                        >
                          <RadioGroupItem
                            value={TruckTypeEnum.TRAILER}
                            id="trailer-edit"
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
                        key={`container_size-${field.value || "empty"}`}
                      >
                        <Label
                          htmlFor="twenty_feet_edit"
                          className={cn(
                            "flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer transition-all",
                            field.value === ContainerSizeEnum.TWENTY_FEET
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50",
                          )}
                        >
                          <RadioGroupItem
                            value={ContainerSizeEnum.TWENTY_FEET}
                            id="twenty_feet_edit"
                            className="sr-only"
                          />
                          <Package className="h-4 w-4" />
                          <span className="text-sm font-medium">20 ft</span>
                        </Label>
                        <Label
                          htmlFor="forty_feet_edit"
                          className={cn(
                            "flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer transition-all",
                            field.value === ContainerSizeEnum.FORTY_FEET
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50",
                          )}
                        >
                          <RadioGroupItem
                            value={ContainerSizeEnum.FORTY_FEET}
                            id="forty_feet_edit"
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
                      key={`axle_type-${field.value || "empty"}`}
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
                        onChange={(e) => field.onChange(Number(e.target.value))}
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
                        onChange={(e) => field.onChange(Number(e.target.value))}
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
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value))
                        }
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
                      value={field.value}
                      key={`currency-${field.value || "empty"}`}
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

          {/* Status Section */}
          <div className="p-4 rounded-xl bg-card border border-border/50 shadow-sm">
            <SectionHeader
              icon={Settings}
              title="Status"
              accent="bg-gray-500/10 text-gray-600"
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Quote Status</FormLabel>
                  <Select
                    onValueChange={(value) =>
                      field.onChange(value as PriceQuoteStatusEnum)
                    }
                    value={field.value}
                    key={`status-${field.value || "empty"}`}
                  >
                    <FormControl>
                      <SelectTrigger className="h-11 rounded-xl">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="rounded-xl">
                      <SelectItem value={PriceQuoteStatusEnum.DRAFT}>
                        Draft
                      </SelectItem>
                      <SelectItem value={PriceQuoteStatusEnum.ACTIVE}>
                        Active
                      </SelectItem>
                      <SelectItem value={PriceQuoteStatusEnum.INACTIVE}>
                        Inactive
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Setting to Active will automatically set validity dates.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </form>
      </Form>

      {/* Fixed Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-sm border-t border-border/50 flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(`/price-quotes/placeholder?id=${id}`)}
          disabled={updateMutation.isPending}
          className="flex-1 h-11 rounded-xl"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={updateMutation.isPending}
          className="flex-1 h-11 rounded-xl"
          onClick={form.handleSubmit(onSubmit)}
        >
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
    </div>
  );
}

export function EditPriceQuoteView() {
  return (
    <Suspense fallback={<EditSkeleton />}>
      <EditPriceQuoteContent />
    </Suspense>
  );
}
