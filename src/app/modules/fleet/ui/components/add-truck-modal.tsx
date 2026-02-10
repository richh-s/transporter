"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Loader2,
  XCircle,
  ArrowLeft,
  ArrowRight,
  X,
  Truck,
  Hash,
  Settings,
  FileText,
  Upload,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  useCreateTruck,
  ApiError,
  useUploadTruckDocument,
} from "@/app/modules/fleet/server/hooks";
import { Label } from "@/components/ui/label";
import { useRef } from "react";

const truckFormSchema = z.object({
  vin: z
    .string()
    .min(11, "VIN must be at least 11 characters")
    .max(17, "VIN cannot exceed 17 characters"),
  plate_number: z
    .string()
    .min(3, "Plate number must be at least 3 characters")
    .max(20, "Plate number cannot exceed 20 characters"),
  registration_date: z.string().min(1, "Registration date is required"),
  truck_type: z.enum(["flatbed", "trailer"]).refine((v) => v !== undefined, {
    message: "Truck type is required",
  }),
  status: z
    .enum(["active", "inactive", "maintenance", "out_of_service"])
    .refine((v) => v !== undefined, {
      message: "Status is required",
    }),
  capacity_quintal: z.number().min(1, "Capacity must be greater than 0"),
  year: z
    .number()
    .min(1900, "Year is invalid")
    .max(2100, "Year is invalid")
    .nullable()
    .optional(),
  gps_device_id: z
    .number()
    .min(1, "GPS Device ID must be positive")
    .nullable()
    .optional(),
  make: z.string().nullable().optional(),
  model: z.string().nullable().optional(),
  color: z.string().nullable().optional(),
  gov_id: z.string().nullable().optional(),
  libre_key: z.string().nullable().optional(),
});

type TruckFormValues = z.infer<typeof truckFormSchema>;

const TRUCK_TYPES = [
  { value: "flatbed", label: "Flatbed" },
  { value: "trailer", label: "Trailer" },
] as const;

const TRUCK_STATUSES = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "maintenance", label: "Maintenance" },
  { value: "out_of_service", label: "Out of Service" },
] as const;

const STEPS = [
  { id: 1, title: "Truck Details", icon: Truck },
  { id: 2, title: "Upload Documents", icon: FileText },
];

interface AddTruckModalProps {
  onSuccess?: () => void;
  variant?: "default" | "icon-only";
}

