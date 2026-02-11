"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import type { OrganizationDocument } from "@/lib/api/organization";

interface EditDocumentModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  document: OrganizationDocument | null;
  onUpdate: (
    id: string | number,
    data: { document_type?: string; file?: File },
  ) => Promise<void>;
  isUpdating: boolean;
}

export function EditDocumentModal({
  isOpen,
  onOpenChange,
  document,
  onUpdate,
  isUpdating,
}: EditDocumentModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [documentType, setDocumentType] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  /* ------------------ File Validation ------------------ */
  const validateFile = (file: File) => {
    const validTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/jpeg",
      "image/jpg",
      "image/png",
    ];

    if (!validTypes.includes(file.type)) {
      return "Invalid file type. Upload PDF, DOC, DOCX, JPG, or PNG.";
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return "File size exceeds 10MB limit.";
    }

    return null;
  };

  /* ------------------ Init ------------------ */
  useEffect(() => {
    if (document) {
      setDocumentType(document.document_type || "");
      setSelectedFile(null);
      setError(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [document]);

  /* ------------------ Handlers ------------------ */
  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSelectedFile(file);
    setError(null);
  };

  const handleUpdate = async () => {
    if (!document) return;

    if (!documentType.trim()) {
      setError("Please select a document type");
      return;
    }

    setError(null);

    // Optimistic reset (existing behavior preserved)
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    onOpenChange(false);

    onUpdate(document.id, {
      document_type: documentType.trim(),
      file: selectedFile || undefined,
    });
  };

  const handleClose = () => {
    if (!isUpdating) {
      setSelectedFile(null);
      setError(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      onOpenChange(false);
    }
  };

  if (!document) return null;

  /* ------------------ Render ------------------ */
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Document</DialogTitle>
          <DialogDescription>
            Update document metadata or replace the file.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Document Type */}
          <div className="space-y-2">
            <Label htmlFor="edit-document-type">
              Document Type <span className="text-destructive">*</span>
            </Label>
            <Select
              value={documentType}
              onValueChange={(value) => {
                setDocumentType(value);
                setError(null);
              }}
            >
              <SelectTrigger id="edit-document-type">
                <SelectValue placeholder="Select document type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="trade_licence">Trade Licence</SelectItem>
                <SelectItem value="id">ID</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Replace File */}
          <div className="space-y-2">
            <Label htmlFor="edit-file">Replace File (Optional)</Label>
            <input
              ref={fileInputRef}
              id="edit-file"
              type="file"
              className="hidden"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleFileSelect}
              disabled={isUpdating}
              className="w-full min-w-0 justify-start overflow-hidden"
              title={selectedFile?.name}
            >
              {selectedFile ? (
                <>
                  <X className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="truncate">{selectedFile.name}</span>
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Select New File (Optional)
                </>
              )}
            </Button>

            {selectedFile && (
              <p
                className="text-xs text-muted-foreground truncate"
                title={selectedFile.name}
              >
                New file: {selectedFile.name} (
                {(selectedFile.size / 1024).toFixed(2)} KB)
              </p>
            )}

            {!selectedFile && document.file_path && (
              <p
                className="text-xs text-muted-foreground truncate min-w-0"
                title={
                  document.file_path.split("/").pop() || document.file_path
                }
              >
                Current file:{" "}
                {document.file_path.split("/").pop() || document.file_path}
              </p>
            )}
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isUpdating}>
            Cancel
          </Button>
          <Button onClick={handleUpdate} disabled={!documentType || isUpdating}>
            {isUpdating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              "Update"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
