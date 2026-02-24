import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ShipItem, ShipItemDocumentTypeEnum } from "@/types/ship";
import { Upload, File as FileIcon, Loader2 } from "lucide-react";
import { shipApi } from "@/lib/api/ships";
import { toast } from "sonner";

interface PodUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shipItem: ShipItem;
  onUploadSuccess: () => void;
  selectedContainerIds?: string[];
}

export function PodUploadModal({
  open,
  onOpenChange,
  shipItem,
  onUploadSuccess,
  selectedContainerIds = [],
}: PodUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<ShipItemDocumentTypeEnum>(
    ShipItemDocumentTypeEnum.PROOF_OF_DELIVERY,
  );
  const [manualContainerId, setManualContainerId] = useState<string>("all");
  const [isUploading, setIsUploading] = useState(false);

  const isBatch = selectedContainerIds.length > 0;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a file to upload");
      return;
    }

    setIsUploading(true);
    console.log("🚀 Starting upload for ship item:", shipItem.id);
    console.log("📊 Ship Item Status:", shipItem.status);
    console.log("📑 Document Type:", documentType);

    try {
      if (isBatch) {
        // Batch upload for selected containers
        for (const id of selectedContainerIds) {
          const formData = new FormData();
          formData.append("document_type", documentType);
          formData.append("file", file);
          formData.append("container_id", id);
          await shipApi.uploadShipItemDocument(shipItem.id, formData);
        }
        toast.success(
          `Document uploaded for ${selectedContainerIds.length} containers`,
        );
      } else {
        // Single upload
        const formData = new FormData();
        formData.append("document_type", documentType);
        formData.append("file", file);
        if (manualContainerId !== "all") {
          formData.append("container_id", manualContainerId);
        }
        await shipApi.uploadShipItemDocument(shipItem.id, formData);
        toast.success("Document uploaded successfully");
      }

      onUploadSuccess();
      onOpenChange(false);

      // Reset form
      setFile(null);
      setDocumentType(ShipItemDocumentTypeEnum.PROOF_OF_DELIVERY);
      setManualContainerId("all");
    } catch (error: unknown) {
      console.error("Upload error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to upload document";
      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const containers =
    shipItem.containers || (shipItem.container ? [shipItem.container] : []);

  // Filter containers that are returning
  const returningContainers = containers.filter((c) => c.is_returning);

  // Check if we can allow return receipt upload
  // If batch: all selected must be returning
  // If not batch: only allow if at least one container is returning (or we shouldn't show the option?)
  const allSelectedAreReturning = isBatch
    ? selectedContainerIds.every(
      (id) => containers.find((c) => c.id.toString() === id)?.is_returning,
    )
    : returningContainers.length > 0;

  const showReturnReceiptOption = isBatch
    ? allSelectedAreReturning
    : returningContainers.length > 0;
  // Document upload is allowed when ship item is STARTED (backend). Proof of Delivery of Document
  // must be uploaded before marking as delivered, so enable it when uploads are allowed (STARTED).
  const statusLower = shipItem.status?.toLowerCase() ?? "";
  const canUploadDocuments = statusLower === "started";

  // Filter available containers based on document type
  const availableContainers =
    documentType === ShipItemDocumentTypeEnum.CONTAINER_INTERCHANGE_DOCUMENT
      ? returningContainers
      : containers;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
          <DialogDescription>
            {isBatch
              ? `Uploading for ${selectedContainerIds.length} selected containers`
              : `Upload Proof of Delivery or Container Return Receipt for Ship Item #${shipItem.ship_id}`}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="doc-type">Document Type</Label>
            <Select
              value={documentType}
              onValueChange={(val) => {
                const newType = val as ShipItemDocumentTypeEnum;
                setDocumentType(newType);
                // Reset container selection if invalid for new type or if "all" is not allowed
                if (
                  newType ===
                  ShipItemDocumentTypeEnum.CONTAINER_INTERCHANGE_DOCUMENT
                ) {
                  const isCurrentValid = returningContainers.some(
                    (c) => c.id.toString() === manualContainerId,
                  );
                  if (manualContainerId === "all" || !isCurrentValid) {
                    if (returningContainers.length > 0) {
                      setManualContainerId(
                        returningContainers[0].id.toString(),
                      );
                    }
                  }
                } else if (manualContainerId !== "all") {
                  const isCurrentValid = containers.some(
                    (c) => c.id.toString() === manualContainerId,
                  );
                  if (!isCurrentValid) setManualContainerId("all");
                }
              }}
            >
              <SelectTrigger id="doc-type">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ShipItemDocumentTypeEnum.PROOF_OF_DELIVERY}>
                  Proof of Delivery (POD)
                </SelectItem>
                {showReturnReceiptOption && (
                  <SelectItem
                    value={
                      ShipItemDocumentTypeEnum.CONTAINER_INTERCHANGE_DOCUMENT
                    }
                  >
                    Container Return Receipt
                  </SelectItem>
                )}
                <SelectItem
                  value={ShipItemDocumentTypeEnum.PROOF_OF_DELIVERY_OF_DOCUMENT}
                  disabled={!canUploadDocuments}
                >
                  Proof of Delivery of Document{" "}
                  {!canUploadDocuments && "(Upload when status is Started)"}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {!isBatch && (
            <div className="grid gap-2">
              <Label htmlFor="upload-level">Container (Optional)</Label>
              <Select
                value={manualContainerId}
                onValueChange={setManualContainerId}
              >
                <SelectTrigger id="upload-level">
                  <SelectValue placeholder="Select container" />
                </SelectTrigger>
                <SelectContent>
                  {documentType !==
                    ShipItemDocumentTypeEnum.CONTAINER_INTERCHANGE_DOCUMENT && (
                      <SelectItem value="all">
                        Check if this applies to the whole shipment
                      </SelectItem>
                    )}
                  {availableContainers.map((c) => (
                    <SelectItem key={c.id} value={c.id.toString()}>
                      {c.container_number} ({c.container_size || "Unknown Size"}
                      )
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {documentType !==
                ShipItemDocumentTypeEnum.CONTAINER_INTERCHANGE_DOCUMENT && (
                  <p className="text-xs text-muted-foreground">
                    Select &quot;Whole Shipment&quot; for a single document
                    covering all containers.
                  </p>
                )}
            </div>
          )}

          <div className="grid gap-2">
            <Label>File</Label>
            <div
              className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => document.getElementById("file-upload")?.click()}
            >
              <Input
                id="file-upload"
                type="file"
                className="hidden"
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png,.tiff"
              />
              {file ? (
                <div className="flex flex-col items-center text-center">
                  <FileIcon className="h-8 w-8 text-primary mb-2" />
                  <span className="text-sm font-medium">{file.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 h-6 text-xs text-destructive hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                    }}
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center text-center text-muted-foreground">
                  <Upload className="h-8 w-8 mb-2" />
                  <span className="text-sm">
                    Click to upload or drag and drop
                  </span>
                  <span className="text-xs mt-1">PDF, JPG, PNG (Max 10MB)</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={!file || isUploading}>
            {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Upload {isBatch ? `(${selectedContainerIds.length})` : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
