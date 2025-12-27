"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useUnassignedTrucks } from "@/hooks/use-trucks";
import { useCreateGPSDevice } from "@/hooks/use-gps-devices";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";

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
    required_error: "Expire date is required",
  }),
  last_synced_at: z.date().optional(), // Will be set automatically to now()
  status: z.boolean().default(true),
  truck_id: z.number().min(1, "Truck selection is required"),
});

type FormValues = z.infer<typeof formSchema>;

export default function CreateGPSDevicePage() {
  const router = useRouter();
  const { data: trucks = [], isLoading: loadingTrucks } = useUnassignedTrucks();
  const createMutation = useCreateGPSDevice();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      external_device_id: "",
      imei_number: "",
      device_name: "",
      device_model: "",
      status: true,
      expire_date: undefined,
      last_synced_at: undefined, // Will be set automatically on submit
      truck_id: undefined,
    },
  });

  const onSubmit = async (values: FormValues) => {
    const deviceData = {
      external_device_id: values.external_device_id,
      imei_number: values.imei_number,
      device_name: values.device_name || undefined,
      device_model: values.device_model || undefined,
      expire_date: values.expire_date.toISOString(),
      // Always set last_synced_at to now() when creating (required field, cannot be null)
      last_synced_at: new Date().toISOString(),
      status: values.status,
      truck_id: values.truck_id!,
    };

    createMutation.mutate(deviceData, {
      onSuccess: (device) => {
        router.push(`/gps-devices/${device.id}`);
      },
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/gps-devices")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-brand-primary">
            Create New GPS Device
          </h1>
          <p className="text-sm text-muted-foreground">
            Add a new GPS tracking device to your fleet
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
              {/* Required Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold">Required Information</h3>
                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="external_device_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          External Device ID <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter external device ID"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Unique identifier from GPS device manufacturer
                        </FormDescription>
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
                          <Input
                            placeholder="Enter IMEI number"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>15-digit IMEI number</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="truck_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Truck <span className="text-red-500">*</span>
                        </FormLabel>
                        <Select
                          onValueChange={(value) =>
                            field.onChange(Number(value))
                          }
                          value={field.value?.toString()}
                          disabled={loadingTrucks}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a truck" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {loadingTrucks ? (
                              <SelectItem value="loading" disabled>
                                Loading trucks...
                              </SelectItem>
                            ) : trucks.length === 0 ? (
                              <SelectItem value="no-trucks" disabled className="text-red-500">
                                No available truck to assign
                              </SelectItem>
                            ) : (
                              trucks.map((truck) => (
                                <SelectItem
                                  key={truck.id}
                                  value={truck.id.toString()}
                                >
                                  Truck #{truck.id} - {truck.license_plate || truck.license_plate_number || truck.plate_number || "N/A"}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          {trucks.length === 0 && !loadingTrucks ? (
                            <span className="text-red-500">
                              No available truck to assign. All trucks are currently assigned to GPS devices.
                            </span>
                          ) : (
                            "Select a truck to assign this GPS device to"
                          )}
                        </FormDescription>
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
                                  !field.value && "text-muted-foreground"
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
                              disabled={(date) => date < new Date()}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormDescription>
                          Device subscription/service expiration date
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                </div>
              </div>

              {/* Optional Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold">Optional Information</h3>
                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        <FormDescription>
                          Human-readable name for the device
                        </FormDescription>
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
                        <FormDescription>
                          Model name/number of the device
                        </FormDescription>
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
                        <FormDescription>
                          Device status (default: Active)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/gps-devices")}
                  disabled={createMutation.isPending}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Device"
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

