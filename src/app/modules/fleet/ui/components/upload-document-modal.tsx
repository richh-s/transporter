"use client";

import { useRef, useState } from "react";
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

interface UploadDocumentModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onUpload: (file: File, documentType: string) => Promise<void>;
  isUploading: boolean;
}

export function UploadDocumentModal({
  isOpen,
  onOpenChange,
  onUpload,
  isUploading,
}: UploadDocumentModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [documentType, setDocumentType] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select a file");
      return;
    }

    if (!documentType) {
      setError("Please select a document type");
      return;
    }

    setError(null);
    try {
      await onUpload(selectedFile, documentType);

      // Reset on success
      setSelectedFile(null);
      setDocumentType("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      onOpenChange(false);
    } catch (error: unknown) {
      setError(
        error instanceof Error ? error.message : "Failed to upload document"
      );
    }
  };

  const handleClose = () => {
    if (!isUploading) {
      setSelectedFile(null);
      setDocumentType("");
      setError(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
          <DialogDescription>
            Select a document type and file to upload.
          </DialogDescription>
          {/*  Added explanation */}
          <p className="text-xs text-muted-foreground mt-1">
            Fields marked with <span className="text-red-500">*</span> are required.
          </p>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Document Type */}
          <div className="space-y-2">
            {/*  Required field marker */}
            <Label htmlFor="document-type">
              Document Type <span className="text-red-500">*</span>
            </Label>
            <Select
              value={documentType}
              onValueChange={(value) => {
                setDocumentType(value);
                setError(null);
              }}
            >
              <SelectTrigger id="document-type">
                <SelectValue placeholder="Select document type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="trade_licence">Trade Licence</SelectItem>

                <SelectItem value="authorised_contact_person_company_id">
                  Authorised Contact Person Company ID
                </SelectItem>

                <SelectItem value="libre">Libre</SelectItem>

                <SelectItem value="driver_id">Driver ID</SelectItem>

                <SelectItem value="driver_license">Driver License</SelectItem>

                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* File */}
          <div className="space-y-2">
            {/* ✅ Required field marker */}
            <Label htmlFor="file">
              File <span className="text-red-500">*</span>
            </Label>
            <input
              ref={fileInputRef}
              id="file"
              type="file"
              className="hidden"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleFileSelect}
              disabled={isUploading}
              className="w-full"
            >
              {selectedFile ? (
                <>
                  <X className="h-4 w-4 mr-2" />
                  {selectedFile.name}
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Select File
                </>
              )}
            </Button>

            {selectedFile && (
              <p className="text-xs text-muted-foreground">
                Selected: {selectedFile.name} (
                {(selectedFile.size / 1024).toFixed(2)} KB)
                Selected: {selectedFile.name} (
                {(selectedFile.size / 1024).toFixed(2)} KB)
              </p>
            )}
          </div>

          {/* Error */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || !documentType || isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
