"use client";

import { toast } from "sonner";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, User, X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { Driver } from "../../server/types";
import { type CreateDriverInput } from "@/lib/zod/driver/create-driver.schema";
import { useCreateDriver } from "../../server/hooks/use-create-driver";
import { useUpdateDriver } from "../../server/hooks/use-update-driver";
import { ApiError } from "@/lib/api";

const driverSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  driver_license_number: z.string().min(1, "License number is required"),
  phone_number: z.string().min(1, "Phone number is required"),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
});

type DriverFormValues = z.infer<typeof driverSchema>;

interface DriverDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  driver: Driver | null;
}

export function DriverDialog({
  open,
  onOpenChange,
  driver,
}: DriverDialogProps) {
  const isEdit = !!driver;
  const createDriver = useCreateDriver();
  const updateDriver = useUpdateDriver(driver?.id ?? 0);

  const form = useForm<DriverFormValues>({
    resolver: zodResolver(driverSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      driver_license_number: "",
      phone_number: "",
      email: "",
    },
  });

  useEffect(() => {
    if (open) {
      if (driver) {
        form.reset({
          first_name: driver.first_name || "",
          last_name: driver.last_name || "",
          driver_license_number: driver.driver_license_number || "",
          phone_number: driver.phone_number || "",
          email: driver.email || "",
        });
      } else {
        form.reset({
          first_name: "",
          last_name: "",
          driver_license_number: "",
          phone_number: "",
          email: "",
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, driver]);

  const isPending = createDriver.isPending || updateDriver.isPending;

  const handleSubmit = async (values: DriverFormValues) => {
    try {
      if (driver?.id) {
        await updateDriver.mutateAsync(values as CreateDriverInput);
        toast.success("Driver updated successfully");
      } else {
        await createDriver.mutateAsync(values as CreateDriverInput);
        toast.success("Driver created successfully");
      }
      onOpenChange(false);
    } catch (error) {
      if (error instanceof ApiError && error.fields) {
        Object.entries(error.fields).forEach(([field, message]) => {
          let translatedMessage = message as string;

          // Customize phone number error message
          if (field === "phone_number") {
            translatedMessage = "Must be in format like +251XXXXXXXXX";
          }

          form.setError(field as keyof CreateDriverInput, {
            type: "manual",
            message: translatedMessage,
          });
        });
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className={cn(
          "p-0 gap-0 overflow-hidden rounded-2xl",
          "w-full max-w-lg",
          "h-[85vh] max-h-[550px]",
          "flex flex-col",
        )}
      >
        {/* Fixed Header */}
        <div className="shrink-0 bg-background border-b border-border/50 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10">
                <User className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h2 className="text-base font-bold">
                  {isEdit ? "Edit Driver" : "Add Driver"}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {isEdit
                    ? "Update driver information"
                    : "Enter driver details"}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-xl"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Scrollable Content */}
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.target instanceof HTMLInputElement) {
                e.preventDefault();
              }
            }}
            className="flex-1 flex flex-col min-h-0"
          >
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="first_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">
                        First Name <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="John"
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
                  name="last_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">
                        Last Name <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Doe"
                          className="h-11 rounded-xl"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* License Number */}
              <FormField
                control={form.control}
                name="driver_license_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">
                      License Number <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="DL-123456789"
                        className="h-11 rounded-xl font-mono"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Phone Number */}
              <FormField
                control={form.control}
                name="phone_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">
                      Phone Number <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="+2519XXXXXXXX"
                        className="h-11 rounded-xl"
                        {...field}
                      />
                    </FormControl>
                    <p className="text-[10px] text-muted-foreground">
                      Include country code (e.g. +251)
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">
                      Email <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="john@example.com"
                        className="h-11 rounded-xl"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Fixed Footer */}
            <div className="shrink-0 bg-background border-t border-border/50 p-4 flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1 h-11 rounded-xl"
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 h-11 rounded-xl"
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : isEdit ? (
                  "Save Changes"
                ) : (
                  "Add Driver"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
