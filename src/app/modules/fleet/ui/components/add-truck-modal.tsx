"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Loader2,
  XCircle,
  ArrowLeft,
  ArrowRight,
  X,
  Truck,
  Hash,
  Settings,
  FileText,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useCreateTruck, ApiError } from "@/app/modules/fleet/server/hooks/use-create-truck";

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
  truck_type: z.enum(["flatbed", "trailer"]).refine((v) => v !== undefined, {
    message: "Truck type is required",
  }),
  status: z
    .enum(["active", "inactive", "maintenance", "out_of_service"])
    .refine((v) => v !== undefined, {
      message: "Status is required",
    }),
  capacity_quintal: z.number().min(1, "Capacity must be greater than 0"),
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

const STEPS = [
  { id: 1, title: "Identification", icon: Hash },
  { id: 2, title: "Configuration", icon: Settings },
  { id: 3, title: "Vehicle Details", icon: Truck },
  { id: 4, title: "Compliance", icon: FileText },
];

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

  const validateStep1 = () =>
    form.trigger(["vin", "plate_number", "registration_date"]);
  const validateStep2 = () =>
    form.trigger(["truck_type", "status", "capacity_quintal"]);
  const validateStep3 = () => form.trigger(["make", "model", "year", "color"]);

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
      toast.success("Truck created successfully");
      setIsOpen(false);
      form.reset();
      onSuccess?.();
    } catch (err: unknown) {
      if (err instanceof ApiError && err.fields) {
        // Map backend field errors to React Hook Form
        Object.entries(err.fields).forEach(([field, message]) => {
          form.setError(field as keyof TruckFormValues, {
            type: "manual",
            message: message as string,
          });

          // Determine which step the error belongs to and navigate there
          if (["vin", "plate_number"].includes(field)) setStep(1);
          else if (["truck_type", "status", "capacity_quintal"].includes(field))
            setStep(2);
          else if (["make", "model", "year", "color"].includes(field))
            setStep(3);
          else if (["gov_id", "libre_key", "gps_device_id"].includes(field))
            setStep(4);
        });
      }
      console.error("Failed to create truck:", err);
    }
  };

  const StepIcon = STEPS[step - 1].icon;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {variant === "icon-only" ? (
          <Button
            className="h-9 rounded-xl bg-primary hover:bg-primary/90 text-xs px-3"
            title="Add New Truck"
          >
            <Plus className="mr-1 h-3.5 w-3.5" /> Add
          </Button>
        ) : (
          <Button className="rounded-xl h-11 bg-primary hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" /> Add New Truck
          </Button>
        )}
      </DialogTrigger>

      <DialogContent
        showCloseButton={false}
        className={cn(
          "p-0 gap-0 overflow-hidden rounded-2xl",
          "w-full max-w-lg",
          "h-[85vh] max-h-[600px]",
          "flex flex-col",
        )}
      >
        {/* Fixed Header */}
        <div className="shrink-0 bg-background border-b border-border/50 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10">
                <StepIcon className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h2 className="text-base font-bold">Add New Truck</h2>
                <p className="text-xs text-muted-foreground">
                  Step {step} of 4: {STEPS[step - 1].title}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-xl"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-primary h-full transition-all duration-300 ease-out"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* Scrollable Content */}
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.target instanceof HTMLInputElement) {
                e.preventDefault();
              }
            }}
            className="flex-1 flex flex-col min-h-0"
          >
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {createTruckMutation.error && (
                <Alert
                  variant="destructive"
                  className="rounded-xl bg-red-50 border-red-200"
                >
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

              {/* Step 1: Identification */}
              {step === 1 && (
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="vin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">
                          Vehicle Identification Number (VIN) <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g. JTDBR32E720123456"
                            maxLength={17}
                            {...field}
                            onChange={(e) =>
                              field.onChange(e.target.value.toUpperCase())
                            }
                            className="h-11 rounded-xl"
                          />
                        </FormControl>
                        <p className="text-[10px] text-muted-foreground">
                          11–17 characters (letters & numbers)
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
                        <FormLabel className="text-xs">
                          Plate Number <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="ET-A12345"
                            {...field}
                            className="h-11 rounded-xl"
                          />
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
                        <FormLabel className="text-xs">
                          Registration Date{" "}
                          <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            {...field}
                            className="h-11 rounded-xl"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Step 2: Configuration */}
              {step === 2 && (
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="truck_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">
                          Truck Type <span className="text-red-500">*</span>
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-11 rounded-xl">
                              <SelectValue placeholder="Select truck type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="rounded-xl">
                            {TRUCK_TYPES.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
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
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">
                          Status <span className="text-red-500">*</span>
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-11 rounded-xl">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="rounded-xl">
                            {TRUCK_STATUSES.map((status) => (
                              <SelectItem
                                key={status.value}
                                value={status.value}
                              >
                                {status.label}
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
                    name="capacity_quintal"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">
                          Capacity (Quintal){" "}
                          <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            step={1}
                            placeholder="Enter capacity"
                            {...field}
                            value={field.value === 0 ? "" : field.value}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value === ""
                                  ? 0
                                  : Number(e.target.value),
                              )
                            }
                            className="h-11 rounded-xl"
                          />
                        </FormControl>
                        <p className="text-[10px] text-muted-foreground">
                          Must be greater than 0
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Step 3: Vehicle Details */}
              {step === 3 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name="make"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Make</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g. Volvo"
                              {...field}
                              value={field.value ?? ""}
                              className="h-11 rounded-xl"
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
                          <FormLabel className="text-xs">Model</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g. FH16"
                              {...field}
                              value={field.value ?? ""}
                              className="h-11 rounded-xl"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name="year"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Year</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="2023"
                              {...field}
                              value={field.value ?? ""}
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value === ""
                                    ? null
                                    : Number(e.target.value),
                                )
                              }
                              className="h-11 rounded-xl"
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
                          <FormLabel className="text-xs">Color</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g. White"
                              {...field}
                              value={field.value ?? ""}
                              className="h-11 rounded-xl"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}

              {/* Step 4: Compliance & Tracking */}
              {step === 4 && (
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="gov_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Government ID</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Registration number"
                            {...field}
                            value={field.value ?? ""}
                            className="h-11 rounded-xl"
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
                        <FormLabel className="text-xs">Libre Key</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Road permit key"
                            {...field}
                            value={field.value ?? ""}
                            className="h-11 rounded-xl"
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
                        <FormLabel className="text-xs">GPS Device ID</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="e.g. 12345678"
                            {...field}
                            value={field.value ?? ""}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value === ""
                                  ? null
                                  : Number(e.target.value),
                              )
                            }
                            className="h-11 rounded-xl"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </div>

            {/* Fixed Footer */}
            <div className="shrink-0 bg-background border-t border-border/50 p-4 flex gap-3">
              {step > 1 ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  className="flex-1 h-11 rounded-xl"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 h-11 rounded-xl"
                >
                  Cancel
                </Button>
              )}

              {step < 4 ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  className="flex-1 h-11 rounded-xl"
                >
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={createTruckMutation.isPending}
                  className="flex-1 h-11 rounded-xl"
                >
                  {createTruckMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Add Truck"
                  )}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
