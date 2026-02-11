"use client";

import { Loader2 } from "lucide-react";
import {
  AlertDialog,

  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import type { PriceQuote } from "@/types/price-quote";

interface DeleteQuoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quote: PriceQuote;
  onConfirm: () => void;
  isDeleting: boolean;
}

export function DeleteQuoteDialog({
  open,
  onOpenChange,
  quote,
  onConfirm,
  isDeleting,
}: DeleteQuoteDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-[425px] max-w-[95vw] rounded-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Price Quote</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this price quote?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="py-4 space-y-2">
          <p className="text-sm">
            <strong>Quote ID:</strong> #{quote.id}
          </p>
          <p className="text-sm">
            <strong>Route:</strong> {quote.origin} → {quote.destination}
          </p>
          <p className="text-sm">
            <strong>Amount:</strong> {quote.currency} {quote.amount.toLocaleString()}
          </p>
        </div>
        <div className="py-4">
          <p className="text-sm text-muted-foreground mb-2">
            This action cannot be undone. This will permanently delete the price quote.
          </p>
        </div>
        <AlertDialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete Quote"
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

