"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TruckDocument } from "@/app/modules/fleet/server/hooks/use-truck-documents";

interface UpdateDocumentModalProps {
  document: TruckDocument | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (documentType: string, file?: File) => Promise<void>;
  isUpdating: boolean;
}

const DOCUMENT_TYPES = [
  "registration_certificate",
  "insurance",
  "license",
  "inspection_report",
  "other",
];

export function UpdateDocumentModal({
  document,
  isOpen,
  onOpenChange,
  onUpdate,
  isUpdating,
}: UpdateDocumentModalProps) {
  const [documentType, setDocumentType] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>("");

  useEffect(() => {
    if (document && isOpen) {
      setDocumentType(document.document_type || "");
      setFile(null);
      setFileName("");
    }
  }, [document, isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!documentType) return;

    await onUpdate(documentType, file || undefined);
    if (!isUpdating) {
      onOpenChange(false);
      setFile(null);
      setFileName("");
    }
  };

  if (!document) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] max-w-[90vw]">
        <DialogHeader>
          <DialogTitle>Update Document</DialogTitle>
          <DialogDescription>
            Update the document type or upload a new file.
          </DialogDescription>
          {/* ✅ Added explanation */}
          <p className="text-xs text-muted-foreground mt-1">
            Fields marked with <span className="text-red-500">*</span> are required.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              {/* ✅ Added * */}
              <Label htmlFor="document-type">
                Document Type <span className="text-red-500">*</span>
              </Label>
              <Select
                value={documentType}
                onValueChange={setDocumentType}
                required
              >
                <SelectTrigger id="document-type">
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  {DOCUMENT_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type
                        .replace(/_/g, " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* ✅ Added client-side validation message */}
              {!documentType && (
                <p className="text-xs text-destructive">
                  Document type is required
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="file">File (Optional)</Label>
              <Input
                id="file"
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              />
              {fileName && (
                <p className="text-sm text-muted-foreground">
                  Selected: {fileName}
                </p>
              )}
              {!fileName && document.file_url && (
                <p className="text-sm text-muted-foreground">
                  Current file will be kept if no new file is selected
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isUpdating || !documentType}>
              {isUpdating && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Update Document
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
