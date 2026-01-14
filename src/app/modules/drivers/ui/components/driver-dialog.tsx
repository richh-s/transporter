"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DriverForm } from "./driver-form";
import { Driver } from "../../server/types";
import { CreateDriverInput } from "@/lib/zod/driver";

interface DriverDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  driver: Driver | null;
  onSubmit: (values: CreateDriverInput) => void;
}

export function DriverDialog({
  open,
  onOpenChange,
  driver,
  onSubmit,
}: DriverDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {driver ? "Edit Driver" : "Add Driver"}
          </DialogTitle>
        </DialogHeader>

        <DriverForm
          defaultValues={driver || undefined}
          onSubmit={onSubmit}
        />
      </DialogContent>
    </Dialog>
  );
}
