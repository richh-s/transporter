"use client";

import { useState, useEffect, useRef } from "react";
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
  ChevronDown,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateTruck } from "../../server/hooks/use-create-truck";
import { useUploadTruckDocument } from "../../server/hooks/use-truck-documents";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

const truckFormSchema = z.object({
  vin: z.string().min(1, "VIN is required").max(17, "VIN cannot exceed 17 characters"),
  plate_number: z.string().min(1, "Plate number is required"),
  truck_type: z.string().min(1, "Truck type is required"),
  capacity_quintal: z.number().min(0.1, "Capacity must be at least 0.1"),
  make: z.string().nullable(),
  model: z.string().nullable(),
  year: z.number().nullable(),
  status: z.string().min(1, "Status is required"),
  gov_id: z.string().nullable(),
  gps_device_id: z.number().nullable(),
});

type TruckFormValues = z.infer<typeof truckFormSchema>;

const TRUCK_TYPES = [
  { label: "Dry Cargo", value: "dry_cargo" },
  { label: "Refrigerated", value: "refrigerated" },
  { label: "Flatbed", value: "flatbed" },
  { label: "Container", value: "container" },
  { label: "Tanker", value: "tanker" },
];

const TRUCK_STATUSES = [
  { label: "Active", value: "active" },
  { label: "Maintenance", value: "maintenance" },
  { label: "Inactive", value: "inactive" },
];

interface AddTruckModalProps {
  onSuccess?: () => void;
}

export function AddTruckModal({ onSuccess }: AddTruckModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [createdTruckId, setCreatedTruckId] = useState<number | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const createTruckMutation = useCreateTruck();
  const uploadDocumentMutation = useUploadTruckDocument();

  const form = useForm<TruckFormValues>({
    resolver: zodResolver(truckFormSchema),
    defaultValues: {
      vin: "",
      plate_number: "",
      truck_type: "",
      capacity_quintal: 0,
      make: "",
      model: "",
      year: null,
      status: "active",
      gov_id: "",
      gps_device_id: null,
    },
  });

  // Reset state when modal closes/opens
  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setCreatedTruckId(null);
      setSelectedFile(null);
      setDocumentType("");
      form.reset();
    }
  }, [isOpen, form]);

  async function onSubmit(values: TruckFormValues) {
    try {
      const result = await createTruckMutation.mutateAsync(values);

      // Log the result to help debug response structure issues
      console.log("🚛 Truck creation response:", result);

      // Robust check for the truck ID in the response (could be in result.id or result.result.id)
      const newTruckId = (result as any)?.id || (result as any)?.result?.id;

      if (newTruckId) {
        setCreatedTruckId(newTruckId);
        setStep(2);
        toast.success("Truck created successfully. Now upload documents.");
      } else {
        console.error("❌ Failed to find truck ID in response:", result);
        toast.error("Truck created but unexpected response from server.");
      }
    } catch (error) {
      console.error("Failed to create truck:", error);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="h-10 px-4 rounded-xl gap-2 font-medium">
          <Plus className="h-4 w-4" />
          Add Truck
        </Button>
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
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10">
                <Truck className="h-4 w-4 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold">
                  {step === 1 ? "Add New Truck" : "Upload Documents"}
                </DialogTitle>
                <p className="text-xs text-muted-foreground">
                  {step === 1 ? "Step 1: Vehicle Details" : "Step 2: Legal Documents"}
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

          <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-primary h-full transition-all duration-300 ease-out"
              style={{ width: `${(step / 2) * 100}%` }}
            />
          </div>
        </div>

        {/* Scrollable Content Container */}
        <div className="flex-1 relative flex flex-col min-h-0 group/scroll">
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

                {/* Scroll Indicator for Mobile Step 1 */}
                <div className="sm:hidden absolute bottom-16 left-0 right-0 h-10 pointer-events-none bg-gradient-to-t from-background via-background/60 to-transparent flex items-end justify-center pb-2 z-10">
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-background/50 backdrop-blur-[2px] rounded-full border border-border/50 text-[10px] font-medium text-muted-foreground animate-bounce">
                    <ChevronDown className="h-3 w-3" />
                    <span>Scroll for more fields</span>
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
            <div className="flex-1 flex flex-col min-h-0 relative">
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

              {/* Scroll Indicator for Mobile Step 2 */}
              <div className="sm:hidden absolute bottom-16 left-0 right-0 h-10 pointer-events-none bg-gradient-to-t from-background via-background/60 to-transparent flex items-end justify-center pb-2 z-10">
                <div className="flex items-center gap-1.5 px-3 py-1 bg-background/50 backdrop-blur-[2px] rounded-full border border-border/50 text-[10px] font-medium text-muted-foreground animate-bounce">
                  <ChevronDown className="h-3 w-3" />
                  <span>Scroll for more</span>
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
