"use client";

import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
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
import { Upload, X, FileText, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation(["organization", "common"]);
  const [file, setFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (file && documentType) {
      await onUpload(file, documentType);
      // Reset state if successful (parent handles success/closing)
      setFile(null);
      setDocumentType("");
    }
  };

  const resetAndClose = () => {
    setFile(null);
    setDocumentType("");
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={resetAndClose}>
      <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden border-none rounded-2xl bg-background shadow-2xl">
        <DialogHeader className="p-6 bg-brand-primary text-white">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Upload className="h-6 w-6" />
              {t("organization:buttons.upload_doc")}
            </DialogTitle>
            <button
              onClick={resetAndClose}
              className="p-1.5 hover:bg-white/10 rounded-full transition-colors outline-none"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <DialogDescription className="text-white/80 pt-2 text-xs sm:text-sm">
            {t("organization:subtitle")}
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 space-y-6">
          {/* Document Type Selection */}
          <div className="space-y-3">
            <Label
              htmlFor="doc-type"
              className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
            >
              {t("organization:fields.document_type")}
            </Label>
            <Select value={documentType} onValueChange={setDocumentType}>
              <SelectTrigger id="doc-type" className="h-12 rounded-xl">
                <SelectValue placeholder={t("organization:fields.select_type")} />
              </SelectTrigger>
              <SelectContent className="rounded-xl shadow-xl border-border/50">
                <SelectItem value="trade_licence" className="rounded-lg">
                  {t("organization:types.trade_licence")}
                </SelectItem>
                <SelectItem value="id" className="rounded-lg">
                  {t("organization:types.id")}
                </SelectItem>
                <SelectItem value="other" className="rounded-lg">
                  {t("organization:types.other")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* File Upload Area */}
          <div className="space-y-3">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {t("organization:fields.file")}
            </Label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "group relative border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-300",
                file
                  ? "bg-brand-primary/5 border-brand-primary"
                  : "bg-muted/30 border-border hover:bg-muted/50 hover:border-brand-primary/50",
              )}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
              />

              {file ? (
                <div className="flex flex-col items-center gap-2 animate-in zoom-in-95 duration-300">
                  <div className="p-3 rounded-2xl bg-brand-primary/10">
                    <FileText className="h-8 w-8 text-brand-primary" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-brand-primary max-w-[200px] truncate">
                      {file.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="p-3 rounded-2xl bg-muted/50 group-hover:bg-brand-primary/10 transition-colors">
                    <Upload className="h-8 w-8 text-muted-foreground group-hover:text-brand-primary" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-foreground">
                      {t("common:buttons.upload_doc", { defaultValue: "Click to upload" })}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      PDF, JPG, PNG (Max 10MB)
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="p-6 bg-muted/30 flex flex-row gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={resetAndClose}
            className="flex-1 h-12 rounded-xl text-muted-foreground hover:bg-muted font-bold transition-all"
            disabled={isUploading}
          >
            {t("common:buttons.cancel")}
          </Button>
          <Button
            type="button"
            onClick={handleUpload}
            disabled={!file || !documentType || isUploading}
            className="flex-1 h-12 rounded-xl bg-brand-primary hover:bg-brand-secondary text-white font-bold shadow-lg shadow-brand-primary/20 transition-all active:scale-[0.98]"
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("common:messages.saving")}
              </>
            ) : (
              t("organization:buttons.upload_doc")
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
