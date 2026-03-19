"use client";

import { useState, useEffect } from "react";
import { Loader2, XCircle, CheckIcon, ChevronsUpDownIcon } from "lucide-react";
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
import { humanizeError } from "@/lib/utils/error-humanizer";
import type { Truck } from "@/lib/api/trucks";
import { toast } from "sonner";
import { useUpdateTruck, ApiError } from "@/app/modules/fleet/server/hooks/use-update-truck";
import { useTranslation } from "react-i18next";

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
  year: z.number().max(2100, "Year should be less than or equal to 2100").nullable().optional(),
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

interface EditTruckModalProps {
  truck: Truck | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function EditTruckModal({
  truck,
  isOpen,
  onOpenChange,
  onSuccess,
}: EditTruckModalProps) {
  const { t } = useTranslation(["fleet", "common"]);
  const [isTypePopoverOpen, setIsTypePopoverOpen] = useState(false);
  const [isStatusPopoverOpen, setIsStatusPopoverOpen] = useState(false);

  const updateTruckMutation = useUpdateTruck();

  const form = useForm<TruckFormValues>({
    resolver: zodResolver(truckFormSchema),
    defaultValues: {
      vin: "",
      plate_number: "",
      status: "active",
      truck_type: "flatbed",
      registration_date: "",
      gov_id: "",
      make: "",
      model: "",
      year: null,
      color: "",
      capacity_quintal: 0,
      libre_key: "",
      gps_device_id: null,
    },
  });

  // Reset form when truck changes or modal closes
  useEffect(() => {
    if (!isOpen) {
      updateTruckMutation.reset();
      return;
    }

    if (truck) {
      form.reset({
        vin: truck.vin,
        plate_number: truck.plate_number,
        status: truck.status as TruckFormValues["status"],
        truck_type: truck.truck_type as TruckFormValues["truck_type"],
        registration_date: truck.registration_date,
        gov_id: truck.gov_id || "",
        make: truck.make || "",
        model: truck.model || "",
        year: truck.year,
        color: truck.color || "",
        capacity_quintal: truck.capacity_quintal,
        libre_key: truck.libre_key || "",
        gps_device_id: truck.gps_device_id,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [truck, isOpen]); // form.reset and updateTruckMutation.reset are stable

  const onSubmit = async (values: TruckFormValues) => {
    if (!truck) return;

    try {
      await updateTruckMutation.mutateAsync({
        id: truck.id,
        data: values,
      });
      // Only close modal and show success on actual success
      toast.success(t("fleet:messages.truck_updated"));
      onOpenChange(false);
      onSuccess?.();
    } catch (err: unknown) {
      if (err instanceof ApiError && err.fields) {
        // Map backend field errors to React Hook Form
        Object.entries(err.fields).forEach(([field, message]) => {
          form.setError(field as keyof TruckFormValues, {
            type: "manual",
            message: humanizeError(message as string),
          });
        });
        const firstError = Object.values(err.fields)[0];
        toast.error(humanizeError(firstError as string));
      } else {
        console.error("Failed to update truck:", err);
        toast.error(err instanceof Error ? err.message : t("common:messages.error_generic"));
      }
    }
  };

  if (!truck) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-[600px] max-w-[95vw] h-auto max-h-[85vh] sm:h-[500px] flex flex-col p-0 overflow-hidden"
      >
        <DialogHeader className="p-4 sm:p-6 pb-2">
          <DialogTitle className="text-lg sm:text-xl">{t("fleet:labels.edit_truck")}</DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            {t("fleet:subtitle")}
          </DialogDescription>
          <p className="text-xs text-muted-foreground mt-1">
            {t("common:labels.required_fields_hint", { defaultValue: "Fields marked with * are required." })}
          </p>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.target instanceof HTMLInputElement) {
                e.preventDefault();
              }
            }}
            className="flex-1 flex flex-col overflow-hidden"
          >
            {/* Hidden field to satisfy zod schema */}
            <input type="hidden" {...form.register("registration_date")} />

            <div
              className="flex-1 overflow-y-auto overflow-x-hidden overscroll-contain p-4 sm:p-6 pt-2 scrollbar-hide"
              style={{ WebkitOverflowScrolling: "touch" }}
            >
              {updateTruckMutation.error && !(updateTruckMutation.error instanceof ApiError && updateTruckMutation.error.code === "VALIDATION_ERROR") && (
                <Alert
                  variant="destructive"
                  className="mb-4 bg-red-50 border-red-200"
                >
                  <XCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    {updateTruckMutation.error instanceof Error
                      ? updateTruckMutation.error.message
                      : t("common:messages.error_generic")}
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <FormField
                  control={form.control}
                  name="vin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t("fleet:fields.vin")} <span className="text-red-500">*</span>
                      </FormLabel>
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
                  name="plate_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t("fleet:fields.plate_number")} <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="h-11 border-gray-200 focus-visible:border-brand-secondary focus-visible:ring-1 focus-visible:ring-brand-secondary"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="truck_type"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>
                        {t("fleet:fields.truck_type")} <span className="text-red-500">*</span>
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
                                "w-full h-11 justify-between border-gray-200 font-normal",
                                !field.value && "text-muted-foreground",
                              )}
                            >
                              {field.value
                                ? t(`fleet:types.${field.value.toLowerCase()}`, { defaultValue: field.value })
                                : t("common:labels.select")}
                              <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent
                          className="p-0"
                          align="start"
                          style={{
                            width: "var(--radix-popover-trigger-width)",
                          }}
                        >
                          <Command>
                            <CommandInput placeholder={t("common:labels.search_placeholder", { defaultValue: "Search..." })} />
                            <CommandList>
                              <CommandEmpty>{t("common:labels.no_results", { defaultValue: "No results found." })}</CommandEmpty>
                              <CommandGroup>
                                {TRUCK_TYPES.map((type) => (
                                  <CommandItem
                                    value={type.value}
                                    key={type.value}
                                    onSelect={() => {
                                      form.setValue("truck_type", type.value);
                                      setIsTypePopoverOpen(false);
                                    }}
                                  >
                                    <CheckIcon
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        type.value === field.value
                                          ? "opacity-100"
                                          : "opacity-0",
                                      )}
                                    />
                                    {t(`fleet:types.${type.value.toLowerCase()}`, { defaultValue: type.label })}
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
                        {t("fleet:fields.status")} <span className="text-red-500">*</span>
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
                                "w-full h-11 justify-between border-gray-200 font-normal",
                                !field.value && "text-muted-foreground",
                              )}
                            >
                              {field.value
                                ? t(`fleet:status.${field.value.toLowerCase()}`, { defaultValue: field.value })
                                : t("common:labels.select")}
                              <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent
                          className="p-0"
                          align="start"
                          style={{
                            width: "var(--radix-popover-trigger-width)",
                          }}
                        >
                          <Command>
                            <CommandInput placeholder={t("common:labels.search_placeholder")} />
                            <CommandList>
                              <CommandEmpty>{t("common:labels.no_results")}</CommandEmpty>
                              <CommandGroup>
                                {TRUCK_STATUSES.map((status) => (
                                  <CommandItem
                                    value={status.value}
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
                                          : "opacity-0",
                                      )}
                                    />
                                    {t(`fleet:status.${status.value.toLowerCase()}`, { defaultValue: status.label })}
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
                        {t("fleet:fields.capacity")} ({t("fleet:labels.unit_kg")}){" "}
                        <span className="text-red-500">*</span>
                      </FormLabel>
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

                <FormField
                  control={form.control}
                  name="make"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("fleet:fields.make")} ({t("common:labels.optional")})</FormLabel>
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 col-span-full">
                  <FormField
                    control={form.control}
                    name="model"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("fleet:fields.model")} ({t("common:labels.optional")})</FormLabel>
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
                        <FormLabel>{t("fleet:fields.gps_id")} ({t("common:labels.optional")})</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => {
                              const val = e.target.value;
                              field.onChange(val === "" ? null : Number(val));
                            }}
                            value={field.value || ""}
                            className="h-11 border-gray-200 focus-visible:border-brand-secondary focus-visible:ring-1 focus-visible:ring-brand-secondary"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 col-span-full">
                  <FormField
                    control={form.control}
                    name="year"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("fleet:fields.year")} ({t("common:labels.optional")})</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => {
                              const val = e.target.value;
                              field.onChange(val === "" ? null : Number(val));
                            }}
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
                        <FormLabel>{t("common:fields.color", { defaultValue: "Color" })} ({t("common:labels.optional")})</FormLabel>
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
                </div>

                <FormField
                  control={form.control}
                  name="gov_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("fleet:fields.gov_id")} ({t("common:labels.optional")})</FormLabel>
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
                      <FormLabel>{t("common:fields.libre_key", { defaultValue: "Libre Key" })} ({t("common:labels.optional")})</FormLabel>
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
              </div>
            </div>

            <DialogFooter className="p-4 sm:p-6 pt-2 bg-background border-t">
              <Button
                variant="outline"
                type="button"
                onClick={() => onOpenChange(false)}
              >
                {t("common:buttons.cancel")}
              </Button>
              <Button
                type="submit"
                disabled={updateTruckMutation.isPending}
                className="bg-brand-primary hover:bg-brand-secondary text-white transition-all active:scale-[0.98]"
              >
                {updateTruckMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {t("common:buttons.save_changes", { defaultValue: "Save Changes" })}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
