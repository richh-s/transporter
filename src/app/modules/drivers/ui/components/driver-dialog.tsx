"use client";

import { toast } from "sonner";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DriverForm } from "./driver-form";
import { Driver } from "../../server/types";
import { createDriverSchema, type CreateDriverInput } from "@/lib/zod/driver/create-driver.schema";
import { useCreateDriver } from "../../server/hooks/use-create-driver";
import { useUpdateDriver } from "../../server/hooks/use-update-driver";
import { ApiError } from "@/lib/api";

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
  const createDriver = useCreateDriver();
  const updateDriver = useUpdateDriver(driver?.id ?? 0);

  const form = useForm<CreateDriverInput>({
    resolver: zodResolver(createDriverSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone_number: "",
      driver_license_number: "",
    },
  });

  useEffect(() => {
    if (open) {
      if (driver) {
        form.reset({
          first_name: driver.first_name,
          last_name: driver.last_name,
          email: driver.email,
          phone_number: driver.phone_number,
          driver_license_number: driver.driver_license_number,
        });
      } else {
        form.reset({
          first_name: "",
          last_name: "",
          email: "",
          phone_number: "",
          driver_license_number: "",
        });
      }
    }
  }, [open, driver, form]);

  const isPending = createDriver.isPending || updateDriver.isPending;

  const handleSubmit = async (values: CreateDriverInput) => {
    try {
      if (driver?.id) {
        await updateDriver.mutateAsync(values);
        toast.success("Driver updated successfully");
      } else {
        await createDriver.mutateAsync(values);
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {driver ? "Edit Driver" : "Add Driver"}
          </DialogTitle>
        </DialogHeader>

        <DriverForm
          form={form}
          onSubmit={handleSubmit}
        />

        <DialogFooter className="mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={form.handleSubmit(handleSubmit)}
            disabled={isPending}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {driver ? "Update Driver" : "Create Driver"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
