"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { format } from "date-fns";
import { Container, Truck, Driver } from "@/types/ship";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MapPin, Building2, FileText, Truck as TruckIcon, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useShip, useAssignTruck, useAssignDriver, useShipItems } from "@/hooks/use-ships";
import { useTrucksQuery } from "@/hooks/use-trucks-query";
import { useDrivers } from "@/hooks/use-drivers";
import { ContainersModal } from "./containers-modal";
import { DataTable } from "@/components/ui/data-table";
import { columns as shipItemColumns } from "./ship-items-columns";

export default function ShipDetailsPage() {
    const params = useParams();
    const id = params.id as string;

    const { data: ship, isLoading: isShipLoading, error: shipError } = useShip(id);
    const { data: trucksData, isLoading: isTrucksLoading } = useTrucksQuery({ per_page: 100 });
    const { data: driversData, isLoading: isDriversLoading } = useDrivers({ per_page: 100 });
    const { data: globalShipItemsData, isLoading: isGlobalLoading } = useShipItems({ per_page: 1000 });

    console.log("🚛 Trucks Data Response:", trucksData);
    console.log("🌐 Global Ship Items Response:", globalShipItemsData);

    const assignTruck = useAssignTruck(id);
    const assignDriver = useAssignDriver(id);

    const trucks = Array.isArray(trucksData) ? trucksData : (trucksData as unknown as { items: Truck[] })?.items || [];
    const drivers = Array.isArray(driversData) ? driversData : (driversData as unknown as { items: Driver[] })?.items || [];
    const globalShipItems = globalShipItemsData?.items || [];

    console.log("🚛 Parsed Trucks:", trucks);
    console.log("📦 Parsed Global Ship Items:", globalShipItems);

    const isLoading = isShipLoading || isTrucksLoading || isDriversLoading || isGlobalLoading;
    const error = shipError ? (shipError as Error).message : null;
    const handleViewShipItemContainers = (containers: Container[]) => {
        setModalContainers(containers);
        setShowContainersModal(true);
    };

    const handleTruckChange = (shipItemId: number, truckId: number | null) => {
        setSelectedTrucks((prev: Record<number, number | null>) => ({
            ...prev,
            [shipItemId]: truckId
        }));
    };

    const handleDriverChange = (shipItemId: number, driverId: number | null) => {
        setSelectedDrivers((prev: Record<number, number | null>) => ({
            ...prev,
            [shipItemId]: driverId
        }));
    };

    const handleAssign = (shipItemId: number, truckId: number | null, driverId: number | null) => {
        if (truckId) {
            assignTruck.mutate({ shipItemId, data: { truck_id: truckId } });
        }
        if (driverId) {
            assignDriver.mutate({ shipItemId, data: { driver_id: driverId } });
        }
    };

    const [showContainersModal, setShowContainersModal] = useState(false);
    const [modalContainers, setModalContainers] = useState<Container[]>([]);
    const [selectedTrucks, setSelectedTrucks] = useState<Record<number, number | null>>({});
    const [selectedDrivers, setSelectedDrivers] = useState<Record<number, number | null>>({});

    if (isLoading) {
        return <div className="p-10 flex justify-center">Loading ship details...</div>;
    }

    if (error) {
        return <div className="p-10 text-destructive flex justify-center">{error}</div>;
    }

    if (!ship) {
        return <div className="p-10 text-destructive flex justify-center">Ship not found</div>;
    }


    const shipItems = ship.ship_items || [];

    return (
        <div className="container mx-auto py-10 space-y-8">
            <Link
                href="/ships"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors w-fit"
            >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Ships</span>
            </Link>

            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                        Shipment #{ship.id}
                        <Badge variant="outline" className="text-lg">
                            {ship.status}
                        </Badge>
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        {ship.origin} <span className="mx-2">→</span> {ship.destination}
                    </p>
                </div>
                <div className="flex gap-4 text-sm text-right">
                    <div className="flex flex-col">
                        <span className="text-muted-foreground">Pickup Date</span>
                        <span className="font-medium">
                            {ship.pickup_date ? format(new Date(ship.pickup_date), "PPP") : "N/A"}
                        </span>
                    </div>
                    <Separator orientation="vertical" className="h-10" />
                    <div className="flex flex-col">
                        <span className="text-muted-foreground">Delivery Date</span>
                        <span className="font-medium">
                            {ship.delivery_date ? format(new Date(ship.delivery_date), "PPP") : "N/A"}
                        </span>
                    </div>
                </div>
            </div>

            <Separator />

            {/* Facility and Shipment Details Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Pickup Facility */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MapPin className="h-5 w-5" />
                            Pickup Facility
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div>
                            <p className="text-sm text-muted-foreground">Name</p>
                            <p className="font-medium">{ship.pickup_facility?.name || "-"}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Address</p>
                            <p className="text-sm">{ship.pickup_facility?.address || "-"}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Region</p>
                            <p className="text-sm">{ship.pickup_facility?.region || "-"}, {ship.pickup_facility?.country || "-"}</p>
                        </div>
                        <Separator />
                        <div>
                            <p className="text-sm text-muted-foreground">Contact</p>
                            <p className="text-sm font-medium">{ship.pickup_facility?.contact_name || "-"}</p>
                            <p className="text-xs text-muted-foreground">{ship.pickup_facility?.contact_phone_number || "-"}</p>
                            <p className="text-xs text-muted-foreground">{ship.pickup_facility?.contact_email || "-"}</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Delivery Facility */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Building2 className="h-5 w-5" />
                            Delivery Facility
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div>
                            <p className="text-sm text-muted-foreground">Name</p>
                            <p className="font-medium">{ship.delivery_facility?.name || "-"}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Address</p>
                            <p className="text-sm">{ship.delivery_facility?.address || "-"}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Region</p>
                            <p className="text-sm">{ship.delivery_facility?.region || "-"}, {ship.delivery_facility?.country || "-"}</p>
                        </div>
                        <Separator />
                        <div>
                            <p className="text-sm text-muted-foreground">Contact</p>
                            <p className="text-sm font-medium">{ship.delivery_facility?.contact_name || "-"}</p>
                            <p className="text-xs text-muted-foreground">{ship.delivery_facility?.contact_phone_number || "-"}</p>
                            <p className="text-xs text-muted-foreground">{ship.delivery_facility?.contact_email || "-"}</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Shipment Details */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Shipment Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div>
                            <p className="text-sm text-muted-foreground">Bill of Lading Number</p>
                            <p className="font-medium">{ship.shipment_details?.bill_of_lading_number || "-"}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Pickup Number</p>
                            <p className="font-medium">{ship.shipment_details?.pickup_number || "-"}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Delivery Number</p>
                            <p className="font-medium">{ship.shipment_details?.delivery_number || "-"}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Ship Items Table */}
            {shipItems.length > 0 && (
                <section>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
                            <TruckIcon className="h-6 w-6" />
                            Ship Items
                        </h2>
                        <div className="text-sm text-muted-foreground">
                            Total: <span className="font-bold text-foreground">{shipItems.length}</span>
                        </div>
                    </div>

                    <DataTable
                        columns={shipItemColumns}
                        data={shipItems}
                        meta={{
                            onViewContainers: handleViewShipItemContainers,
                            trucks,
                            drivers,
                            onAssign: handleAssign,
                            selectedTrucks,
                            selectedDrivers,
                            onTruckChange: handleTruckChange,
                            onDriverChange: handleDriverChange,
                            ship,
                            globalShipItems,
                        }}
                    />
                </section>
            )}



            {/* Containers Modal */}
            <ContainersModal
                containers={modalContainers}
                open={showContainersModal}
                onOpenChange={setShowContainersModal}
            />
        </div>
    );
}
