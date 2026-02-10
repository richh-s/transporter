"use client";

import { toast } from "sonner";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FileText, Loader2, Upload, User, X, ArrowRight, CheckCircle2, ChevronDown } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { useUploadDriverDocument } from "../../server/hooks/use-upload-driver-document";
import { ApiError } from "@/lib/api";

const driverSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  driver_license_number: z.string().min(1, "License number is required"),
  phone_number: z.string().min(1, "Phone number is required"),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  status: z.enum(["active", "suspended"]),
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
  const router = useRouter();
  const isEdit = !!driver;
  const [step, setStep] = useState(1);
  const [createdDriverId, setCreatedDriverId] = useState<number | null>(null);
  const [documentType, setDocumentType] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const createDriver = useCreateDriver();
  const updateDriver = useUpdateDriver(driver?.id ?? 0);
  const uploadDocumentMutation = useUploadDriverDocument();

  const form = useForm<DriverFormValues>({
    resolver: zodResolver(driverSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      driver_license_number: "",
      phone_number: "",
      email: "",
      status: "active",
    },
  });

  useEffect(() => {
    if (open) {
      if (driver) {
        setStep(1);
        form.reset({
          first_name: driver.first_name || "",
          last_name: driver.last_name || "",
          driver_license_number: driver.driver_license_number || "",
          phone_number: driver.phone_number || "",
          email: driver.email || "",
          status: driver.status as "active" | "suspended",
        });
      } else {
        setStep(1);
        setCreatedDriverId(null);
        setSelectedFile(null);
        setDocumentType("");
        form.reset({
          first_name: "",
          last_name: "",
          driver_license_number: "",
          phone_number: "",
          email: "",
          status: "active",
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
        onOpenChange(false);
      } else {
        const result = await createDriver.mutateAsync(values as CreateDriverInput);

        // Log the result to help debug response structure issues
        console.log("🚗 Driver creation response:", result);

        // Robust check for the driver ID in the response
        // Result might be { result: { id: ... } } (ApiResult pattern) 
        // or just { id: ... } (Direct object pattern)
        const newDriverId = (result as any)?.result?.id || (result as any)?.id;

        if (newDriverId) {
          setCreatedDriverId(newDriverId);
          setStep(2);
          toast.success("Driver created successfully. Now upload documents.");
        } else {
          console.error("❌ Failed to find driver ID in response:", result);
          toast.error("Driver created but unexpected response from server.");
        }
      }
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
      } else if (error instanceof ApiError) {
        if (error.code === "DRIVER_DUPLICATE") {
          toast.error("Driver already exists");
        } else {
          toast.error(error.message || "Failed to save driver");
        }
      } else {
        toast.error("An unexpected error occurred");
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className={cn(
          "p-0 gap-0 overflow-hidden rounded-2xl",
          "w-[95vw] sm:max-w-lg",
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
            <div className="flex-1 relative flex flex-col min-h-0 group/scroll">
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {step === 1 ? (
                  <>
                    {/* Name Fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

                    {/* Status Field */}
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">
                            Status <span className="text-red-500">*</span>
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="h-11 rounded-xl">
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="rounded-xl">
                              <SelectItem value="active" className="rounded-lg">
                                Active
                              </SelectItem>
                              <SelectItem value="suspended" className="rounded-lg">
                                Suspended
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                ) : (
                  <div className="space-y-6 py-2">
                    <div className="text-center space-y-2">
                      <div className="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                      </div>
                      <h3 className="text-lg font-bold">Driver Added!</h3>
                      <p className="text-sm text-muted-foreground">
                        Upload the required documents for the driver.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="driver-doc-type">Document Type</Label>
                        <Select value={documentType} onValueChange={setDocumentType}>
                          <SelectTrigger id="driver-doc-type" className="h-11 rounded-xl">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl">
                            <SelectItem value="driver_id">Driver ID</SelectItem>
                            <SelectItem value="driver_license">Driver License</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="driver-file">File</Label>
                        <input
                          ref={fileInputRef}
                          id="driver-file"
                          type="file"
                          className="hidden"
                          onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                          accept=".pdf,.jpg,.jpeg,.png"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full h-20 border-2 border-dashed rounded-xl flex flex-col gap-1"
                        >
                          {selectedFile ? (
                            <>
                              <FileText className="h-5 w-5 text-primary" />
                              <span className="text-xs font-medium truncate max-w-[200px]">
                                {selectedFile.name}
                              </span>
                            </>
                          ) : (
                            <>
                              <Upload className="h-5 w-5 text-muted-foreground" />
                              <span className="text-xs font-medium">Click to select file</span>
                            </>
                          )}
                        </Button>
                      </div>

                      <Button
                        type="button"
                        className="w-full h-11 rounded-xl"
                        disabled={!selectedFile || !documentType || uploadDocumentMutation.isPending}
                        onClick={async () => {
                          if (selectedFile && documentType && createdDriverId) {
                            try {
                              await uploadDocumentMutation.mutateAsync({
                                driverId: createdDriverId,
                                file: selectedFile,
                                document_type: documentType,
                              });
                              toast.success("Document uploaded successfully");
                              setSelectedFile(null);
                              setDocumentType("");
                              if (fileInputRef.current) fileInputRef.current.value = "";
                            } catch (err) {
                              toast.error("Failed to upload document");
                            }
                          }
                        }}
                      >
                        {uploadDocumentMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Upload className="mr-2 h-4 w-4" />
                            Upload Document
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Scroll Indicator for Mobile */}
              {step === 1 && (
                <div className="sm:hidden absolute bottom-0 left-0 right-0 h-10 pointer-events-none bg-gradient-to-t from-background via-background/60 to-transparent flex items-end justify-center pb-2 z-10">
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-background/50 backdrop-blur-[2px] rounded-full border border-border/50 text-[10px] font-medium text-muted-foreground animate-bounce">
                    <ChevronDown className="h-3 w-3" />
                    <span>Scroll for more fields</span>
                  </div>
                </div>
              )}
            </div>

            {/* Fixed Footer */}
            <div className="shrink-0 bg-background border-t border-border/50 p-4 flex gap-3">
              {step === 1 ? (
                <>
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
                      <>
                        Next
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 h-11 rounded-xl"
                    onClick={() => {
                      if (createdDriverId) {
                        router.push(`/drivers/placeholder?id=${createdDriverId}`);
                        onOpenChange(false);
                      }
                    }}
                  >
                    Go to Details
                  </Button>
                  <Button
                    type="button"
                    className="flex-1 h-11 rounded-xl"
                    onClick={() => onOpenChange(false)}
                  >
                    Done
                  </Button>
                </>
              )}
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
