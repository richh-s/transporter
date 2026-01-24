"use client";

import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type DriverFormValues = {
  first_name: string;
  last_name: string;
  phone_number: string;
  email: string;
  driver_license_number: string;
};

export function DriverForm({
  defaultValues,
  onSubmit,
}: {
  defaultValues?: Partial<DriverFormValues>;
  onSubmit: (data: DriverFormValues) => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DriverFormValues>({
    defaultValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* First Name */}
      <div className="space-y-1">
        <Label required>First Name</Label>
        <Input
          {...register("first_name", { required: "First name is required" })}
        />
        {errors.first_name && (
          <p className="text-xs text-destructive">
            {errors.first_name.message}
          </p>
        )}
      </div>

      {/* Last Name */}
      <div className="space-y-1">
        <Label required>Last Name</Label>
        <Input
          {...register("last_name", { required: "Last name is required" })}
        />
        {errors.last_name && (
          <p className="text-xs text-destructive">
            {errors.last_name.message}
          </p>
        )}
      </div>

      {/* License Number */}
      <div className="space-y-1">
        <Label required>Driver License Number</Label>
        <Input
          {...register("driver_license_number", {
            required: "License number is required",
          })}
        />
        {errors.driver_license_number && (
          <p className="text-xs text-destructive">
            {errors.driver_license_number.message}
          </p>
        )}
      </div>

      {/* Phone */}
      <div className="space-y-1">
        <Label required>Phone Number</Label>
        <Input
          {...register("phone_number", {
            required: "Phone number is required",
          })}
        />
        {errors.phone_number && (
          <p className="text-xs text-destructive">
            {errors.phone_number.message}
          </p>
        )}
      </div>

      {/* Email */}
      <div className="space-y-1">
        <Label required>Email</Label>
        <Input
          type="email"
          {...register("email", {
            required: "Email is required",
            pattern: {
              value: /^\S+@\S+$/i,
              message: "Invalid email address",
            },
          })}
        />
        {errors.email && (
          <p className="text-xs text-destructive">
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Submit */}
      <Button className="w-full">Save Driver</Button>
    </form>
  );
}
