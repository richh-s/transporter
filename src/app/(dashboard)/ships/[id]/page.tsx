"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { format } from "date-fns";
import {
    Ship,
    ShipDocument,
    ShipItem,
    ShipStatusEnum,
    LocationEnum,
    ShipItemStatusEnum,
    ShipDocumentTypeEnum,
    DocumentStatusEnum,
} from "@/types/ship";
import { DataTable } from "@/components/ui/data-table";
import { columns as shipItemColumns } from "./ship-items-columns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button"; // For document download mock
import { FileText } from "lucide-react";

// Dummy Data Generators
const generateDummyShipItems = (count: number): ShipItem[] => {
    return Array.from({ length: count }).map((_, i) => ({
        id: i + 1,
        ship_id: 1,
        transporter_id: 1,
        computed_price: 15000 + i * 100,
        currency: "ETB",
        status: ShipItemStatusEnum.ASSIGNED,
        truck_id: i % 3 === 0 ? 1 : null,
        driver_id: i % 3 === 0 ? 1 : null,
    }));
};

const generateDummyDocuments = (): ShipDocument[] => [
    {
        id: 1,
        ship_id: 1,
        document_type: ShipDocumentTypeEnum.BILL_OF_LADING,
        status: DocumentStatusEnum.APPROVED,
        file_path: "/docs/bl.pdf",
        file_ext: "pdf",
    },
    {
        id: 2,
        ship_id: 1,
        document_type: ShipDocumentTypeEnum.PACKING_LIST,
        status: DocumentStatusEnum.PENDING,
        file_path: "/docs/pl.pdf",
        file_ext: "pdf",
    },
];

export default function ShipDetailsPage() {
    const params = useParams();
    const id = params.id;
    const [ship, setShip] = useState<Ship | null>(null);
    const [shipItems, setShipItems] = useState<ShipItem[]>([]);
    const [documents, setDocuments] = useState<ShipDocument[]>([]);

    useEffect(() => {
        // Simulate fetching ship details
        if (id) {
            const dummyShip: Ship = {
                id: Number(id),
                shipper_id: 101,
                origin: LocationEnum.ADDIS_ABABA,
                destination: LocationEnum.BAHIR_DAR,
                pickup_date: new Date().toISOString(),
                delivery_date: new Date().toISOString(),
                pickup_facility: { name: "Kality Warehouse", address: "Kality, Addis Ababa" },
                delivery_facility: { name: "Bahir Dar Depot", address: "Kebele 04, Bahir Dar" },
                shipment_details: {
                    cargo_type: "Dry Goods",
                    weight: "40 Tons",
                    volume: "60 CBM",
                    notes: "Handle with care",
                },
                status: ShipStatusEnum.IN_TRANSIT,
            };

            setShip(dummyShip);
            setShipItems(generateDummyShipItems(15));
            setDocuments(generateDummyDocuments());
        }
    }, [id]);

    if (!ship) {
        return <div className="p-10">Loading ship details...</div>;
    }

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
                        <span className="text-muted-foreground">Pickup</span>
                        <span className="font-medium">{format(new Date(ship.pickup_date), "PPP")}</span>
                    </div>
                    <Separator orientation="vertical" className="h-10" />
                    <div className="flex flex-col">
                        <span className="text-muted-foreground">Delivery</span>
                        <span className="font-medium">{format(new Date(ship.delivery_date), "PPP")}</span>
                    </div>
                </div>
            </div>

            <Separator />

            {/* Shipment Details & Facilities */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Shipment Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {Object.entries(ship.shipment_details).map(([key, value]) => (
                            <div key={key} className="flex justify-between">
                                <span className="text-muted-foreground capitalize">{key.replace('_', ' ')}</span>
                                <span className="font-medium">{String(value)}</span>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Facilities</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <h4 className="font-semibold text-sm mb-1">Pickup Facility</h4>
                            <p className="text-sm">{ship.pickup_facility.name}</p>
                            <p className="text-xs text-muted-foreground">{ship.pickup_facility.address}</p>
                        </div>
                        <Separator />
                        <div>
                            <h4 className="font-semibold text-sm mb-1">Delivery Facility</h4>
                            <p className="text-sm">{ship.delivery_facility.name}</p>
                            <p className="text-xs text-muted-foreground">{ship.delivery_facility.address}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Documents Section */}
            <section>
                <h2 className="text-2xl font-semibold tracking-tight mb-4">Documents</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {documents.map((doc) => (
                        <Card key={doc.id} className="hover:bg-accent/10 transition-colors cursor-pointer">
                            <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                    <FileText className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="font-medium truncate max-w-[150px]" title={doc.document_type}>{doc.document_type}</p>
                                    <Badge variant={doc.status === DocumentStatusEnum.APPROVED ? "default" : "secondary"} className="mt-2 text-[10px]">
                                        {doc.status}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>

            {/* Ship Items Table */}
            <section>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold tracking-tight">Ship Items (Loads)</h2>
                    <div className="text-sm text-muted-foreground">
                        Total Estimated: <span className="font-bold text-foreground">{new Intl.NumberFormat('en-ET', { style: 'currency', currency: 'ETB' }).format(shipItems.reduce((acc, item) => acc + item.computed_price, 0))}</span>
                    </div>
                </div>

                <DataTable columns={shipItemColumns} data={shipItems} />
            </section>
        </div>
    );
}
