"use client";

import { Suspense, useEffect, useRef } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Loader2,
  Hash,
  Truck,
  CalendarIcon,
  Settings,
  Link2Off,
} from "lucide-react";
import { MobileBreadcrumb } from "@/components/ui/mobile-breadcrumb";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useGPSDevice, useUpdateGPSDevice } from "@/hooks/use-gps-devices";
import { useUnassignedTrucks } from "@/hooks/use-trucks";
import type { UpdateGPSDeviceRequest } from "@/types/gps-device";

const formSchema = z.object({
  external_device_id: z
    .string()
    .min(1, "External Device ID is required")
    .max(255),
  imei_number: z.string().min(1, "IMEI Number is required").max(50),
  device_name: z.string().max(255).optional().or(z.literal("")),
  device_model: z.string().max(255).optional().or(z.literal("")),
  expire_date: z.date({ message: "Expire date is required" }),
  status: z.boolean(),
  truck_id: z.number().optional(),
  unlink_truck: z.boolean(),
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
      <Skeleton className="h-40 w-full rounded-xl" />
      <Skeleton className="h-24 w-full rounded-xl" />
      <Skeleton className="h-24 w-full rounded-xl" />
    </div>
  );
}

function EditGPSDeviceContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const rawId = searchParams.get("id") || (params.id as string);
  const id = rawId && rawId !== "placeholder" ? Number(rawId) : NaN;

  const { data: device, isLoading } = useGPSDevice(isNaN(id) ? 0 : id);
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
      truck_id: undefined,
      unlink_truck: false,
    },
  });

  useEffect(() => {
    if (isNaN(id)) {
      router.replace("/gps-devices");
    }
  }, [id, router]);

  useEffect(() => {
    if (device && device.id === id && !hasPopulatedForm.current) {
      form.reset({
        external_device_id: device.external_device_id,
        imei_number: device.imei_number,
        device_name: device.device_name || "",
        device_model: device.device_model || "",
        expire_date: new Date(device.expire_date),
        status: device.status,
        truck_id: device.truck_id,
        unlink_truck: false,
      });
      hasPopulatedForm.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [device, id]);

  useEffect(() => {
    hasPopulatedForm.current = false;
  }, [id]);

  if (isNaN(id) || isLoading) {
    return <EditSkeleton />;
  }

  const onSubmit = async (values: FormValues) => {
    const updateData: UpdateGPSDeviceRequest = {
      external_device_id: values.external_device_id,
      imei_number: values.imei_number,
      device_name: values.device_name || undefined,
      device_model: values.device_model || undefined,
      expire_date: values.expire_date.toISOString(),
      status: values.status,
    };

    if (values.unlink_truck) {
      updateData.truck_id = 0;
    } else if (values.truck_id) {
      updateData.truck_id = values.truck_id;
      updateData.last_synced_at = new Date().toISOString();
    }

    updateMutation.mutate(
      { id, data: updateData },
      {
        onSuccess: (updatedDevice) => {
          router.push(`/gps-devices/placeholder?id=${updatedDevice.id}`);
        },
      },
    );
  };

  return (
    <div className="min-h-screen bg-background animate-in fade-in duration-300">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/50">
        <div className="p-4 space-y-2">
          <MobileBreadcrumb
            items={[
              { label: "GPS Devices", href: "/gps-devices" },
              {
                label: device?.external_device_id || "Device",
                href: `/gps-devices/placeholder?id=${id}`,
              },
              { label: "Edit" },
            ]}
          />
          <h1 className="text-lg font-bold">Edit GPS Device</h1>
        </div>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="p-4 space-y-4 pb-28"
        >
          {/* Device Info Section */}
          <div className="p-4 rounded-xl bg-card border border-border/50 shadow-sm">
            <SectionHeader
              icon={Hash}
              title="Device Info"
              accent="bg-blue-500/10 text-blue-500"
            />
            <div className="space-y-3">
              <FormField
                control={form.control}
                name="external_device_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">
                      External Device ID <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter device ID"
                        className="h-11 rounded-xl"
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
                    <FormLabel className="text-xs">
                      IMEI Number <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="15-digit IMEI"
                        className="h-11 rounded-xl font-mono"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="device_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Device Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Optional"
                          className="h-11 rounded-xl"
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
                      <FormLabel className="text-xs">Device Model</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Optional"
                          className="h-11 rounded-xl"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>

          {/* Truck Assignment Section */}
          <div className="p-4 rounded-xl bg-card border border-border/50 shadow-sm">
            <SectionHeader
              icon={Truck}
              title="Truck Assignment"
              accent="bg-emerald-500/10 text-emerald-600"
            />

            {device?.truck_id && (
              <div className="p-3 rounded-lg bg-muted/50 mb-3">
                <p className="text-xs text-muted-foreground">
                  Currently assigned to:{" "}
                  <span className="font-semibold text-foreground">
                    Truck #{device.truck_id}
                  </span>
                </p>
              </div>
            )}

            <div className="space-y-3">
              <FormField
                control={form.control}
                name="unlink_truck"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-3 p-3 rounded-xl border border-border/50 bg-muted/30">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="flex-1">
                      <FormLabel className="text-sm font-medium cursor-pointer">
                        Unlink from Truck
                      </FormLabel>
                      <p className="text-[10px] text-muted-foreground">
                        Remove truck assignment
                      </p>
                    </div>
                    <Link2Off className="h-4 w-4 text-muted-foreground" />
                  </FormItem>
                )}
              />

              {!form.watch("unlink_truck") && (
                <FormField
                  control={form.control}
                  name="truck_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">
                        Reassign to Truck
                      </FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(Number(value))}
                        value={field.value?.toString() || undefined}
                        disabled={loadingTrucks}
                      >
                        <FormControl>
                          <SelectTrigger className="h-11 rounded-xl">
                            <SelectValue
                              placeholder={
                                device?.truck_id
                                  ? `Truck #${device.truck_id} (current)`
                                  : "Select a truck"
                              }
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-xl">
                          {loadingTrucks ? (
                            <SelectItem value="loading" disabled>
                              Loading...
                            </SelectItem>
                          ) : trucks.length === 0 ? (
                            <SelectItem value="no-trucks" disabled>
                              No available trucks
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
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
          </div>

          {/* Expiration & Status Section */}
          <div className="p-4 rounded-xl bg-card border border-border/50 shadow-sm">
            <SectionHeader
              icon={Settings}
              title="Settings"
              accent="bg-gray-500/10 text-gray-600"
            />
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="expire_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-xs">
                      Expire Date <span className="text-red-500">*</span>
                    </FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "h-11 rounded-xl pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground",
                            )}
                          >
                            {field.value ? (
                              format(field.value, "MMM dd, yyyy")
                            ) : (
                              <span>Select date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-auto p-0 rounded-xl"
                        align="start"
                      >
                        <CalendarComponent
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
                    <FormLabel className="text-xs">Status</FormLabel>
                    <Select
                      onValueChange={(value) =>
                        field.onChange(value === "active")
                      }
                      value={field.value ? "active" : "inactive"}
                    >
                      <FormControl>
                        <SelectTrigger className="h-11 rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-xl">
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
        </form>
      </Form>

      {/* Fixed Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-sm border-t border-border/50 flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(`/gps-devices/placeholder?id=${id}`)}
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

export default function EditGPSDeviceClient() {
  return (
    <Suspense fallback={<EditSkeleton />}>
      <EditGPSDeviceContent />
    </Suspense>
  );
}