export function AddTruckModal({
  onSuccess,
  variant = "default",
}: AddTruckModalProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [createdTruckId, setCreatedTruckId] = useState<number | null>(null);
  const [documentType, setDocumentType] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const createTruckMutation = useCreateTruck();
  const uploadDocumentMutation = useUploadTruckDocument();

  const defaultValues: TruckFormValues = {
    vin: "",
    plate_number: "",
    registration_date: new Date().toISOString().split("T")[0],
    truck_type: "flatbed",
    status: "active",
    capacity_quintal: 0,
    make: "",
    model: "",
    year: null,
    color: "",
    gov_id: "",
    libre_key: "",
    gps_device_id: null,
  };

  const form = useForm<TruckFormValues>({
    resolver: zodResolver(truckFormSchema),
    defaultValues,
    mode: "onChange",
  });

  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setCreatedTruckId(null);
      form.reset(defaultValues);
      createTruckMutation.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const onSubmit = async (values: TruckFormValues) => {
    if (step !== 1) return;

    try {
      const result = await createTruckMutation.mutateAsync(values);

      // Log the result to help debug response structure issues
      console.log("🚛 Truck creation response:", result);

      // Robust check for the truck ID in the response
      const newTruckId = (result as any)?.id || (result as any)?.result?.id;

      if (newTruckId) {
        setCreatedTruckId(newTruckId);
        setStep(2);
        toast.success("Truck created successfully. Now upload documents.");
      } else {
        console.error("❌ Failed to find truck ID in response:", result);
        toast.error("Truck created but unexpected response from server.");
      }
    } catch (err: unknown) {
      if (err instanceof ApiError && err.fields) {
        Object.entries(err.fields).forEach(([field, message]) => {
          form.setError(field as keyof TruckFormValues, {
            type: "manual",
            message: message as string,
          });
        });
      }
      console.error("Failed to create truck:", err);
    }
  };

  const StepIcon = STEPS[step - 1].icon;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {variant === "icon-only" ? (
          <Button
            className="h-9 rounded-xl bg-primary hover:bg-primary/90 text-xs px-3"
            title="Add New Truck"
          >
            <Plus className="mr-1 h-3.5 w-3.5" /> Add
          </Button>
        ) : (
          <Button className="rounded-xl h-11 bg-primary hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" /> Add New Truck
          </Button>
        )}
      </DialogTrigger>

      <DialogContent
        showCloseButton={false}
        className={cn(
          "p-0 gap-0 overflow-hidden rounded-2xl",
          "w-[95vw] sm:max-w-lg",
          "h-[85vh] max-h-[650px]",
          "flex flex-col",
        )}
      >
        {/* Fixed Header */}
        <div className="shrink-0 bg-background border-b border-border/50 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10">
                <StepIcon className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h2 className="text-base font-bold">Add New Truck</h2>
                <p className="text-xs text-muted-foreground">
                  Step {step} of 2: {STEPS[step - 1].title}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-xl"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-primary h-full transition-all duration-300 ease-out"
              style={{ width: `${(step / 2) * 100}%` }}
            />
          </div>
        </div>

        {/* Scrollable Content */}
        {step === 1 ? (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.target instanceof HTMLInputElement) {
                  e.preventDefault();
                }
              }}
              className="flex-1 flex flex-col min-h-0"
            >
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {createTruckMutation.error && (
                  <Alert
                    variant="destructive"
                    className="rounded-xl bg-red-50 border-red-200"
                  >
                    <XCircle className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                      {(() => {
                        const error = createTruckMutation.error;
                        if (error instanceof Error) return error.message;
                        if (typeof error === "string") return error;
                        return "Failed to create truck. Please try again.";
                      })()}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="vin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Vehicle Identification Number (VIN) <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input
                            placeholder="JTDBR32..."
                            maxLength={17}
                            {...field}
                            onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                            className="h-11 rounded-xl"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="plate_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Plate Number <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input placeholder="ET-A12345" {...field} className="h-11 rounded-xl" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="truck_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Type <span className="text-red-500">*</span></FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-11 rounded-xl">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="rounded-xl">
                            {TRUCK_TYPES.map((type) => (
                              <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="capacity_quintal"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Capacity (Q) <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            value={field.value === 0 ? "" : field.value}
                            onChange={(e) => field.onChange(e.target.value === "" ? 0 : Number(e.target.value))}
                            className="h-11 rounded-xl"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="make"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Make</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Volvo" {...field} value={field.value ?? ""} className="h-11 rounded-xl" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="model"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Model</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. FH16" {...field} value={field.value ?? ""} className="h-11 rounded-xl" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="year"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Year</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="2023"
                            {...field}
                            value={field.value ?? ""}
                            onChange={(e) => field.onChange(e.target.value === "" ? null : Number(e.target.value))}
                            className="h-11 rounded-xl"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Status <span className="text-red-500">*</span></FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-11 rounded-xl">
                              <SelectValue placeholder="Status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="rounded-xl">
                            {TRUCK_STATUSES.map((status) => (
                              <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="gov_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Gov ID</FormLabel>
                        <FormControl>
                          <Input placeholder="Optional" {...field} value={field.value ?? ""} className="h-11 rounded-xl" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="gps_device_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">GPS ID</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            value={field.value ?? ""}
                            onChange={(e) => field.onChange(e.target.value === "" ? null : Number(e.target.value))}
                            className="h-11 rounded-xl"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Step 1 Footer */}
              <div className="shrink-0 bg-background border-t border-border/50 p-4 flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 h-11 rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createTruckMutation.isPending}
                  className="flex-1 h-11 rounded-xl"
                >
                  {createTruckMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      Next
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        ) : (
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="text-center space-y-2">
                <div className="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <Truck className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-lg font-bold">Truck Registered!</h3>
                <p className="text-sm text-muted-foreground">
                  Now, upload the necessary documents to complete the profile.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="document-type">Document Type</Label>
                  <Select value={documentType} onValueChange={setDocumentType}>
                    <SelectTrigger id="document-type" className="h-11 rounded-xl">
                      <SelectValue placeholder="Select document type" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="libre">Libre</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="file">File</Label>
                  <input
                    ref={fileInputRef}
                    id="file"
                    type="file"
                    className="hidden"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
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
                  className="w-full h-11 rounded-xl"
                  disabled={!selectedFile || !documentType || uploadDocumentMutation.isPending}
                  onClick={async () => {
                    if (selectedFile && documentType && createdTruckId) {
                      try {
                        await uploadDocumentMutation.mutateAsync({
                          truckId: String(createdTruckId),
                          file: selectedFile,
                          documentType,
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
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Document
                    </>
                  )}
                </Button>
              </div>

              <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl flex items-start gap-3">
                <XCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-xs font-bold text-amber-900">Required Documents</p>
                  <p className="text-[10px] text-amber-700 leading-relaxed">
                    A valid Libre and Insurance certificate are required for the truck to be assigned to active shipments.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 2 Footer */}
            <div className="shrink-0 bg-background border-t border-border/50 p-4 flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1 h-11 rounded-xl"
                onClick={() => {
                  if (createdTruckId) {
                    router.push(`/fleet/placeholder?id=${createdTruckId}`);
                    setIsOpen(false);
                    onSuccess?.();
                  }
                }}
              >
                Go to Details
              </Button>
              <Button
                type="button"
                className="flex-1 h-11 rounded-xl"
                onClick={() => {
                  setIsOpen(false);
                  onSuccess?.();
                }}
              >
                Done
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
