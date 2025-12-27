"use client";

import { useState, useEffect } from "react";
import { Plus, Loader2, XCircle, CheckIcon, ChevronsUpDownIcon } from "lucide-react";
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
    .min(1, "VIN is required")
    .max(17, "VIN cannot exceed 17 characters"),
  plate_number: z
    .string()
    .min(1, "Plate number is required")
    .max(20, "Plate number cannot exceed 20 characters"),
  status: z.enum(["active", "inactive", "maintenance", "out_of_service"]),
  truck_type: z.enum(["flatbed", "trailer"]),
  registration_date: z.string().min(1, "Registration date is required"),
  gov_id: z.string().nullable().optional(),
  make: z.string().nullable().optional(),
  model: z.string().nullable().optional(),
  year: z.number().nullable().optional(),
  color: z.string().nullable().optional(),
  capacity_quintal: z.number().min(1, "Capacity is required"),
  libre_key: z.string().nullable().optional(),
  gps_device_id: z.number().nullable().optional(),
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
}

export function AddTruckModal({ onSuccess }: AddTruckModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [isTypePopoverOpen, setIsTypePopoverOpen] = useState(false);
  const [isStatusPopoverOpen, setIsStatusPopoverOpen] = useState(false);

  const createTruckMutation = useCreateTruck();

  const defaultValues: TruckFormValues = {
    vin: "",
    plate_number: "",
    status: "active",
    truck_type: "flatbed",
    registration_date: new Date().toISOString().split("T")[0],
    gov_id: "",
    make: "",
    model: "",
    year: null,
    color: "",
    capacity_quintal: 0,
    libre_key: "",
    gps_device_id: null,
  };

  const form = useForm<TruckFormValues>({
    resolver: zodResolver(truckFormSchema),
    defaultValues,
    mode: "onChange",
  });

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      form.reset(defaultValues);
      createTruckMutation.reset();
    }
  }, [isOpen]);

  const validateStep1 = async () => {
    return await form.trigger(["vin", "plate_number"]);
  };

  const validateStep2 = async () => {
    return await form.trigger(["truck_type", "status", "capacity_quintal"]);
  };

  const validateStep3 = async () => {
    return await form.trigger(["make", "model", "year", "color"]);
  };

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
    } catch (err: any) {
      console.error("Failed to create truck:", err);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full bg-brand-primary hover:bg-brand-secondary h-11">
          <Plus className="mr-2 h-4 w-4" /> Add New Truck
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-w-[95vw] h-[500px] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-4 sm:p-6 pb-2">
          <DialogTitle className="text-lg sm:text-xl">
            Add New Truck
          </DialogTitle>
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
              if (
                e.key === "Enter" &&
                e.target instanceof HTMLInputElement
              ) {
                e.preventDefault();
              }
            }}
            className="flex-1 flex flex-col overflow-hidden"
          >
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 pt-2">
              {createTruckMutation.error && (
                <Alert
                  variant="destructive"
                  className="mb-4 bg-red-50 border-red-200"
                >
                  <XCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    {createTruckMutation.error instanceof Error
                      ? createTruckMutation.error.message
                      : "Failed to create truck. Please try again."}
                  </AlertDescription>
                </Alert>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {step === 1 && (
                  <>
                    <FormField
                      control={form.control}
                      name="vin"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>VIN</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Vehicle Identification Number"
                              {...field}
                              value={field.value || ""}
                              className="h-11 border-gray-200 focus-visible:border-brand-secondary focus-visible:ring-1 focus-visible:ring-brand-secondary"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="plate_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Plate Number</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="ET-A1234"
                              {...field}
                              className="h-11 border-gray-200 focus-visible:border-brand-secondary focus-visible:ring-1 focus-visible:ring-brand-secondary"
                            />
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
                          <FormLabel>Truck Type</FormLabel>
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
                                    "w-full h-11 min-w-0 justify-between border-gray-200 font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value
                                    ? TRUCK_TYPES.find(
                                        (type) => type.value === field.value
                                      )?.label
                                    : "Select type..."}
                                  <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent
                              className="p-0"
                              align="start"
                              sideOffset={4}
                              style={{
                                width: "var(--radix-popover-trigger-width)",
                              }}
                            >
                              <Command>
                                <CommandInput placeholder="Search type..." />
                                <CommandList>
                                  <CommandEmpty>No type found.</CommandEmpty>
                                  <CommandGroup>
                                    {TRUCK_TYPES.map((type) => (
                                      <CommandItem
                                        value={type.label}
                                        key={type.value}
                                        onSelect={() => {
                                          form.setValue(
                                            "truck_type",
                                            type.value
                                          );
                                          setIsTypePopoverOpen(false);
                                        }}
                                      >
                                        <CheckIcon
                                          className={cn(
                                            "mr-2 h-4 w-4",
                                            type.value === field.value
                                              ? "opacity-100"
                                              : "opacity-0"
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
                          <FormLabel>Status</FormLabel>
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
                                    "w-full h-11 min-w-0 justify-between border-gray-200 font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value
                                    ? TRUCK_STATUSES.find(
                                        (status) =>
                                          status.value === field.value
                                      )?.label
                                    : "Select status..."}
                                  <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent
                              className="p-0"
                              align="start"
                              sideOffset={4}
                              style={{
                                width: "var(--radix-popover-trigger-width)",
                              }}
                            >
                              <Command>
                                <CommandInput placeholder="Search status..." />
                                <CommandList>
                                  <CommandEmpty>No status found.</CommandEmpty>
                                  <CommandGroup>
                                    {TRUCK_STATUSES.map((status) => (
                                      <CommandItem
                                        value={status.label}
                                        key={status.value}
                                        onSelect={() => {
                                          form.setValue("status", status.value);
                                          setIsStatusPopoverOpen(false);
                                        }}
                                      >
                                        <CheckIcon
                                          className={cn(
                                            "mr-2 h-4 w-4",
                                            status.value === field.value
                                              ? "opacity-100"
                                              : "opacity-0"
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
                          <FormLabel>Capacity (Quintal)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) => {
                                const val = e.target.value;
                                field.onChange(val === "" ? 0 : Number(val));
                              }}
                              value={field.value === 0 ? "" : field.value}
                              placeholder="0"
                              className="h-11 border-gray-200 focus-visible:border-brand-secondary focus-visible:ring-1 focus-visible:ring-brand-secondary"
                            />
                          </FormControl>
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
                          <FormLabel>Make (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g. Isuzu, Volvo"
                              {...field}
                              value={field.value || ""}
                              className="h-11 border-gray-200 focus-visible:border-brand-secondary focus-visible:ring-1 focus-visible:ring-brand-secondary"
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
                          <FormLabel>Model (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g. FSR, FH16"
                              {...field}
                              value={field.value || ""}
                              className="h-11 border-gray-200 focus-visible:border-brand-secondary focus-visible:ring-1 focus-visible:ring-brand-secondary"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4 col-span-full">
                      <FormField
                        control={form.control}
                        name="year"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Year (Optional)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="2023"
                                {...field}
                                value={field.value || ""}
                                className="h-11 border-gray-200 focus-visible:border-brand-secondary focus-visible:ring-1 focus-visible:ring-brand-secondary"
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
                            <FormLabel>Color (Optional)</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="White"
                                {...field}
                                value={field.value || ""}
                                className="h-11 border-gray-200 focus-visible:border-brand-secondary focus-visible:ring-1 focus-visible:ring-brand-secondary"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </>
                )}

                {step === 4 && (
                  <>
                    <FormField
                      control={form.control}
                      name="gov_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Government ID (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              value={field.value || ""}
                              className="h-11 border-gray-200 focus-visible:border-brand-secondary focus-visible:ring-1 focus-visible:ring-brand-secondary"
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
                          <FormLabel>Libre Key (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              value={field.value || ""}
                              className="h-11 border-gray-200 focus-visible:border-brand-secondary focus-visible:ring-1 focus-visible:ring-brand-secondary"
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
                          <FormLabel>GPS Device ID (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              value={field.value || ""}
                              className="h-11 border-gray-200 focus-visible:border-brand-secondary focus-visible:ring-1 focus-visible:ring-brand-secondary"
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

            <DialogFooter className="p-4 sm:p-6 pt-2 bg-background flex flex-row items-center justify-between sm:justify-between space-x-0 border-t">
              <div className="flex gap-2">
                {step > 1 && (
                  <Button
                    variant="outline"
                    type="button"
                    onClick={prevStep}
                    className="h-11"
                  >
                    Back
                  </Button>
                )}
                <Button
                  variant="ghost"
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="h-11"
                >
                  Cancel
                </Button>
              </div>

              {step < 4 ? (
                <Button
                  type="button"
                  onClick={(e) => nextStep(e)}
                  className="bg-brand-primary h-11 px-8"
                >
                  Next Step
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={createTruckMutation.isPending}
                  className="bg-brand-primary hover:bg-brand-secondary text-white transition-all active:scale-[0.98] h-11 px-8"
                >
                  {createTruckMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Add Truck
                </Button>
              )}
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

