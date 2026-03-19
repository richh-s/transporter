"use client";

import { useState, useEffect } from "react";
import { ShipItem, Truck, Driver } from "@/types/ship";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Truck as TruckIcon,
  User,
  Package,
  Loader2,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AssignModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shipItem: ShipItem | null;
  trucks: Truck[];
  drivers: Driver[];
  onAssign: (
    shipItemId: number,
    truckId: number | null,
    driverId: number | null,
  ) => void;
  isAssigning: boolean;
  allShipItems: ShipItem[];
}

export function AssignModal({
  open,
  onOpenChange,
  shipItem,
  trucks,
  drivers,
  onAssign,
  isAssigning,
  allShipItems,
}: AssignModalProps) {
  const { t } = useTranslation(["shipments", "common"]);
  const [selectedTruckId, setSelectedTruckId] = useState<number | null>(null);
  const [selectedDriverId, setSelectedDriverId] = useState<number | null>(null);

  // Reset selections when modal opens with new ship item
  useEffect(() => {
    if (shipItem && open) {
      const assignedTruck = shipItem.truck || shipItem.assigned_truck;
      const assignedDriver = shipItem.driver || shipItem.assigned_driver;
      setSelectedTruckId(
        assignedTruck?.id ||
        shipItem.truck_id ||
        shipItem.assigned_truck_id ||
        null,
      );
      setSelectedDriverId(
        assignedDriver?.id ||
        shipItem.driver_id ||
        shipItem.assigned_driver_id ||
        null,
      );
    }
  }, [shipItem, open]);

  if (!shipItem) return null;

  // Get currently assigned values
  const assignedTruck = shipItem.truck || shipItem.assigned_truck;
  const assignedDriver = shipItem.driver || shipItem.assigned_driver;
  const dbTruckId =
    assignedTruck?.id || shipItem.truck_id || shipItem.assigned_truck_id;
  const dbDriverId =
    assignedDriver?.id || shipItem.driver_id || shipItem.assigned_driver_id;

  // Calculate taken trucks/drivers by other items
  const takenTruckIds = new Set(
    allShipItems
      .filter((item) => item.id !== shipItem.id)
      .map((item) => {
        const t = item.truck || item.assigned_truck;
        return t?.id || item.truck_id || item.assigned_truck_id;
      })
      .filter(Boolean) as number[],
  );

  const takenDriverIds = new Set(
    allShipItems
      .filter((item) => item.id !== shipItem.id)
      .map((item) => {
        const d = item.driver || item.assigned_driver;
        return d?.id || item.driver_id || item.assigned_driver_id;
      })
      .filter(Boolean) as number[],
  );

  // Filter available trucks
  const availableTrucks = trucks.filter((t) => {
    // Handling backend typo "assigend" and "assigned"
    const isGloballyAssigned = (t as unknown as Record<string, unknown>).assigned === true || (t as unknown as Record<string, unknown>).assigend === true;
    const isDeleted = (t as unknown as Record<string, unknown>).deleted === true;
    const isActive = t.status?.toLowerCase() === "active";
    const isCurrentlyAssigned = String(t.id) === String(dbTruckId);
    const isTakenLocally = takenTruckIds.has(Number(t.id));

    // Show if it's the one already assigned to this item, 
    // OR if it's ACTIVE AND not deleted AND not assigned elsewhere
    return isCurrentlyAssigned || (isActive && !isDeleted && !isGloballyAssigned && !isTakenLocally);
  });

  // Ensure assigned truck is in list
  if (
    assignedTruck &&
    !availableTrucks.find((t) => t.id === assignedTruck.id)
  ) {
    availableTrucks.unshift(assignedTruck);
  }

  const availableDrivers = drivers.filter((d) => {
    // Handling backend typo "assigend" and "assigned"
    const isGloballyAssigned = (d as unknown as Record<string, unknown>).assigned === true || (d as unknown as Record<string, unknown>).assigend === true;
    const isDeleted = (d as unknown as Record<string, unknown>).deleted === true;
    const isActive = d.status?.toLowerCase() === "active";
    const isCurrentlyAssigned = String(d.id) === String(dbDriverId);
    const isTakenLocally = takenDriverIds.has(Number(d.id));

    // Show if it's the one already assigned to this item,
    // OR if it's ACTIVE AND not deleted AND not assigned elsewhere
    return isCurrentlyAssigned || (isActive && !isDeleted && !isGloballyAssigned && !isTakenLocally);
  });

  // Ensure assigned driver is in list
  if (
    assignedDriver &&
    !availableDrivers.find((d) => d.id === assignedDriver.id)
  ) {
    availableDrivers.unshift(assignedDriver);
  }

  const handleAssign = () => {
    onAssign(shipItem.id, selectedTruckId, selectedDriverId);
    onOpenChange(false);
  };

  const containers =
    shipItem.containers || (shipItem.container ? [shipItem.container] : []);
  const totalWeight = containers.reduce(
    (acc, c) => acc + (c.gross_weight || c.weight || 0),
    0,
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="w-[95vw] sm:max-w-md rounded-2xl p-0 overflow-hidden bg-background shadow-lg border-none"
      >
        <DialogHeader className="p-4 pb-3 border-b bg-muted/30">
          <DialogTitle className="flex items-center gap-2 text-base">
            <Package className="h-5 w-5 text-primary" />
            {t("shipments:assign_modal.title", { id: shipItem.id })}
          </DialogTitle>
          <DialogDescription className="text-xs">
            {t("shipments:assign_modal.description")}
          </DialogDescription>
        </DialogHeader>

        <div className="p-4 space-y-4 min-w-0 overflow-hidden">
          {/* Ship Item Summary */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50 min-w-0 gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Package className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">
                  {t(
                    containers.length === 1
                      ? "shipments:assign_modal.containers_count"
                      : "shipments:assign_modal.containers_count_plural",
                    { count: containers.length },
                  )}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {t("shipments:assign_modal.total_weight", {
                    weight: totalWeight.toLocaleString(),
                  })}
                </p>
              </div>
            </div>
            <div
              className={cn(
                "px-2 py-1 rounded-full text-[10px] font-semibold shrink-0 whitespace-nowrap",
                shipItem.status === "DELIVERED"
                  ? "bg-emerald-500/10 text-emerald-600"
                  : shipItem.status === "IN_TRANSIT"
                    ? "bg-amber-500/10 text-amber-600"
                    : "bg-blue-500/10 text-blue-600",
              )}
            >
              {shipItem.status || "PENDING"}
            </div>
          </div>

          {/* Truck Selection */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              <TruckIcon className="h-3.5 w-3.5" />
              {t("shipments:assign_modal.truck_label")}
            </label>
            <Select
              value={selectedTruckId?.toString() || ""}
              onValueChange={(value) =>
                setSelectedTruckId(value ? Number(value) : null)
              }
            >
              <SelectTrigger className="h-12 rounded-xl min-w-0 w-full overflow-hidden">
                <div className="flex-1 text-left truncate min-w-0 pr-4">
                  <SelectValue placeholder={t("shipments:assign_modal.truck_placeholder")} />
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {availableTrucks.length === 0 ? (
                  <div className="p-3 text-center text-sm text-muted-foreground">
                    {t("shipments:assign_modal.no_trucks")}
                  </div>
                ) : (
                  availableTrucks.map((truck) => (
                    <SelectItem
                      key={truck.id}
                      value={truck.id.toString()}
                      className="rounded-lg"
                    >
                      <div className="flex items-center gap-2 min-w-0 overflow-hidden">
                        <span className="font-semibold truncate">
                          {truck.plate_number}
                        </span>
                        <span className="text-muted-foreground text-xs truncate shrink opacity-70">
                          {truck.make} {truck.model}
                        </span>
                        {truck.status && truck.status.toLowerCase() !== "active" && (
                          <span className="text-[10px] bg-amber-500/10 text-amber-600 px-1.5 py-0.5 rounded capitalize">
                            {truck.status}
                          </span>
                        )}
                        {truck.capacity_quintal && (
                          <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded">
                            {truck.capacity_quintal} Kg
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {selectedTruckId && (
              <div className="flex items-center gap-1.5 text-xs text-emerald-600">
                <Check className="h-3 w-3" />
                {t("shipments:assign_modal.truck_selected")}
              </div>
            )}
          </div>

          {/* Driver Selection */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              <User className="h-3.5 w-3.5" />
              {t("shipments:assign_modal.driver_label")}
            </label>
            <Select
              value={selectedDriverId?.toString() || ""}
              onValueChange={(value) =>
                setSelectedDriverId(value ? Number(value) : null)
              }
            >
              <SelectTrigger className="h-12 rounded-xl min-w-0 w-full overflow-hidden">
                <div className="flex-1 text-left truncate min-w-0 pr-4">
                  <SelectValue placeholder={t("shipments:assign_modal.driver_placeholder")} />
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {availableDrivers.length === 0 ? (
                  <div className="p-3 text-center text-sm text-muted-foreground">
                    {t("shipments:assign_modal.no_drivers")}
                  </div>
                ) : (
                  availableDrivers.map((driver) => (
                    <SelectItem
                      key={driver.id}
                      value={driver.id.toString()}
                      className="rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-semibold truncate">
                          {driver.first_name} {driver.last_name}
                        </span>
                        {driver.phone_number && (
                          <span className="text-muted-foreground text-xs truncate shrink opacity-70">
                            {driver.phone_number}
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {selectedDriverId && (
              <div className="flex items-center gap-1.5 text-xs text-emerald-600">
                <Check className="h-3 w-3" />
                {t("shipments:assign_modal.driver_selected")}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="p-4 pt-0 flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:flex-1 rounded-xl h-11"
          >
            {t("common:buttons.cancel")}
          </Button>
          <Button
            onClick={handleAssign}
            disabled={isAssigning || (!selectedTruckId && !selectedDriverId)}
            className="w-full sm:flex-1 rounded-xl bg-primary h-11"
          >
            {isAssigning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("shipments:assign_modal.assigning_button")}
              </>
            ) : (
              t("shipments:assign_modal.assign_button")
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
