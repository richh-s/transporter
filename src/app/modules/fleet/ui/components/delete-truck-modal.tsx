"use client";

import { Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Truck } from "@/lib/api/trucks";
import { useDeleteTruck } from "@/app/modules/fleet/server/hooks";

interface DeleteTruckModalProps {
  truck: Truck | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function DeleteTruckModal({
  truck,
  isOpen,
  onOpenChange,
  onSuccess,
}: DeleteTruckModalProps) {
  const deleteTruckMutation = useDeleteTruck();

  const handleDelete = async () => {
    if (!truck) return;

    try {
      await deleteTruckMutation.mutateAsync(truck.id);
      // Only close modal and show success on actual success
      onOpenChange(false);
      onSuccess?.();
    } catch (err: unknown) {
      console.error("Failed to delete truck:", err);
      // Modal stays open to show error message
    }
  };

  if (!truck) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] max-w-[90vw]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive text-lg">
            <AlertTriangle className="h-5 w-5" />
            Delete Truck
          </DialogTitle>
          <DialogDescription className="pt-2">
            Are you sure you want to delete truck{" "}
            <span className="font-bold text-brand-primary">
              {truck.plate_number}
            </span>
            ? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="pt-4 gap-2 sm:gap-0 flex-col sm:flex-row">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteTruckMutation.isPending}
            className="w-full sm:w-auto"
          >
            {deleteTruckMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Delete Truck
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

