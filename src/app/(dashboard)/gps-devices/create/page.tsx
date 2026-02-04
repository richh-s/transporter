"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  ArrowLeft,
  Loader2,
  Hash,
  Truck,
  Calendar,
  CalendarIcon,
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { useUnassignedTrucks } from "@/hooks/use-trucks";
import { useCreateGPSDevice } from "@/hooks/use-gps-devices";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

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
  truck_id: z.number().min(1, "Truck selection is required"),
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
      last_synced_at: new Date().toISOString(),
      status: values.status,
      truck_id: values.truck_id!,
    };

    createMutation.mutate(deviceData, {
      onSuccess: (device) => {
        router.push(`/gps-devices/placeholder?id=${device.id}`);
      },
    });
  };

  return (
    <div className="min-h-screen bg-background animate-in fade-in duration-300">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/50">
        <div className="flex items-center gap-3 p-4">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-xl"
            onClick={() => router.push("/gps-devices")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-base font-bold">Create Device</h1>
            <p className="text-xs text-muted-foreground">Add new GPS device</p>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="p-4 space-y-4 pb-40 lg:pb-28"
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
            <FormField
              control={form.control}
              name="truck_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">
                    Assign to Truck <span className="text-red-500">*</span>
                  </FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(Number(value))}
                    value={field.value?.toString()}
                    disabled={loadingTrucks}
                  >
                    <FormControl>
                      <SelectTrigger className="h-11 rounded-xl">
                        <SelectValue placeholder="Select a truck" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="rounded-xl">
                      {loadingTrucks ? (
                        <SelectItem value="loading" disabled>
                          Loading trucks...
                        </SelectItem>
                      ) : trucks.length === 0 ? (
                        <SelectItem value="no-trucks" disabled>
                          No available trucks
                        </SelectItem>
                      ) : (
                        trucks.map((truck) => (
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
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {trucks.length === 0 && !loadingTrucks && (
                    <p className="text-[10px] text-red-500 mt-1">
                      All trucks are already assigned to GPS devices
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Expiration & Status Section */}
          <div className="p-4 rounded-xl bg-card border border-border/50 shadow-sm">
            <SectionHeader
              icon={Calendar}
              title="Expiration & Status"
              accent="bg-amber-500/10 text-amber-600"
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
                          disabled={(date) => date < new Date()}
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

      {/* Fixed Bottom Actions - above mobile nav */}
      <div className="fixed bottom-16 lg:bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-sm border-t border-border/50 flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/gps-devices")}
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
            "Create Device"
          )}
        </Button>
      </div>
    </div>
  );
}
