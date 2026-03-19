"use client";

import { Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
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
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation(["fleet", "common"]);
  const deleteTruckMutation = useDeleteTruck();

  const handleDelete = async () => {
    if (!truck) return;

    try {
      await deleteTruckMutation.mutateAsync(truck.id);
      toast.success(t("fleet:messages.truck_deleted"));
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
            {t("fleet:labels.delete_truck_confirm")}
          </DialogTitle>
          <DialogDescription className="pt-2">
            {t("fleet:labels.delete_truck_description", { plate_number: truck.plate_number })}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="pt-4 gap-2 sm:gap-0 flex-col sm:flex-row">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            {t("common:buttons.cancel")}
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
            {t("fleet:labels.delete_truck")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
