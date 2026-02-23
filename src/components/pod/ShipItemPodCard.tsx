import React, { useState, useEffect } from "react";
import {
  ShipItem,
  ShipItemDocument,
  ShipItemDocumentTypeEnum,
  Container,
} from "@/types/ship";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Truck,
  User,
  FileText,
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react";
import { DocumentList } from "./DocumentList";
import { PodUploadModal } from "./PodUploadModal";
import { shipApi } from "@/lib/api/ships";
import { truckApi } from "@/lib/api/trucks";
import { driverApi } from "@/lib/api/drivers";
import { Checkbox } from "@/components/ui/checkbox";
import { useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ExtendedShipItem extends ShipItem {
  origin?: string;
  destination?: string;
  pickup_date?: string;
}

interface ShipItemPodCardProps {
  shipItem: ExtendedShipItem;
}

export function ShipItemPodCard({
  shipItem: initialShipItem,
}: ShipItemPodCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [documents, setDocuments] = useState<ShipItemDocument[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedContainers, setSelectedContainers] = useState<string[]>([]);
  const [shipItem, setShipItem] = useState<ExtendedShipItem>(initialShipItem);

  const fetchShipDetail = useCallback(async () => {
    try {
      if (!initialShipItem.ship_id) return;
      const response = await shipApi.getShip(initialShipItem.ship_id);
      const data = response.data;
      if (data) {
        // Find this specific item in the ship's items to get its latest data
        const itemDetail = (data.ship_items as ShipItem[])?.find(
          (i: ShipItem) => i.id === initialShipItem.id,
        );

        // Robust container normalization from the ship detail
        let containers =
          itemDetail?.containers ||
          (itemDetail?.container ? [itemDetail.container] : []);

        if (containers.length === 0 && data.containers) {
          // Fallback mapping: use container_id if present, otherwise try item ID (based on user's sample)
          const containerId = itemDetail?.container_id || initialShipItem.id;
          const found = (data.containers as unknown as Container[])?.find(
            (c: Container) => c.id === containerId,
          );
          if (found) containers = [found];
        }

        const merged = {
          ...initialShipItem,
          ...(itemDetail || {}),
          containers:
            containers.length > 0 ? containers : initialShipItem.containers,
          origin: data.origin || initialShipItem.origin,
          destination: data.destination || initialShipItem.destination,
          pickup_date: data.pickup_date || initialShipItem.pickup_date,
          ship_id: data.id,
        } as ExtendedShipItem;

        // Resolve truck and driver to actual values when we only have IDs
        let assignedTruck = merged.assigned_truck ?? merged.truck ?? null;
        let assignedDriver = merged.assigned_driver ?? merged.driver ?? null;
        const truckId = merged.assigned_truck_id ?? merged.truck_id;
        const driverId = merged.assigned_driver_id ?? merged.driver_id;

        if (!assignedTruck && truckId) {
          try {
            const truckRes = await truckApi.getTruck(String(truckId));
            if (truckRes.data) assignedTruck = truckRes.data;
          } catch {
            // keep null
          }
        }
        if (!assignedDriver && driverId) {
          try {
            const driverRes = await driverApi.getDriver(driverId);
            if (driverRes.data) assignedDriver = driverRes.data;
          } catch {
            // keep null
          }
        }

        setShipItem({
          ...merged,
          assigned_truck: assignedTruck,
          assigned_driver: assignedDriver,
        });
      }
    } catch (error) {
      console.error("Failed to fetch ship details", error);
    }
  }, [initialShipItem]);

  const fetchDocuments = useCallback(async () => {
    setLoadingDocs(true);
    try {
      const response = await shipApi.getShipItemDocuments(initialShipItem.id);
      if (response.data) {
        setDocuments(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch documents", error);
    } finally {
      setLoadingDocs(false);
    }
  }, [initialShipItem.id]);

  useEffect(() => {
    fetchDocuments();
    fetchShipDetail();
  }, [fetchDocuments, fetchShipDetail]);

  const toggleContainer = (containerId: string) => {
    setSelectedContainers((prev) =>
      prev.includes(containerId)
        ? prev.filter((id) => id !== containerId)
        : [...prev, containerId],
    );
  };

  const podCount = documents.filter(
    (d) => d.document_type === ShipItemDocumentTypeEnum.PROOF_OF_DELIVERY,
  ).length;
  const podDocCount = documents.filter(
    (d) =>
      d.document_type ===
      ShipItemDocumentTypeEnum.PROOF_OF_DELIVERY_OF_DOCUMENT,
  ).length;
  const returnCount = documents.filter(
    (d) =>
      d.document_type ===
      ShipItemDocumentTypeEnum.CONTAINER_INTERCHANGE_DOCUMENT,
  ).length;

  const truckLabel =
    shipItem.assigned_truck?.plate_number ??
    (shipItem.truck_id ? `ID: ${shipItem.truck_id}` : "—");
  const driverLabel = shipItem.assigned_driver
    ? `${shipItem.assigned_driver.first_name} ${shipItem.assigned_driver.last_name}`
    : shipItem.driver_id
      ? `Assigned (${shipItem.driver_id})`
      : "—";

  return (
    <div className="w-full min-w-0 max-w-full">
      {/* Mobile layout: same structure as desktop – Truck, Driver, Route cards, then Containers, then Documents */}
      <div className="md:hidden">
        <div className="pb-1 pt-2 px-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <h2 className="text-base font-bold">Item #{shipItem.id}</h2>
            <Badge
              variant="outline"
              className="capitalize bg-primary/10 text-primary border-primary/30 text-xs h-5"
            >
              {shipItem.status.replace(/_/g, " ")}
            </Badge>
          </div>
        </div>

        <div className="pt-0 px-3 pb-3 text-sm space-y-3 min-w-0">
          {/* Individual cards: Truck, Driver, Route (horizontal scroll, full content) */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-3 px-3 md:mx-0 md:px-0 pb-1 min-w-0">
            <div className="shrink-0 w-[72%] min-w-[160px] md:w-auto md:min-w-0 rounded-md border border-border bg-muted/30 p-3 flex items-center gap-3 border-l-4 border-l-primary/60">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-background border border-border">
                <Truck className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Truck
                </p>
                <p className="font-semibold text-sm leading-tight wrap-break-word text-foreground">
                  {truckLabel}
                </p>
              </div>
            </div>
            <div className="shrink-0 w-[72%] min-w-[160px] md:w-auto md:min-w-0 rounded-md border border-border bg-muted/30 p-3 flex items-center gap-3 border-l-4 border-l-primary/60">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-background border border-border">
                <User className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Driver
                </p>
                <p className="font-semibold text-sm leading-tight wrap-break-word text-foreground">
                  {driverLabel}
                </p>
              </div>
            </div>
            <div className="shrink-0 w-[72%] min-w-[200px] md:w-auto md:min-w-0 rounded-md border border-border bg-muted/30 p-3 flex items-center gap-3 border-l-4 border-l-primary/60">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-background border border-border">
                <MapPin className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Route
                </p>
                <p className="font-semibold text-sm leading-tight wrap-break-word text-foreground">
                  {shipItem.origin && shipItem.destination ? (
                    <>
                      <span className="capitalize">
                        {String(shipItem.origin).replace(/_/g, " ")}
                      </span>
                      <span className="text-muted-foreground mx-1">→</span>
                      <span className="capitalize">
                        {String(shipItem.destination).replace(/_/g, " ")}
                      </span>
                    </>
                  ) : (
                    "—"
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Containers (mobile: larger tap area and text) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-1.5 flex-wrap">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-destructive" />
                Containers
              </h3>
              <div className="flex gap-1.5">
                <Badge
                  variant={podCount > 0 ? "default" : "secondary"}
                  className="text-xs h-6 px-2"
                >
                  {podCount} POD
                </Badge>
                <Badge
                  variant={returnCount > 0 ? "default" : "secondary"}
                  className="text-xs h-6 px-2"
                >
                  {returnCount} Returns
                </Badge>
              </div>
            </div>
            {shipItem.containers && shipItem.containers.length > 0 ? (
              <div className="rounded-md border border-border bg-muted/30 divide-y divide-border overflow-hidden">
                {shipItem.containers.slice(0, 5).map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between gap-3 py-2.5 px-3 text-sm min-h-[40px]"
                  >
                    <span className="font-medium">{c.container_number}</span>
                    <span className="text-muted-foreground text-sm capitalize text-right">
                      {(c.container_size || "").replace(/_/g, " ")} ·{" "}
                      {c.is_returning ? "Return" : "One-way"}
                    </span>
                  </div>
                ))}
                {shipItem.containers.length > 5 && (
                  <div className="py-2.5 px-3 text-sm text-muted-foreground">
                    +{shipItem.containers.length - 5} more
                  </div>
                )}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground italic py-3 px-3 rounded-md border border-dashed border-border bg-muted/20 min-h-[44px] flex items-center">
                {shipItem.container?.container_number ?? "No container info"}
              </div>
            )}
          </div>

          {/* Documents (mobile: no + Upload, big button below is enough) */}
          <div className="space-y-2">
            <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5" />
              Documents
            </h3>
            <div className="rounded-md border border-border bg-muted/30 p-3 min-h-[80px]">
              {loadingDocs ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : documents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-4 rounded-lg border border-dashed border-border bg-muted/20">
                  <FileText className="h-8 w-8 text-muted-foreground/50 mb-2" />
                  <p className="text-xs text-muted-foreground">
                    No documents yet
                  </p>
                </div>
              ) : (
                <DocumentList documents={documents} />
              )}
            </div>
          </div>

          <Button
            size="sm"
            variant="default"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={() => setUploadModalOpen(true)}
          >
            Upload document
          </Button>
        </div>
      </div>

      {/* Desktop layout: individual cards (Truck, Driver, Route), then Containers (left) | Documents (right) */}
      <div className="hidden md:block">
        <div className="pb-1 pt-2 px-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <h2 className="text-base font-bold">Item #{shipItem.id}</h2>
            <Badge
              variant="outline"
              className="capitalize bg-blue-500/10 text-blue-600 border-blue-200 text-xs h-5"
            >
              {shipItem.status.replace(/_/g, " ")}
            </Badge>
          </div>
        </div>

        <div className="pb-2 pt-0 px-3 text-sm space-y-3 min-w-0">
          {/* Individual cards: Truck, Driver, Route */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {/* Truck card */}
            <div className="rounded-lg border border-border bg-card p-3 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted/50">
                  <Truck className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Truck
                  </p>
                  <p className="font-bold text-sm leading-tight">
                    {shipItem.assigned_truck ? (
                      <>
                        {shipItem.assigned_truck.plate_number}
                        {shipItem.assigned_truck.make ||
                        shipItem.assigned_truck.model ? (
                          <span className="text-muted-foreground font-normal text-xs block">
                            {shipItem.assigned_truck.make}{" "}
                            {shipItem.assigned_truck.model}
                          </span>
                        ) : null}
                      </>
                    ) : shipItem.truck_id ? (
                      `Assigned (ID: ${shipItem.truck_id})`
                    ) : (
                      "Not Assigned"
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Driver card */}
            <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted/50">
                  <User className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Driver
                  </p>
                  <p className="font-bold text-sm leading-tight">
                    {shipItem.assigned_driver
                      ? `${shipItem.assigned_driver.first_name} ${shipItem.assigned_driver.last_name}`
                      : shipItem.driver_id
                        ? `Assigned (ID: ${shipItem.driver_id})`
                        : "Not Assigned"}
                  </p>
                </div>
              </div>
            </div>

            {/* Route card */}
            <div className="rounded-lg border border-border bg-card p-3 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted/50">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Route
                  </p>
                  <p className="font-bold text-sm leading-tight">
                    {shipItem.origin && shipItem.destination ? (
                      <>
                        <span className="capitalize">
                          {String(shipItem.origin).replace(/_/g, " ")}
                        </span>
                        <span className="text-muted-foreground font-normal mx-1">
                          →
                        </span>
                        <span className="capitalize">
                          {String(shipItem.destination).replace(/_/g, " ")}
                        </span>
                      </>
                    ) : (
                      "—"
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Two columns: Containers (left) | Documents (right), top-aligned */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start min-w-0">
            {/* Left: Containers */}
            <div className="space-y-2 min-w-0 overflow-x-auto">
              <div className="flex items-center justify-between gap-1.5 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-destructive shrink-0" />
                  <span className="font-bold uppercase tracking-wider text-destructive text-xs">
                    Containers
                  </span>
                </div>
                <div className="flex gap-1">
                  <Badge
                    variant={podCount > 0 ? "default" : "secondary"}
                    className="text-[10px] h-5 px-1.5"
                  >
                    {podCount} POD
                  </Badge>
                  <Badge
                    variant={returnCount > 0 ? "default" : "secondary"}
                    className="text-[10px] h-5 px-1.5"
                  >
                    {returnCount} Returns
                  </Badge>
                </div>
              </div>

              {shipItem.containers && shipItem.containers.length > 0 ? (
                <div className="border border-border rounded-md overflow-hidden bg-muted/30">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50 hover:bg-muted/50 border-b border-border">
                        <TableHead className="w-8 text-center h-8 text-xs font-medium">
                          #
                        </TableHead>
                        <TableHead className="text-xs font-medium">
                          Number
                        </TableHead>
                        <TableHead className="text-xs font-medium">
                          Size
                        </TableHead>
                        <TableHead className="text-xs font-medium">
                          Type
                        </TableHead>
                        <TableHead className="text-right text-xs font-medium">
                          Return
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {shipItem.containers.map((c) => (
                        <TableRow key={c.id} className="cursor-default">
                          <TableCell className="text-center py-1.5 px-2">
                            <Checkbox
                              checked={selectedContainers.includes(
                                c.id.toString(),
                              )}
                              onCheckedChange={() =>
                                toggleContainer(c.id.toString())
                              }
                            />
                          </TableCell>
                          <TableCell className="font-bold text-xs py-1.5 px-2">
                            {c.container_number}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-[11px] capitalize py-1.5 px-2">
                            {(c.container_size || "-").replace(/_/g, " ")}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-[11px] capitalize py-1.5 px-2">
                            {c.container_type || "dry"}
                          </TableCell>
                          <TableCell className="text-right py-1.5 px-2">
                            {c.is_returning ? (
                              <Badge
                                variant="outline"
                                className="text-[10px] h-5 bg-blue-50 text-blue-700 border-blue-200 uppercase"
                              >
                                Returns
                              </Badge>
                            ) : (
                              <span className="text-[10px] text-muted-foreground/40 italic">
                                One-way
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-xs text-muted-foreground italic py-2 rounded-md border border-dashed border-border bg-muted/20 px-3">
                  {shipItem.container?.container_number ||
                    "No container detailed info available"}
                </div>
              )}
            </div>

            {/* Right: Documents */}
            <div className="space-y-2 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5" />
                  Documents
                </h3>
                <Button
                  size="sm"
                  variant="default"
                  className="h-7 text-xs bg-primary hover:bg-primary/90 text-primary-foreground"
                  onClick={() => setUploadModalOpen(true)}
                >
                  Upload
                </Button>
              </div>
              <div className="rounded-md border border-border bg-muted/30 p-3 min-h-[100px]">
                {loadingDocs ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                ) : documents.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-4 text-center">
                    <FileText className="h-8 w-8 text-muted-foreground/50 mb-2" />
                    <p className="text-xs text-muted-foreground">
                      No documents yet
                    </p>
                  </div>
                ) : (
                  <DocumentList documents={documents} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <PodUploadModal
        open={uploadModalOpen}
        onOpenChange={(open) => {
          setUploadModalOpen(open);
          if (!open) setSelectedContainers([]);
        }}
        shipItem={shipItem}
        onUploadSuccess={() => {
          fetchDocuments();
          setSelectedContainers([]);
        }}
        selectedContainerIds={selectedContainers}
      />
    </div>
  );
}
