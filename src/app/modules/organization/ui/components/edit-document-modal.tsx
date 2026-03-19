"use client";

import { useState, useRef, useEffect } from "react";
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
import { Pencil, X, FileText, Loader2, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface EditDocumentModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  document: { id: number; document_type: string; file_name?: string } | null;
  onUpdate: (
    id: number,
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
  const { t } = useTranslation(["organization", "common"]);
  const [file, setFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (document) {
      setDocumentType(document.document_type);
      setFile(null);
    }
  }, [document, isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpdate = async () => {
    if (document && (file || documentType !== document.document_type)) {
      await onUpdate(document.id, {
        ...(documentType !== document.document_type && {
          document_type: documentType,
        }),
        ...(file && { file }),
      });
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
        <DialogHeader className="p-6 bg-brand-secondary text-white">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Pencil className="h-6 w-6" />
              {t("organization:buttons.edit_doc")}
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
              htmlFor="edit-doc-type"
              className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
            >
              {t("organization:fields.document_type")}
            </Label>
            <Select value={documentType} onValueChange={setDocumentType}>
              <SelectTrigger id="edit-doc-type" className="h-12 rounded-xl">
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

          {/* New File Upload Area (Optional for Edit) */}
          <div className="space-y-3">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {t("organization:fields.file")} (Optional)
            </Label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "group relative border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-300",
                file
                  ? "bg-brand-secondary/5 border-brand-secondary"
                  : "bg-muted/30 border-border hover:bg-muted/50 hover:border-brand-secondary/50",
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
                  <div className="p-2.5 rounded-xl bg-brand-secondary/10">
                    <FileText className="h-6 w-6 text-brand-secondary" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-brand-secondary max-w-[200px] truncate">
                      {file.name}
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="p-2.5 rounded-xl bg-muted/50 group-hover:bg-brand-secondary/10 transition-colors">
                    <Upload className="h-6 w-6 text-muted-foreground group-hover:text-brand-secondary" />
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-bold text-foreground">
                      {t("common:buttons.upload_doc", { defaultValue: "Click to change file" })}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {document?.file_name || "Current file will be kept"}
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
            disabled={isUpdating}
          >
            {t("common:buttons.cancel")}
          </Button>
          <Button
            type="button"
            onClick={handleUpdate}
            disabled={
              isUpdating ||
              (!file && documentType === document?.document_type)
            }
            className="flex-1 h-12 rounded-xl bg-brand-secondary hover:bg-brand-primary text-white font-bold shadow-lg shadow-brand-secondary/20 transition-all active:scale-[0.98]"
          >
            {isUpdating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("common:messages.saving")}
              </>
            ) : (
              t("common:buttons.save_changes")
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
