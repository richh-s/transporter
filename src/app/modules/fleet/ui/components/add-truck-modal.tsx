"use client";

import { useState, useEffect, useRef } from "react";
import {
  Plus,
  Loader2,
  XCircle,
  CheckIcon,
  ChevronsUpDownIcon,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { useCreateTruck } from "@/app/modules/fleet/server/hooks";

const truckFormSchema = z.object({
  vin: z
    .string()
    .min(11, "VIN must be at least 11 characters")
    .max(17, "VIN cannot exceed 17 characters"),

  plate_number: z
    .string()
    .min(3, "Plate number must be at least 3 characters")
    .max(20, "Plate number cannot exceed 20 characters"),

  registration_date: z.string().min(1, "Registration date is required"),

  truck_type: z
  .enum(["flatbed", "trailer"])
  .refine((v) => v !== undefined, {
    message: "Truck type is required",
  }),

  status: z
  .enum(["active", "inactive", "maintenance", "out_of_service"])
  .refine((v) => v !== undefined, {
    message: "Status is required",
  }),

  capacity_quintal: z
    .number()
    .min(1, "Capacity must be greater than 0"),

  year: z
    .number()
    .min(1900, "Year is invalid")
    .max(2100, "Year is invalid")
    .nullable()
    .optional(),

  gps_device_id: z
    .number()
    .min(1, "GPS Device ID must be positive")
    .nullable()
    .optional(),

  make: z.string().nullable().optional(),
  model: z.string().nullable().optional(),
  color: z.string().nullable().optional(),
  gov_id: z.string().nullable().optional(),
  libre_key: z.string().nullable().optional(),
});


type TruckFormValues = z.infer<typeof truckFormSchema>;

const TRUCK_TYPES = [
  { value: "flatbed", label: "Flatbed" },
  { value: "trailer", label: "Trailer" },
] as const;

const TRUCK_STATUSES = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "maintenance", label: "Maintenance" },
  { value: "out_of_service", label: "Out of Service" },
] as const;

interface AddTruckModalProps {
  onSuccess?: () => void;
  variant?: "default" | "icon-only";
}

