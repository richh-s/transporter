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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useGPSDevice, useUpdateGPSDevice } from "@/hooks/use-gps-devices";
import { useUnassignedTrucks } from "@/hooks/use-trucks";
import type { UpdateGPSDeviceRequest } from "@/types/gps-device";

const formSchema = z.object({
  external_device_id: z
    .string()
    .min(1, "External Device ID is required")
    .max(255, "External Device ID must be less than 255 characters"),
  imei_number: z
    .string()
    .min(1, "IMEI Number is required")
    .max(50, "IMEI Number must be less than 50 characters"),
  device_name: z.string().max(255).optional().or(z.literal("")),
  device_model: z.string().max(255).optional().or(z.literal("")),
  expire_date: z.date({
    message: "Expire date is required",
  }),
  last_synced_at: z.date().optional(), // Will be set automatically to now()
  status: z.boolean(),
  truck_id: z.number().optional(),
  unlink_truck: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

export default function EditGPSDeviceClient() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);

  const { data: device, isLoading } = useGPSDevice(id);
  // Include current truck in unassigned list if it exists (so user can keep it or change it)
  const { data: trucks = [], isLoading: loadingTrucks } = useUnassignedTrucks(
    device?.truck_id,
  );
  const updateMutation = useUpdateGPSDevice();
  const hasPopulatedForm = useRef(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      external_device_id: "",
      imei_number: "",
      device_name: "",
      device_model: "",
      status: true,
      expire_date: undefined,
      last_synced_at: undefined,
      truck_id: undefined,
      unlink_truck: false,
    },
  });

  // Populate form when device data is loaded (only once per device)
  useEffect(() => {
    if (device && device.id === id && !hasPopulatedForm.current) {
      form.reset({
        external_device_id: device.external_device_id,
        imei_number: device.imei_number,
        device_name: device.device_name || "",
        device_model: device.device_model || "",
        expire_date: new Date(device.expire_date),
        last_synced_at: undefined, // Will be set automatically on submit
        status: device.status,
        truck_id: device.truck_id,
        unlink_truck: false,
      });
      hasPopulatedForm.current = true;
    }
  }, [device, id, form]);

  // Reset the flag when device ID changes
  useEffect(() => {
    hasPopulatedForm.current = false;
  }, [id]);

  const onSubmit = async (values: FormValues) => {
    const updateData: UpdateGPSDeviceRequest = {
      external_device_id: values.external_device_id,
      imei_number: values.imei_number,
      device_name: values.device_name || undefined,
      device_model: values.device_model || undefined,
      expire_date: values.expire_date.toISOString(),
      status: values.status,
    };

    // Handle truck assignment
    if (values.unlink_truck) {
      updateData.truck_id = 0;
      // Don't update last_synced_at when unlinked - keep existing value (cannot be null)
    } else if (values.truck_id) {
      updateData.truck_id = values.truck_id;
      // Update last_synced_at to now() when assigning/reassigning to a truck
      updateData.last_synced_at = new Date().toISOString();
    }
    // If no truck selected and no unlink, don't update truck_id or last_synced_at

    updateMutation.mutate(
      { id, data: updateData },
      {
        onSuccess: (updatedDevice) => {
          // Log for debugging
          console.log("Updated device:", updatedDevice);
          console.log("Truck ID:", updatedDevice.truck_id);
          router.push(`/gps-devices/${updatedDevice.id}`);
        },
      },
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

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push(`/gps-devices/${id}`)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-brand-primary">
            Edit GPS Device
          </h1>
          <p className="text-sm text-muted-foreground">
            {device?.external_device_id}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Device Information</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Device Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold">Device Information</h3>
                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="external_device_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          External Device ID{" "}
                          <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter external device ID"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="imei_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          IMEI Number <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Enter IMEI number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="device_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Device Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter device name (optional)"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="device_model"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Device Model</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter device model (optional)"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="expire_date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>
                          Expire Date <span className="text-red-500">*</span>
                        </FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground",
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Select expiration date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                            />
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
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select
                          onValueChange={(value) =>
                            field.onChange(value === "active")
                          }
                          value={field.value ? "active" : "inactive"}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Truck Assignment */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold">Truck Assignment</h3>
                <Separator />

                {device?.truck_id && (
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">
                      Current Truck: Truck #{device.truck_id}
                    </p>
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="unlink_truck"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="mt-1"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Unlink from Truck</FormLabel>
                        <FormDescription>
                          Check this to unlink the device from its current truck
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                {!form.watch("unlink_truck") && (
                  <FormField
                    control={form.control}
                    name="truck_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reassign to Truck</FormLabel>
                        <Select
                          onValueChange={(value) =>
                            field.onChange(Number(value))
                          }
                          value={field.value?.toString() || undefined}
                          disabled={loadingTrucks}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue
                                placeholder={
                                  device?.truck_id
                                    ? `Truck #${device.truck_id} (current)`
                                    : "Select a truck (optional)"
                                }
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {loadingTrucks ? (
                              <SelectItem value="loading" disabled>
                                Loading trucks...
                              </SelectItem>
                            ) : trucks.length === 0 ? (
                              <SelectItem
                                value="no-trucks"
                                disabled
                                className="text-red-500"
                              >
                                No available truck to assign
                              </SelectItem>
                            ) : (
                              trucks.map(
                                (truck: {
                                  id: number;
                                  license_plate?: string;
                                  license_plate_number?: string;
                                  plate_number?: string;
                                }) => (
                                  <SelectItem
                                    key={truck.id}
                                    value={truck.id.toString()}
                                  >
                                    Truck #{truck.id} -{" "}
                                    {truck.license_plate ||
                                      truck.license_plate_number ||
                                      truck.plate_number ||
                                      "N/A"}
                                  </SelectItem>
                                ),
                              )
                            )}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          {trucks.length === 0 && !loadingTrucks ? (
                            <span className="text-red-500">
                              No available truck to assign. All trucks are
                              currently assigned to GPS devices.
                            </span>
                          ) : (
                            "Select a different truck to reassign this device"
                          )}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(`/gps-devices/${id}`)}
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
