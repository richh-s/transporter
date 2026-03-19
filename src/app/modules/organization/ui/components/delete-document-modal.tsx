"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

interface DeleteDocumentModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  document: { id: number; document_type: string } | null;
  onDelete: (id: number) => Promise<void>;
  isDeleting: boolean;
}

export function DeleteDocumentModal({
  isOpen,
  onOpenChange,
  document,
  onDelete,
  isDeleting,
}: DeleteDocumentModalProps) {
  const { t } = useTranslation(["organization", "common"]);

  if (!document) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden border-none rounded-2xl shadow-2xl">
        <div className="p-6 pt-8 text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center">
            <AlertTriangle className="h-8 w-8 text-rose-500" />
          </div>

          <div className="space-y-2">
            <DialogTitle className="text-xl font-bold text-slate-900">
              {t("organization:messages.confirm_delete_title")}
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-500">
              {t("organization:messages.confirm_delete_desc")}
              <br />
              <span className="mt-2 inline-block font-bold text-rose-600 px-3 py-1 rounded-lg bg-rose-50 border border-rose-100 uppercase text-xs">
                {t(`organization:types.${document.document_type}`, { defaultValue: document.document_type })}
              </span>
            </DialogDescription>
          </div>
        </div>

        <DialogFooter className="p-6 bg-slate-50 flex flex-row gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="flex-1 h-12 rounded-xl text-slate-600 hover:bg-slate-200 font-bold transition-all"
            disabled={isDeleting}
          >
            {t("common:buttons.cancel")}
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => onDelete(document.id)}
            disabled={isDeleting}
            className="flex-1 h-12 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-lg shadow-rose-200 transition-all active:scale-[0.98]"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("common:messages.saving")}
              </>
            ) : (
              t("common:buttons.delete")
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
