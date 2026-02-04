"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { driverApi } from "@/app/modules/drivers/server/api/driver.api";
import { driverKeys } from "@/app/modules/drivers/server/query-keys";
import { useDriverDocuments } from "@/app/modules/drivers/server/hooks/use-driver-documents";
import { useUploadDriverDocument } from "@/app/modules/drivers/server/hooks/use-upload-driver-document";
import { useUpdateDriverDocument } from "@/app/modules/drivers/server/hooks/use-update-driver-document";
import { useDeleteDriverDocument } from "@/app/modules/drivers/server/hooks/use-delete-driver-document";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  Eye,
  Trash2,
  Upload,
  Loader2,
  Pencil,
  MoreHorizontal,
  FileText,
  Plus,
  X,
  Calendar,
} from "lucide-react";
import { openInApp } from "@/lib/utils/open-in-app";
import { format } from "date-fns";

const DRIVER_DOCUMENT_TYPES = [
  "driver_id",
  "driver_license",
  "trade_licence",
  "libre",
  "other",
] as const;

type DriverDocumentType = (typeof DRIVER_DOCUMENT_TYPES)[number];

interface UploadErrors {
  documentType?: string;
  file?: string;
}

// Document Type Badge
function DocumentTypeBadge({ type }: { type: string }) {
  const colors: Record<string, string> = {
    driver_id: "bg-blue-500/10 text-blue-600",
    driver_license: "bg-emerald-500/10 text-emerald-600",
    trade_licence: "bg-amber-500/10 text-amber-600",
    libre: "bg-purple-500/10 text-purple-600",
    other: "bg-gray-500/10 text-gray-600",
  };

  return (
    <span
      className={cn(
        "px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase",
        colors[type] || colors.other,
      )}
    >
      {type.replace(/_/g, " ")}
    </span>
  );
}

// Document Card
function DocumentCard({
  doc,
  onView,
  onEdit,
  onDelete,
}: {
  doc: { id: number; document_type: string; created_at: string };
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-card border border-border/50 shadow-sm">
      <div className="flex items-center gap-3 min-w-0">
        <div className="p-2 rounded-lg bg-muted">
          <FileText className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="min-w-0">
          <DocumentTypeBadge type={doc.document_type} />
          <div className="flex items-center gap-1.5 mt-1 text-[10px] text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>{format(new Date(doc.created_at), "MMM dd, yyyy")}</span>
          </div>
        </div>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-36 rounded-xl">
          <DropdownMenuItem onClick={onView} className="rounded-lg">
            <Eye className="mr-2 h-4 w-4" /> View
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onEdit} className="rounded-lg">
            <Pencil className="mr-2 h-4 w-4" /> Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={onDelete}
            className="rounded-lg text-red-600"
          >
            <Trash2 className="mr-2 h-4 w-4" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

// Loading Skeleton
function DocumentSkeleton() {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/50">
      <Skeleton className="h-9 w-9 rounded-lg" />
      <div className="space-y-1.5 flex-1">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-3 w-24" />
      </div>
      <Skeleton className="h-8 w-8 rounded-lg" />
    </div>
  );
}

