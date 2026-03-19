"use client";

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
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
import { Input } from "@/components/ui/input";
import { Upload, File as FileIcon, Loader2 } from "lucide-react";
import { useManualPaymentConfirmation } from "@/hooks/use-ships";
import { cn } from "@/lib/utils";

interface ManualConfirmationModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    paymentId: number;
    shipId: number;
}

export function ManualConfirmationModal({
    open,
    onOpenChange,
    paymentId,
    shipId,
}: ManualConfirmationModalProps) {
    const { t } = useTranslation(["shipments", "common"]);
    const [referenceId, setReferenceId] = useState("");
    const [referenceUrl, setReferenceUrl] = useState("");
    const [date, setDate] = useState("");
    const [note, setNote] = useState("");
    const [file, setFile] = useState<File | null>(null);

    const mutation = useManualPaymentConfirmation(shipId);

    const resetForm = () => {
        setReferenceId("");
        setReferenceUrl("");
        setDate("");
        setNote("");
        setFile(null);
    };

    const handleSubmit = () => {
        mutation.mutate(
            {
                payment_id: paymentId,
                ship_id: shipId,
                reference_id: referenceId || undefined,
                reference_url: referenceUrl || undefined,
                date: date || undefined,
                note: note || undefined,
                 reference_doc_file: file || undefined,
            },
            {
                onSuccess: () => {
                    resetForm();
                    onOpenChange(false);
                },
            }
        );
    };

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

    return (
        <Dialog
            open={open}
            onOpenChange={(v) => {
                if (!v) resetForm();
                onOpenChange(v);
            }}
        >
            <DialogContent className="max-w-sm rounded-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{t("shipments:manual_confirmation.title")}</DialogTitle>
                    <DialogDescription>
                        {t("shipments:manual_confirmation.description")}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-2">
                    {/* Payment ID & Ship ID */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="grid gap-1.5">
                            <Label>{t("shipments:manual_confirmation.payment_id")}</Label>
                            <Input value={paymentId} disabled />
                        </div>
                        <div className="grid gap-1.5">
                            <Label>{t("shipments:manual_confirmation.ship_id")}</Label>
                            <Input value={shipId} disabled />
                        </div>
                    </div>

                    {/* Reference ID */}
                    <div className="grid gap-1.5">
                        <Label htmlFor="mc-reference-id">{t("shipments:manual_confirmation.reference_id")}</Label>
                        <Input
                            id="mc-reference-id"
                            placeholder={t("shipments:manual_confirmation.reference_id_placeholder")}
                            value={referenceId}
                            onChange={(e) => setReferenceId(e.target.value)}
                        />
                    </div>

                    {/* Reference URL */}
                    <div className="grid gap-1.5">
                        <Label htmlFor="mc-reference-url">{t("shipments:manual_confirmation.reference_url")}</Label>
                        <Input
                            id="mc-reference-url"
                            type="url"
                            placeholder={t("shipments:manual_confirmation.reference_url_placeholder")}
                            value={referenceUrl}
                            onChange={(e) => setReferenceUrl(e.target.value)}
                        />
                    </div>

                    {/* Date */}
                    <div className="grid gap-1.5">
                        <Label htmlFor="mc-date">{t("shipments:manual_confirmation.payment_date")}</Label>
                        <Input
                            id="mc-date"
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                        />
                    </div>

                    {/* Note */}
                    <div className="grid gap-1.5">
                        <Label htmlFor="mc-note">{t("shipments:manual_confirmation.note")}</Label>
                        <textarea
                            id="mc-note"
                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder={t("shipments:manual_confirmation.note_placeholder")}
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                        />
                    </div>

                    {/* File Upload */}
                     <div className="grid gap-1.5">
                        <Label className="flex items-center gap-1">
                            {t("shipments:manual_confirmation.reference_doc")}
                            <span className="text-destructive">*</span>
                        </Label>
                        <div
                            className={cn(
                                "border-2 border-dashed rounded-lg p-5 flex flex-col items-center justify-center cursor-pointer transition-colors",
                                !file ? "border-muted-foreground/20 hover:bg-muted/50" : "border-primary/50 bg-primary/5"
                            )}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={handleDrop}
                            onClick={() =>
                                document.getElementById("mc-file-upload")?.click()
                            }
                        >
                            <Input
                                id="mc-file-upload"
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
                                        {t("shipments:manual_confirmation.remove")}
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center text-center text-muted-foreground">
                                    <Upload className="h-8 w-8 mb-2" />
                                    <span className="text-sm">
                                        {t("shipments:manual_confirmation.upload_text")}
                                    </span>
                                    <span className="text-xs mt-1">
                                        {t("shipments:manual_confirmation.upload_hint")}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                     <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={mutation.isPending}
                    >
                        {t("common:buttons.cancel")}
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={mutation.isPending || !file}
                        className={cn(!file && "opacity-50 cursor-not-allowed")}
                    >
                         {mutation.isPending && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        {t("shipments:manual_confirmation.submit_button")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
