"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { driverApi } from "@/app/modules/drivers/server/api/driver.api";
import { driverKeys } from "@/app/modules/drivers/server/query-keys";
import { useDriverDocuments } from "@/app/modules/drivers/server/hooks/use-driver-documents";
import { useUploadDriverDocument } from "@/app/modules/drivers/server/hooks/use-upload-driver-document";
import { useDeleteDriverDocument } from "@/app/modules/drivers/server/hooks/use-delete-driver-document";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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

import { toast } from "sonner";

const DOCUMENT_TYPES = ["driver_id", "driver_license", "other"] as const;
type DocumentType = (typeof DOCUMENT_TYPES)[number];

export function DriverDocuments({ driverId }: { driverId: number }) {
  const queryClient = useQueryClient();

  const { data: documents = [], isLoading } = useDriverDocuments(driverId);
  const uploadMutation = useUploadDriverDocument(driverId);
  const deleteMutation = useDeleteDriverDocument();

  const [file, setFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<DocumentType | "">("");
  const [replaceDocId, setReplaceDocId] = useState<number | null>(null);

  // DELETE MODAL STATE
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [docToDelete, setDocToDelete] = useState<number | null>(null);

  const handleView = async (documentId: number) => {
    const res = await queryClient.fetchQuery({
      queryKey: driverKeys.document(driverId, documentId),
      queryFn: () => driverApi.getDriverDocument(driverId, documentId),
    });

    if (res.presigned_url) {
      window.location.href = res.presigned_url;
    }
  };

  const handleUpload = () => {
    if (!file || !documentType) return;

    uploadMutation.mutate(
      {
        document_type: documentType,
        file,
        replace_document_id: replaceDocId ?? undefined,
      },
      {
        onSuccess: () => {
          setFile(null);
          setDocumentType("");
          setReplaceDocId(null);
          toast.success(replaceDocId ? "Document replaced successfully" : "Document uploaded successfully");
        },
        onError: (error: any) => {
          toast.error(error.message || "Failed to upload document");
        }
      }
    );
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Driver Documents</h2>

      {/* Upload / Replace */}
      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">
          {replaceDocId ? "Replace Document" : "Upload New Document"}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Document Type</Label>
            <Select
              value={documentType}
              onValueChange={(v) => setDocumentType(v as DocumentType)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {DOCUMENT_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.replace("_", " ").toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>File</Label>
            <Input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </div>

          <div className="flex items-end">
            <Button
              onClick={handleUpload}
              disabled={uploadMutation.isPending || !file || !documentType}
              className="w-full"
            >
              {uploadMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  {replaceDocId ? "Replace" : "Upload"}
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>

      {/* Documents Table */}
      <Card className="p-6">
        {isLoading ? (
          <div className="py-8 text-center text-muted-foreground">
            Loading documents...
          </div>
        ) : documents.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            No documents uploaded yet.
          </div>
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
                      {doc.document_type.replace("_", " ").toUpperCase()}
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
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => {
                            setDocumentType(doc.document_type as DocumentType);
                            setReplaceDocId(doc.id);
                          }}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Replace
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => {
                            setDocToDelete(doc.id);
                            setDeleteOpen(true);
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
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

      {/* DELETE CONFIRM MODAL */}
      <Dialog
        open={deleteOpen}
        onOpenChange={(val) => {
          setDeleteOpen(val);
          if (!val) setDocToDelete(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Document</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this document? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteOpen(false);
                setDocToDelete(null);
              }}
            >
              Cancel
            </Button>

            <Button
              variant="destructive"
              disabled={!docToDelete || deleteMutation.isPending}
              onClick={() => {
                if (!docToDelete) return;


                setDeleteOpen(false);
                setDocToDelete(null);


                deleteMutation.mutate({
                  driverId,
                  documentId: docToDelete,
                }, {
                  onSuccess: () => {
                    toast.success("Document deleted successfully");
                  }
                });
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
