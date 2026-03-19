"use client";

import { useState, useEffect, useRef } from "react";
import {
  Plus,
  Loader2,
  XCircle,
  ArrowRight,
  X,
  Truck,
  FileText,
  Upload,
  ChevronDown,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateTruck, ApiError } from "../../server/hooks/use-create-truck";
import { useUploadTruckDocument } from "../../server/hooks/use-truck-documents";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { humanizeError } from "@/lib/utils/error-humanizer";
import {
  Dialog,
  DialogContent,
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
  { label: "Flatbed", value: "flatbed" },
  { label: "Trailer", value: "trailer" },
];

const TRUCK_STATUSES = [
  { label: "Active", value: "active" },
  { label: "Maintenance", value: "maintenance" },
  { label: "Inactive", value: "inactive" },
];

interface AddTruckModalProps {
  onSuccess?: () => void;
  variant?: "default" | "icon-only";
}

export function AddTruckModal({ onSuccess, variant = "default" }: AddTruckModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [createdTruckId, setCreatedTruckId] = useState<number | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const createTruckMutation = useCreateTruck();
  const uploadDocumentMutation = useUploadTruckDocument();

  const { t } = useTranslation(["fleet", "common", "validation"]);

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
      status: "inactive",
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
      // Add default registration_date to satisfy API requirements
      const payload = {
        ...values,
        registration_date: new Date().toISOString().split("T")[0],
      };
      const result = await createTruckMutation.mutateAsync(payload as Parameters<typeof createTruckMutation.mutateAsync>[0]);

      // Robust check for the truck ID in the response (could be in result.id or result.result.id)
      const newTruckId = (result as { id?: number; result?: { id: number } })?.id || (result as { result?: { id: number } })?.result?.id;

      if (newTruckId) {
        setCreatedTruckId(newTruckId);
        setStep(2);
        toast.success(t("fleet:messages.truck_created_upload"));
      } else {
        console.error("❌ Failed to find truck ID in response:", result);
        toast.error(t("fleet:messages.truck_created_error"));
      }
    } catch (error) {
      if (error instanceof ApiError && error.fields) {
        // Map backend field errors to React Hook Form
        Object.entries(error.fields).forEach(([field, message]) => {
          form.setError(field as keyof TruckFormValues, {
            type: "manual",
            message: humanizeError(message as string),
          });
        });
        const firstError = Object.values(error.fields)[0];
        toast.error(humanizeError(firstError as string));
      } else if (error instanceof ApiError) {
        toast.error(error.message || t("common:messages.error_generic", { defaultValue: "An unexpected error occurred" }));
      } else {
        console.error("Failed to create truck:", error);
        toast.error(t("common:messages.error_generic", { defaultValue: "An unexpected error occurred" }));
      }
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {variant === "icon-only" ? (
          <Button size="icon" className="rounded-xl h-10 w-10">
            <Plus className="h-5 w-5" />
          </Button>
        ) : (
          <Button className="h-10 px-4 rounded-xl gap-2 font-medium">
            <Plus className="h-4 w-4" />
            {t("fleet:labels.add_truck")}
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
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10">
                <Truck className="h-4 w-4 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold">
                  {step === 1 ? t("fleet:labels.add_truck") : t("fleet:labels.upload_docs")}
                </DialogTitle>
                <p className="text-xs text-muted-foreground">
                  {step === 1 
                    ? t("common:labels.step_x", { step: 1, total: 2, label: t("fleet:labels.vehicle_details") })
                    : t("common:labels.step_x", { step: 2, total: 2, label: t("fleet:labels.legal_docs") })
                  }
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
                  {createTruckMutation.error && !(createTruckMutation.error instanceof ApiError && createTruckMutation.error.code === "VALIDATION_ERROR") && (
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
                          return t("common:messages.error_generic", { defaultValue: "Failed to create. Please try again." });
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
                          <FormLabel className="text-xs">{t("fleet:fields.vin")} <span className="text-red-500">*</span></FormLabel>
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
                          <FormLabel className="text-xs">{t("fleet:fields.plate_number")} <span className="text-red-500">*</span></FormLabel>
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
                          <FormLabel className="text-xs">{t("fleet:fields.truck_type")} <span className="text-red-500">*</span></FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-11 rounded-xl">
                                <SelectValue placeholder={t("common:labels.select")} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="rounded-xl">
                              {TRUCK_TYPES.map((type) => (
                                <SelectItem key={type.value} value={type.value}>{t(`fleet:types.${type.value.toLowerCase()}`, { defaultValue: type.label })}</SelectItem>
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
                          <FormLabel className="text-xs">{t("fleet:fields.capacity")} ({t("fleet:labels.unit_kg")}) <span className="text-red-500">*</span></FormLabel>
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
                          <FormLabel className="text-xs">{t("fleet:fields.make")}</FormLabel>
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
                          <FormLabel className="text-xs">{t("fleet:fields.model")}</FormLabel>
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
                          <FormLabel className="text-xs">{t("fleet:fields.year")}</FormLabel>
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
                          <FormLabel className="text-xs">{t("fleet:fields.status")} <span className="text-red-500">*</span></FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                            disabled={true}
                          >
                            <FormControl>
                              <SelectTrigger className="h-11 rounded-xl bg-muted/50">
                                <SelectValue placeholder={t("fleet:fields.status")} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="rounded-xl">
                              {TRUCK_STATUSES.map((status) => (
                                <SelectItem key={status.value} value={status.value}>{t(`fleet:status.${status.value.toLowerCase()}`, { defaultValue: status.label })}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <p className="text-[10px] text-muted-foreground mt-1">
                            {t("fleet:labels.inactive_initial_hint", { defaultValue: "Set to inactive initially. Will be active after Libre is uploaded." })}
                          </p>
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
                          <FormLabel className="text-xs">{t("fleet:fields.gov_id")}</FormLabel>
                          <FormControl>
                            <Input placeholder={t("common:labels.optional", { defaultValue: "Optional" })} {...field} value={field.value ?? ""} className="h-11 rounded-xl" />
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
                          <FormLabel className="text-xs">{t("fleet:fields.gps_id")}</FormLabel>
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
                    <span>{t("common:labels.scroll_for_more", { defaultValue: "Scroll for more fields" })}</span>
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
                    {t("common:buttons.cancel")}
                  </Button>
                  <Button
                    type="submit"
                    disabled={createTruckMutation.isPending}
                    className="flex-1 h-11 rounded-xl"
                  >
                    {createTruckMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t("common:buttons.creating")}
                      </>
                    ) : (
                      <>
                        {t("common:buttons.next")}
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
                  <h3 className="text-lg font-bold">{t("fleet:labels.truck_registered")}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t("fleet:labels.upload_document_msg")}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="document-type">{t("fleet:fields.document_type")}</Label>
                    <Select value={documentType} onValueChange={setDocumentType}>
                      <SelectTrigger id="document-type" className="h-11 rounded-xl">
                        <SelectValue placeholder={t("common:labels.select_document_type", { defaultValue: "Select document type" })} />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="libre">Libre</SelectItem>
                        <SelectItem value="other">{t("common:labels.other", { defaultValue: "Other" })}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="file">{t("common:labels.file", { defaultValue: "File" })}</Label>
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
                          <span className="text-xs font-medium">{t("fleet:labels.click_to_select")}</span>
                        </>
                      )}
                    </Button>
                  </div>

                  <Button
                    type="button"
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
                          toast.success(t("fleet:messages.upload_success"));
                          setSelectedFile(null);
                          setDocumentType("");
                          if (fileInputRef.current) fileInputRef.current.value = "";
                        } catch {
                          toast.error(t("fleet:messages.upload_error"));
                        }
                      }
                    }}
                  >
                    {uploadDocumentMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t("common:buttons.uploading")}
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        {t("fleet:labels.upload_docs")}
                      </>
                    )}
                  </Button>
                </div>

                <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl flex items-start gap-3">
                  <XCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-amber-900">{t("fleet:labels.required_docs")}</p>
                    <p className="text-[10px] text-amber-700 leading-relaxed">
                      {t("fleet:labels.required_docs_msg")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Scroll Indicator for Mobile Step 2 */}
              <div className="sm:hidden absolute bottom-16 left-0 right-0 h-10 pointer-events-none bg-gradient-to-t from-background via-background/60 to-transparent flex items-end justify-center pb-2 z-10">
                <div className="flex items-center gap-1.5 px-3 py-1 bg-background/50 backdrop-blur-[2px] rounded-full border border-border/50 text-[10px] font-medium text-muted-foreground animate-bounce">
                  <ChevronDown className="h-3 w-3" />
                  <span>{t("common:labels.scroll_for_more")}</span>
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
                  {t("fleet:labels.go_to_details")}
                </Button>
                <Button
                  type="button"
                  className="flex-1 h-11 rounded-xl"
                  onClick={() => {
                    setIsOpen(false);
                    onSuccess?.();
                  }}
                >
                  {t("common:buttons.done")}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