export function DriverDocuments({ driverId }: { driverId: number }) {
  const qc = useQueryClient();

  const { data: documents = [], isLoading } = useDriverDocuments(driverId);
  const uploadMutation = useUploadDriverDocument(driverId);
  const updateMutation = useUpdateDriverDocument(driverId);
  const deleteMutation = useDeleteDriverDocument();

  const [uploadOpen, setUploadOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<DriverDocumentType | "">("");
  const [editDocId, setEditDocId] = useState<number | null>(null);
  const [errors, setErrors] = useState<UploadErrors>({});

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [docToDelete, setDocToDelete] = useState<number | null>(null);

  /* ---------------- Handlers ---------------- */
  const handleView = async (documentId: number) => {
    const res = await qc.fetchQuery({
      queryKey: driverKeys.document(driverId, documentId),
      queryFn: () => driverApi.getDriverDocument(driverId, documentId),
    });

    if (res.presigned_url) {
      await openInApp(res.presigned_url);
    }
  };

  const handleSubmit = () => {
    const newErrors: UploadErrors = {};

    if (!documentType) {
      newErrors.documentType = "Select a document type";
    }
    if (!file && !editDocId) {
      newErrors.file = "Select a file";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (editDocId) {
      updateMutation.mutate(
        {
          documentId: editDocId,
          document_type: documentType || undefined,
          file: file || undefined,
        },
        {
          onSuccess: () => {
            resetForm();
            setUploadOpen(false);
          },
        },
      );
    } else {
      uploadMutation.mutate(
        { document_type: documentType, file: file! },
        {
          onSuccess: () => {
            resetForm();
            setUploadOpen(false);
          },
        },
      );
    }
  };

  const resetForm = () => {
    setFile(null);
    setDocumentType("");
    setEditDocId(null);
    setErrors({});
  };

  const openUpload = (docId?: number, docType?: DriverDocumentType) => {
    if (docId && docType) {
      setEditDocId(docId);
      setDocumentType(docType);
    } else {
      resetForm();
    }
    setUploadOpen(true);
  };

  const backendError = uploadMutation.error
    ? (uploadMutation.error as Error).message
    : null;

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-purple-500/10">
            <FileText className="h-3.5 w-3.5 text-purple-500" />
          </div>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Documents
          </h2>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => openUpload()}
          className="h-8 px-3 rounded-xl text-xs"
        >
          <Plus className="mr-1 h-3.5 w-3.5" />
          Upload
        </Button>
      </div>

      {/* Documents List */}
      <div className="space-y-2">
        {isLoading ? (
          Array.from({ length: 2 }).map((_, i) => <DocumentSkeleton key={i} />)
        ) : documents.length === 0 ? (
          <div className="text-center py-8 rounded-xl bg-muted/30 border border-dashed border-border/50">
            <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">No documents yet</p>
            <Button
              variant="link"
              size="sm"
              onClick={() => openUpload()}
              className="mt-1"
            >
              Upload first document
            </Button>
          </div>
        ) : (
          documents.map((doc) => (
            <DocumentCard
              key={doc.id}
              doc={doc}
              onView={() => handleView(doc.id)}
              onEdit={() =>
                openUpload(doc.id, doc.document_type as DriverDocumentType)
              }
              onDelete={() => {
                setDocToDelete(doc.id);
                setDeleteOpen(true);
              }}
            />
          ))
        )}
      </div>

      {/* Upload/Edit Dialog */}
      <Dialog
        open={uploadOpen}
        onOpenChange={(val) => {
          if (!val) resetForm();
          setUploadOpen(val);
        }}
      >
        <DialogContent
          showCloseButton={false}
          className={cn(
            "p-0 gap-0 overflow-hidden rounded-2xl",
            "w-full max-w-md",
            "flex flex-col",
          )}
        >
          {/* Header */}
          <div className="shrink-0 bg-background border-b border-border/50 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-purple-500/10">
                  <Upload className="h-4 w-4 text-purple-500" />
                </div>
                <div>
                  <h2 className="text-base font-bold">
                    {editDocId ? "Edit Document" : "Upload Document"}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {editDocId
                      ? "Update document details"
                      : "Add a new document"}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-xl"
                onClick={() => setUploadOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 space-y-4">
            {backendError && (
              <Alert variant="destructive" className="rounded-xl">
                <AlertDescription>{backendError}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label className="text-xs">
                Document Type <span className="text-red-500">*</span>
              </Label>
              <Select
                value={documentType}
                onValueChange={(v) => {
                  setDocumentType(v as DriverDocumentType);
                  setErrors((e) => ({ ...e, documentType: undefined }));
                }}
              >
                <SelectTrigger
                  className={cn(
                    "h-11 rounded-xl",
                    errors.documentType && "border-red-500",
                  )}
                >
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {DRIVER_DOCUMENT_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.replace(/_/g, " ").toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.documentType && (
                <p className="text-xs text-red-500">{errors.documentType}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-xs">
                File {!editDocId && <span className="text-red-500">*</span>}
              </Label>
              <Input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => {
                  setFile(e.target.files?.[0] ?? null);
                  setErrors((err) => ({ ...err, file: undefined }));
                }}
                className={cn(
                  "h-11 rounded-xl",
                  errors.file && "border-red-500",
                )}
              />
              {errors.file && (
                <p className="text-xs text-red-500">{errors.file}</p>
              )}
              <p className="text-[10px] text-muted-foreground">
                PDF, JPG, JPEG, or PNG
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="shrink-0 bg-background border-t border-border/50 p-4 flex gap-3">
            <Button
              variant="outline"
              onClick={() => setUploadOpen(false)}
              className="flex-1 h-11 rounded-xl"
              disabled={uploadMutation.isPending || updateMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1 h-11 rounded-xl"
              disabled={uploadMutation.isPending || updateMutation.isPending}
            >
              {uploadMutation.isPending || updateMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : editDocId ? (
                "Save Changes"
              ) : (
                "Upload"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle>Delete Document</DialogTitle>
            <DialogDescription>
              This action cannot be undone. The document will be permanently
              removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteOpen(false)}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (docToDelete) {
                  deleteMutation.mutate({
                    driverId,
                    documentId: docToDelete,
                  });
                }
                setDeleteOpen(false);
                setDocToDelete(null);
              }}
              className="rounded-xl"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
