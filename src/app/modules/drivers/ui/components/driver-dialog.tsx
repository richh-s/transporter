"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DriverForm } from "./driver-form";

export function DriverDialog({
  open,
  onOpenChange,
  driver,
  onSubmit,
}: any) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {driver ? "Edit Driver" : "Add Driver"}
          </DialogTitle>
        </DialogHeader>

        <DriverForm
          defaultValues={driver}
          onSubmit={onSubmit}
        />
      </DialogContent>
    </Dialog>
  );
}