export function AddTruckModal({
  onSuccess,
  variant = "default",
}: AddTruckModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [isTypePopoverOpen, setIsTypePopoverOpen] = useState(false);
  const [isStatusPopoverOpen, setIsStatusPopoverOpen] = useState(false);
  const scrollableRef = useRef<HTMLDivElement>(null);

  const createTruckMutation = useCreateTruck();

  const defaultValues: TruckFormValues = {
    vin: "",
    plate_number: "",
    registration_date: new Date().toISOString().split("T")[0],
    truck_type: "flatbed",
    status: "active",
    capacity_quintal: 0,
    make: "",
    model: "",
    year: null,
    color: "",
    gov_id: "",
    libre_key: "",
    gps_device_id: null,
  };

  const form = useForm<TruckFormValues>({
    resolver: zodResolver(truckFormSchema),
    defaultValues,
    mode: "onChange",
  });

  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      form.reset(defaultValues);
      createTruckMutation.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && scrollableRef.current) {
      const timer = setTimeout(() => {
        if (scrollableRef.current) {
          const el = scrollableRef.current;
          el.style.overflow = "hidden";
          requestAnimationFrame(() => {
            el.style.overflow = "";
          });
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen, step]);

  const validateStep1 = () =>
    form.trigger(["vin", "plate_number", "registration_date"]);

  const validateStep2 = () =>
    form.trigger(["truck_type", "status", "capacity_quintal"]);

  const validateStep3 = () =>
    form.trigger(["make", "model", "year", "color"]);

  const nextStep = async (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();

    let isValid = false;

    if (step === 1) isValid = await validateStep1();
    else if (step === 2) isValid = await validateStep2();
    else if (step === 3) isValid = await validateStep3();

    if (isValid) setStep((prev) => prev + 1);
  };

  const prevStep = () => setStep((prev) => prev - 1);

  const onSubmit = async (values: TruckFormValues) => {
    if (step !== 4) return;

    try {
      await createTruckMutation.mutateAsync(values);
      setIsOpen(false);
      form.reset();
      onSuccess?.();
    } catch (err) {
      console.error("Failed to create truck:", err);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {variant === "icon-only" ? (
          <Button
            className="h-9 w-full md:w-auto bg-brand-primary hover:bg-brand-secondary text-xs sm:text-sm px-2 sm:px-3 flex items-center justify-center"
            title="Add New Truck"
          >
            <Plus className="mr-0.5 h-3.5 w-3.5" /> Add
          </Button>
        ) : (
          <Button className="w-full sm:w-auto bg-brand-primary hover:bg-brand-secondary h-11">
            <Plus className="mr-2 h-4 w-4" /> Add New Truck
          </Button>
        )}
      </DialogTrigger>

      <DialogContent
        className={cn(
          "sm:max-w-[600px] max-w-[95vw] flex flex-col p-0 overflow-hidden",
          "top-[5%] sm:top-[50%] translate-y-0 sm:translate-y-[-50%]",
          step === 1
            ? "h-auto max-h-[75vh] sm:max-h-[420px]"
            : step === 2 || step === 3
            ? "h-auto max-h-[80vh] sm:h-[540px] sm:max-h-[540px]"
            : "h-auto max-h-[80vh] sm:h-[560px] sm:max-h-[560px]"
        )}
      >
        <DialogHeader className="p-4 sm:p-6 pb-2 shrink-0">
          <DialogTitle className="text-lg sm:text-xl">Add New Truck</DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Step {step} of 4:{" "}
            {step === 1
              ? "Identification"
              : step === 2
              ? "Configuration"
              : step === 3
              ? "Vehicle Details"
              : "Compliance & Tracking"}
          </DialogDescription>
          <div className="w-full bg-gray-100 h-1.5 rounded-full mt-4 overflow-hidden">
            <div
              className="bg-brand-primary h-full transition-all duration-300 ease-in-out"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.target instanceof HTMLInputElement) {
                e.preventDefault();
              }
            }}
            className="flex-1 flex flex-col overflow-hidden min-h-0"
          >
            <div
              ref={scrollableRef}
              className="flex-1 overflow-y-auto overflow-x-hidden overscroll-contain p-4 sm:p-6 pt-2 min-h-0 pb-2 touch-pan-y"
              style={{
                WebkitOverflowScrolling: "touch",
                overscrollBehavior: "contain",
                touchAction: "pan-y",
              }}
            >
              {createTruckMutation.error && (
                <Alert variant="destructive" className="mb-4 bg-red-50 border-red-200">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    {(() => {
                      const error = createTruckMutation.error;
                      if (error instanceof Error) return error.message;
                      if (typeof error === "string") return error;
                      return "Failed to create truck. Please try again.";
                    })()}
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {step === 1 && (
                  <>
                   <FormField
  control={form.control}
  name="vin"
  render={({ field }) => (
    <FormItem>
      <FormLabel>
        VIN <span className="text-red-500">*</span>
      </FormLabel>
      <FormControl>
        <Input
          placeholder="e.g. JTDBR32E720123456"
          maxLength={17}
          {...field}
          onChange={(e) => field.onChange(e.target.value.toUpperCase())}
          className="h-11"
        />
      </FormControl>

      {/* 👇 Visible restriction */}
      <p className="text-xs text-muted-foreground">
        Must be 11–17 characters (letters & numbers).
      </p>

      <FormMessage />
    </FormItem>
  )}
/>

                    <FormField
                      control={form.control}
                      name="plate_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Plate Number <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="ET-A12345" {...field} className="h-11" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="registration_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Registration Date <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input type="date" {...field} className="h-11" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}

                {step === 2 && (
                  <>
                    <FormField
                      control={form.control}
                      name="truck_type"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>
                            Truck Type <span className="text-red-500">*</span>
                          </FormLabel>
                          <Popover
                            open={isTypePopoverOpen}
                            onOpenChange={setIsTypePopoverOpen}
                          >
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  role="combobox"
                                  className={cn(
                                    "w-full h-11 justify-between font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value
                                    ? TRUCK_TYPES.find((t) => t.value === field.value)?.label
                                    : "Select truck type..."}
                                  <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="p-0 w-[var(--radix-popover-trigger-width)]">
                              <Command>
                                <CommandInput placeholder="Search type..." />
                                <CommandList>
                                  <CommandEmpty>No type found.</CommandEmpty>
                                  <CommandGroup>
                                    {TRUCK_TYPES.map((type) => (
                                      <CommandItem
                                        key={type.value}
                                        value={type.label}
                                        onSelect={() => {
                                          form.setValue("truck_type", type.value);
                                          setIsTypePopoverOpen(false);
                                        }}
                                      >
                                        <CheckIcon
                                          className={cn(
                                            "mr-2 h-4 w-4",
                                            type.value === field.value ? "opacity-100" : "opacity-0"
                                          )}
                                        />
                                        {type.label}
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>
                            Status <span className="text-red-500">*</span>
                          </FormLabel>
                          <Popover
                            open={isStatusPopoverOpen}
                            onOpenChange={setIsStatusPopoverOpen}
                          >
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  role="combobox"
                                  className={cn(
                                    "w-full h-11 justify-between font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value
                                    ? TRUCK_STATUSES.find((s) => s.value === field.value)?.label
                                    : "Select status..."}
                                  <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="p-0 w-[var(--radix-popover-trigger-width)]">
                              <Command>
                                <CommandInput placeholder="Search status..." />
                                <CommandList>
                                  <CommandEmpty>No status found.</CommandEmpty>
                                  <CommandGroup>
                                    {TRUCK_STATUSES.map((status) => (
                                      <CommandItem
                                        key={status.value}
                                        value={status.label}
                                        onSelect={() => {
                                          form.setValue("status", status.value);
                                          setIsStatusPopoverOpen(false);
                                        }}
                                      >
                                        <CheckIcon
                                          className={cn(
                                            "mr-2 h-4 w-4",
                                            status.value === field.value ? "opacity-100" : "opacity-0"
                                          )}
                                        />
                                        {status.label}
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

<FormField
  control={form.control}
  name="capacity_quintal"
  render={({ field }) => (
    <FormItem>
      <FormLabel>
        Capacity (Quintal) <span className="text-red-500">*</span>
      </FormLabel>
      <FormControl>
        <Input
          type="number"
          min={1}
          step={1}
          {...field}
          value={field.value === 0 ? "" : field.value}
          onChange={(e) =>
            field.onChange(
              e.target.value === "" ? 0 : Number(e.target.value)
            )
          }
          className="h-11"
        />
      </FormControl>

      <p className="text-xs text-muted-foreground">
        Must be greater than 0.
      </p>

      <FormMessage />
    </FormItem>
  )}
/>

                  </>
                )}

                {step === 3 && (
                  <>
                    <FormField
                      control={form.control}
                      name="make"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Make (optional)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g. Volvo, Isuzu, MAN"
                              {...field}
                              value={field.value ?? ""}
                              className="h-11"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="model"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Model (optional)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g. FH16, FTR, TGX"
                              {...field}
                              value={field.value ?? ""}
                              className="h-11"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="year"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Year (optional)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="2023"
                              {...field}
                              value={field.value ?? ""}
                              onChange={(e) =>
                                field.onChange(e.target.value === "" ? null : Number(e.target.value))
                              }
                              className="h-11"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="color"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Color (optional)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g. White, Blue, Red"
                              {...field}
                              value={field.value ?? ""}
                              className="h-11"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}

                {step === 4 && (
                  <>
                    <FormField
                      control={form.control}
                      name="gov_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Government ID (optional)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g. governmental registration number"
                              {...field}
                              value={field.value ?? ""}
                              className="h-11"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="libre_key"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Libre Key (optional)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Libre / road permit key"
                              {...field}
                              value={field.value ?? ""}
                              className="h-11"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="gps_device_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>GPS Device ID (optional)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="e.g. 12345678"
                              {...field}
                              value={field.value ?? ""}
                              onChange={(e) =>
                                field.onChange(e.target.value === "" ? null : Number(e.target.value))
                              }
                              className="h-11"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
              </div>
            </div>

            <DialogFooter className="p-4 sm:p-6 pt-3 border-t bg-background sticky bottom-0 z-10">
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {step > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    className="order-2 sm:order-1"
                  >
                    Back
                  </Button>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsOpen(false)}
                  className="order-1 sm:order-2"
                >
                  Cancel
                </Button>
              </div>

              {step < 4 ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  className="bg-brand-primary hover:bg-brand-primary/90 order-3"
                >
                  Next
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={createTruckMutation.isPending}
                  className="bg-brand-primary hover:bg-brand-primary/90 min-w-[140px] order-3"
                >
                  {createTruckMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {createTruckMutation.isPending ? "Creating..." : "Add Truck"}
                </Button>
              )}
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}