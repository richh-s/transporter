"use client";

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
import { Input } from "@/components/ui/input";
import { Upload, File as FileIcon, Loader2 } from "lucide-react";
import { useManualPaymentConfirmation } from "@/hooks/use-ships";

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
                    <DialogTitle>Manual Payment Confirmation</DialogTitle>
                    <DialogDescription>
                        Provide payment reference details for manual verification.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-2">
                    {/* Reference ID */}
                    <div className="grid gap-1.5">
                        <Label htmlFor="mc-reference-id">Reference ID</Label>
                        <Input
                            id="mc-reference-id"
                            placeholder="e.g. TXN-123456"
                            value={referenceId}
                            onChange={(e) => setReferenceId(e.target.value)}
                        />
                    </div>

                    {/* Reference URL */}
                    <div className="grid gap-1.5">
                        <Label htmlFor="mc-reference-url">Reference URL</Label>
                        <Input
                            id="mc-reference-url"
                            type="url"
                            placeholder="https://..."
                            value={referenceUrl}
                            onChange={(e) => setReferenceUrl(e.target.value)}
                        />
                    </div>

                    {/* Date */}
                    <div className="grid gap-1.5">
                        <Label htmlFor="mc-date">Payment Date</Label>
                        <Input
                            id="mc-date"
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                        />
                    </div>

                    {/* Note */}
                    <div className="grid gap-1.5">
                        <Label htmlFor="mc-note">Note</Label>
                        <textarea
                            id="mc-note"
                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="Additional details about the payment..."
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                        />
                    </div>

                    {/* File Upload */}
                    <div className="grid gap-1.5">
                        <Label>Reference Document</Label>
                        <div
                            className="border-2 border-dashed rounded-lg p-5 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors"
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
                                        Remove
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center text-center text-muted-foreground">
                                    <Upload className="h-8 w-8 mb-2" />
                                    <span className="text-sm">
                                        Click to upload or drag and drop
                                    </span>
                                    <span className="text-xs mt-1">
                                        PDF, JPG, PNG (Max 10MB)
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={mutation.isPending}
                    >
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={mutation.isPending}>
                        {mutation.isPending && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Submit
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
