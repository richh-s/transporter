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
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

import {
  Eye,
  Trash2,
  Upload,
  Loader2,
  Pencil,
  MoreHorizontal,
} from "lucide-react";

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

export function DriverDocuments({ driverId }: { driverId: number }) {
  const qc = useQueryClient();

  const { data: documents = [], isLoading } = useDriverDocuments(driverId);
  const uploadMutation = useUploadDriverDocument(driverId);
  const updateMutation = useUpdateDriverDocument(driverId);
  const deleteMutation = useDeleteDriverDocument();

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
      window.open(res.presigned_url, "_blank");
    }
  };

  const handleSubmit = () => {
    if (!file && !documentType) return;

    if (editDocId) {
      updateMutation.mutate(
        {
          documentId: editDocId,
          document_type: documentType || undefined,
          file: file || undefined,
        },
        {
          onSuccess: () => resetForm(),
        },
      );
    } else {
      uploadMutation.mutate(
        { document_type: documentType, file: file! },
        { onSuccess: () => resetForm() },
      );
    }
  };

  const resetForm = () => {
    setFile(null);
    setDocumentType("");
    setEditDocId(null);
    setErrors({});
  };

  const backendError = uploadMutation.error
    ? (uploadMutation.error as Error).message
    : null;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Driver Documents</h2>

      {/* Upload / Edit */}
      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">
          {editDocId ? "Edit Document" : "Upload New Document"}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Document Type */}
          <div className="space-y-1">
            <Label>
              Document Type <span className="text-red-500">*</span>
            </Label>
            <Select
              value={documentType}
              onValueChange={(v) => setDocumentType(v as DriverDocumentType)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select document type" />
              </SelectTrigger>
              <SelectContent>
                {DRIVER_DOCUMENT_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.replace(/_/g, " ").toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.documentType && (
              <p className="text-sm text-red-500">{errors.documentType}</p>
            )}
          </div>

          {/* File */}
          <div className="space-y-1">
            <Label>
              File <span className="text-red-500">*</span>
            </Label>
            <Input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => {
                setFile(e.target.files?.[0] ?? null);
                setErrors((e) => ({ ...e, file: undefined }));
              }}
              className={errors.file ? "border-red-500" : ""}
            />
            {errors.file && (
              <p className="text-sm text-red-500">{errors.file}</p>
            )}
          </div>

          {/* Upload Button */}
          <div className="flex items-end">
            <Button
              onClick={handleSubmit}
              disabled={uploadMutation.isPending || updateMutation.isPending}
              className="w-full"
            >
              {uploadMutation.isPending || updateMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  {editDocId ? "Save Changes" : "Upload"}
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Backend error */}
        {backendError && (
          <Alert variant="destructive" className="mt-4">
            <AlertDescription>{backendError}</AlertDescription>
          </Alert>
        )}
      </Card>

      {/* Table */}
      <Card className="p-6">
        {isLoading ? (
          <div className="text-center py-8">Loading documents...</div>
        ) : documents.length === 0 ? (
          <div className="text-center py-8">No documents uploaded yet.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Uploaded</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {documents.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell>
                    <Badge variant="outline">
                      {doc.document_type.toUpperCase()}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    {new Date(doc.created_at).toLocaleDateString()}
                  </TableCell>

                  <TableCell className="text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleView(doc.id)}>
                          <Eye className="mr-2 h-4 w-4" /> View
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => {
                            setEditDocId(doc.id);
                            setDocumentType(
                              doc.document_type as DriverDocumentType,
                            );
                          }}
                        >
                          <Pencil className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => {
                            setDocToDelete(doc.id);
                            setDeleteOpen(true);
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Delete Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Document</DialogTitle>
            <DialogDescription>This action cannot be undone.</DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                deleteMutation.mutate({
                  driverId,
                  documentId: docToDelete!,
                });
                setDeleteOpen(false);
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
