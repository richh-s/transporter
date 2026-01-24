"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/* ---------------- Schema ---------------- */
const driverSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  driver_license_number: z
    .string()
    .min(1, "License number is required"),
  phone_number: z.string().min(1, "Phone number is required"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email address"),
});

export type DriverFormValues = z.infer<typeof driverSchema>;

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
    resolver: zodResolver(driverSchema),
    defaultValues,
    mode: "onSubmit",
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* First Name */}
      <div className="space-y-1">
        <Label>
          First Name <span className="text-red-500">*</span>
        </Label>
        <Input
          {...register("first_name")}
          className={errors.first_name ? "border-red-500" : ""}
        />
        {errors.first_name && (
          <p className="text-sm text-destructive">
            {errors.first_name.message}
          </p>
        )}
      </div>

      {/* Last Name */}
      <div className="space-y-1">
        <Label>
          Last Name <span className="text-red-500">*</span>
        </Label>
        <Input
          {...register("last_name")}
          className={errors.last_name ? "border-red-500" : ""}
        />
        {errors.last_name && (
          <p className="text-sm text-destructive">
            {errors.last_name.message}
          </p>
        )}
      </div>

      {/* Driver License Number */}
      <div className="space-y-1">
        <Label>
          Driver License Number <span className="text-red-500">*</span>
        </Label>
        <Input
          {...register("driver_license_number")}
          className={
            errors.driver_license_number ? "border-red-500" : ""
          }
        />
        {errors.driver_license_number && (
          <p className="text-sm text-destructive">
            {errors.driver_license_number.message}
          </p>
        )}
      </div>

      {/* Phone Number */}
      <div className="space-y-1">
        <Label>
          Phone Number <span className="text-red-500">*</span>
        </Label>
        <Input
          {...register("phone_number")}
          className={errors.phone_number ? "border-red-500" : ""}
        />
        {errors.phone_number && (
          <p className="text-sm text-destructive">
            {errors.phone_number.message}
          </p>
        )}
      </div>

      {/* Email */}
      <div className="space-y-1">
        <Label>
          Email <span className="text-red-500">*</span>
        </Label>
        <Input
          type="email"
          {...register("email")}
          className={errors.email ? "border-red-500" : ""}
        />
        {errors.email && (
          <p className="text-sm text-destructive">
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Submit */}
      <Button type="submit" className="w-full">
        Save Driver
      </Button>
    </form>
  );
}
