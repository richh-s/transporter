"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { format } from "date-fns";
import { Ship, Container, Truck, Driver } from "@/types/ship";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MapPin, Building2, FileText, Truck as TruckIcon } from "lucide-react";
import { shipApi } from "@/lib/api/ships";
import { truckApi } from "@/lib/api/trucks";
import { driverApi } from "@/lib/api/drivers";
import { ContainersModal } from "./containers-modal";
import { DataTable } from "@/components/ui/data-table";
import { columns as shipItemColumns } from "./ship-items-columns";

export default function ShipDetailsPage() {
    const params = useParams();
    const id = params.id as string;

    const [ship, setShip] = useState<Ship | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showContainersModal, setShowContainersModal] = useState(false);
    const [modalContainers, setModalContainers] = useState<Container[]>([]);
    const [modalTitle, setModalTitle] = useState("Containers");

    // Trucks and Drivers state
    const [trucks, setTrucks] = useState<Truck[]>([]);
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [selectedTrucks, setSelectedTrucks] = useState<Record<number, number | null>>({});
    const [selectedDrivers, setSelectedDrivers] = useState<Record<number, number | null>>({});

    useEffect(() => {
        const loadData = async () => {
            if (!id) return;
            setIsLoading(true);
            setError(null);
            try {
                // Fetch ship details
                const shipRes = await shipApi.getShip(id);
                if (shipRes.error) throw new Error(shipRes.error);

                const currentShip = shipRes.data;
                if (currentShip) {
                    setShip(currentShip);
                } else {
                    throw new Error("Ship data not found");
                }

                // Fetch trucks and drivers for the transporter
                const [trucksRes, driversRes] = await Promise.all([
                    truckApi.getTrucks({ per_page: 100 }),
                    driverApi.getDrivers({ per_page: 100 })
                ]);

                setTrucks(trucksRes.data?.items || []);
                setDrivers(driversRes.data?.items || []);

            } catch (err: any) {
                console.error("Failed to load ship details", err);
                setError(err.message || "Failed to load ship details");
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [id]);



    const handleViewShipItemContainers = (containers: Container[]) => {
        setModalContainers(containers);
        setModalTitle("Ship Item Containers");
        setShowContainersModal(true);
    };

    const handleTruckChange = (shipItemId: number, truckId: number | null) => {
        setSelectedTrucks(prev => ({
            ...prev,
            [shipItemId]: truckId
        }));
    };

    const handleDriverChange = (shipItemId: number, driverId: number | null) => {
        setSelectedDrivers(prev => ({
            ...prev,
            [shipItemId]: driverId
        }));
    };

    const handleAssign = async (shipItemId: number, truckId: number | null, driverId: number | null) => {
        // TODO: Implement assignment logic
        console.log("Assigning:", { shipItemId, truckId, driverId });
        // For now, just log the assignment
        // You can implement the API call here later
    };

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
