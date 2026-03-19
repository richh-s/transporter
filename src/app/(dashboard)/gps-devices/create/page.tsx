"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Hash, Truck, Calendar, CalendarIcon } from "lucide-react";
import { CompactBreadcrumb } from "@/components/ui/mobile-breadcrumb";
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
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation(["gps", "common"]);
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
      last_synced_at: new Date(Date.now() - 10000).toISOString(),
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
        <div className="p-4 space-y-2">
          <CompactBreadcrumb
            parentLabel={t("gps:create_form.breadcrumb_parent")}
            parentHref="/gps-devices"
            currentLabel={t("gps:create_form.breadcrumb_current")}
          />
          <h1 className="text-lg font-bold">{t("gps:create_form.title")}</h1>
        </div>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="p-4 space-y-4"
        >
          {/* Device Info Section */}
          <div className="p-4 rounded-xl bg-card border border-border/50 shadow-sm">
            <SectionHeader
              icon={Hash}
              title={t("gps:create_form.sections.device_info")}
              accent="bg-blue-500/10 text-blue-500"
            />
            <div className="space-y-3">
              <FormField
                control={form.control}
                name="external_device_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">
                      {t("gps:create_form.labels.external_id")} <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("gps:create_form.placeholders.enter_id")}
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
                      {t("gps:create_form.labels.imei")} <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("gps:create_form.placeholders.imei")}
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
                    <FormLabel className="text-xs">{t("gps:create_form.labels.device_name")}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("gps:create_form.placeholders.optional")}
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
                      <FormLabel className="text-xs">{t("gps:create_form.labels.device_model")}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("gps:create_form.placeholders.optional")}
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
              title={t("gps:create_form.sections.truck_assignment")}
              accent="bg-emerald-500/10 text-emerald-600"
            />
            <FormField
              control={form.control}
              name="truck_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">
                    {t("gps:create_form.labels.truck")} <span className="text-red-500">*</span>
                  </FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(Number(value))}
                    value={field.value?.toString()}
                    disabled={loadingTrucks}
                  >
                    <FormControl>
                      <SelectTrigger className="h-11 rounded-xl">
                        <SelectValue placeholder={t("gps:create_form.placeholders.select_truck")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="rounded-xl">
                      {loadingTrucks ? (
                        <SelectItem value="loading" disabled>
                          {t("gps:create_form.truck_states.loading")}
                        </SelectItem>
                      ) : trucks.length === 0 ? (
                        <SelectItem value="no-trucks" disabled>
                          {t("gps:create_form.truck_states.no_available")}
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
                      {t("gps:create_form.truck_states.all_assigned")}
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
              title={t("gps:create_form.sections.expiration_status")}
              accent="bg-amber-500/10 text-amber-600"
            />
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="expire_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-xs">
                      {t("gps:create_form.labels.expire_date")} <span className="text-red-500">*</span>
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
                              <span>{t("gps:create_form.placeholders.select_date")}</span>
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
                    <FormLabel className="text-xs">{t("gps:create_form.labels.status")}</FormLabel>
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
                        <SelectItem value="active">{t("gps:create_form.status.active")}</SelectItem>
                        <SelectItem value="inactive">{t("gps:create_form.status.inactive")}</SelectItem>
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

      {/* Actions */}
      <div className="p-4 flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/gps-devices")}
          disabled={createMutation.isPending}
          className="flex-1 h-11 rounded-xl"
        >
          {t("gps:create_form.buttons.cancel")}
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
              {t("gps:create_form.buttons.creating")}
            </>
          ) : (
            t("gps:create_form.buttons.create")
          )}
        </Button>
      </div>
    </div>
  );
}
