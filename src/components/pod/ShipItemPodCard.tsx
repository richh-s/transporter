import React, { useState, useEffect } from "react";
import { ShipItem, ShipItemDocument } from "@/types/ship";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Truck, User, Calendar, FileText, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { DocumentList } from "./DocumentList";
import { PodUploadModal } from "./PodUploadModal";
import { shipApi } from "@/lib/api/ships";
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

export function ShipItemPodCard({ shipItem }: ShipItemPodCardProps) {
    const [expanded, setExpanded] = useState(false);
    const [documents, setDocuments] = useState<ShipItemDocument[]>([]);
    const [loadingDocs, setLoadingDocs] = useState(false);
    const [uploadModalOpen, setUploadModalOpen] = useState(false);
    const [selectedContainers, setSelectedContainers] = useState<string[]>([]);
    const [fullShipItem, setFullShipItem] = useState<ExtendedShipItem>(shipItem);

    const fetchDocuments = useCallback(async () => {
        setLoadingDocs(true);
        try {
            const response = await shipApi.getShipItemDocuments(shipItem.id);
            if (response.data) {
                setDocuments(response.data);
            }
        } catch (error) {
            console.error("Failed to fetch documents", error);
        } finally {
            setLoadingDocs(false);
        }
    }, [shipItem.id]);

    const fetchDetails = useCallback(async () => {
        try {
            const response = await shipApi.getShipItemDetail(shipItem.ship_id);
            console.log(`Card #${shipItem.id} - Full Ship Detail Response:`, response.data);
            if (response.data) {
                // The response is the parent Ship object containing ship_items
                const parentShip = response.data;
                const detailedItem = parentShip.ship_items?.find((item: ShipItem) => item.id == shipItem.id);

                console.log(`Card #${shipItem.id} - Found Detailed Item:`, detailedItem);

                if (detailedItem) {
                    setFullShipItem(prev => ({
                        ...prev,
                        ...detailedItem,
                        // Priority to assigned_truck/driver, then truck/driver keys, then previous state
                        assigned_truck: detailedItem.assigned_truck || detailedItem.truck || prev.assigned_truck,
                        assigned_driver: detailedItem.assigned_driver || detailedItem.driver || prev.assigned_driver,
                        // Ensure container is preserved
                        container: detailedItem.container || prev.container,
                        // Ensure containers array is updated correctly
                        containers: detailedItem.containers || (detailedItem.container ? [detailedItem.container] : prev.containers) || [],
                        // Explicitly update origin/dest from parentShip if available
                        origin: parentShip.origin || prev.origin,
                        destination: parentShip.destination || prev.destination,
                        pickup_date: parentShip.pickup_date || prev.pickup_date
                    }));
                }
            }
        } catch (e) {
            console.error("Failed to fetch ship item details", e);
        }
    }, [shipItem.id, shipItem.ship_id]);

    useEffect(() => {
        fetchDocuments();
        fetchDetails();
    }, [fetchDocuments, fetchDetails]);



    const toggleContainer = (containerId: string) => {
        setSelectedContainers(prev =>
            prev.includes(containerId)
                ? prev.filter(id => id !== containerId)
                : [...prev, containerId]
        );
    };

    const podCount = documents.filter(d => d.document_type === "proof_of_delivery").length;
    const returnCount = documents.filter(d => d.document_type === "container_return_receipt").length;

    return (
        <Card className="w-full">
            <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-lg font-bold">
                            Shipment #{fullShipItem.ship_id} - Item #{fullShipItem.id}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                            Status: <Badge variant="outline" className="capitalize">{fullShipItem.status.replace(/_/g, " ")}</Badge>
                        </p>
                    </div>
                    <div className="text-right">
                        <Badge variant={podCount > 0 ? "default" : "secondary"}>
                            {podCount} POD
                        </Badge>
                        <Badge variant={returnCount > 0 ? "default" : "secondary"} className="ml-2">
                            {returnCount} Returns
                        </Badge>
                    </div>
                </div>
                {(fullShipItem.origin || fullShipItem.destination) && (
                    <div className="mt-2 text-sm font-medium flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-3 w-3 text-red-500" />
                        {fullShipItem.origin || 'Unknown'}
                        <span className="text-muted-foreground/60">→</span>
                        {fullShipItem.destination || 'Unknown'}
                    </div>
                )}
            </CardHeader>

            <CardContent className="pb-3 text-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Truck className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">Truck:</span>
                            <span className="font-bold">
                                {fullShipItem.assigned_truck ? (
                                    <>
                                        {fullShipItem.assigned_truck.plate_number}{" "}
                                        <span className="text-muted-foreground font-normal">
                                            ({fullShipItem.assigned_truck.make || ''} {fullShipItem.assigned_truck.model || ''})
                                        </span>
                                    </>
                                ) : (
                                    fullShipItem.truck_id ? `Assigned (ID: ${fullShipItem.truck_id})` : 'Not Assigned'
                                )}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">Driver:</span>
                            <span className="font-bold">
                                {fullShipItem.assigned_driver ?
                                    `${fullShipItem.assigned_driver.first_name} ${fullShipItem.assigned_driver.last_name}` :
                                    fullShipItem.driver_id ? `Assigned (ID: ${fullShipItem.driver_id})` :
                                        'Not Assigned'}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">Date:</span>
                            <span>{fullShipItem.created_at ? format(new Date(fullShipItem.created_at), "yyyy-MM-dd") : "N/A"}</span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center gap-2 mb-2">
                            <MapPin className="h-4 w-4 text-red-500" />
                            <span className="font-bold text-primary">Containers:</span>
                        </div>

                        {fullShipItem.containers && fullShipItem.containers.length > 0 ? (
                            <div className="border rounded-md overflow-hidden bg-card">
                                <Table>
                                    <TableHeader className="bg-muted/50">
                                        <TableRow>
                                            <TableHead className="w-[40px] text-center">#</TableHead>
                                            <TableHead>Number</TableHead>
                                            <TableHead>Size</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead className="text-right">Return</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {fullShipItem.containers.map((c) => (
                                            <TableRow key={c.id} className="cursor-default">
                                                <TableCell className="text-center">
                                                    <Checkbox
                                                        checked={selectedContainers.includes(c.id.toString())}
                                                        onCheckedChange={() => toggleContainer(c.id.toString())}
                                                    />
                                                </TableCell>
                                                <TableCell className="font-bold">{c.container_number}</TableCell>
                                                <TableCell className="text-muted-foreground text-xs capitalize">
                                                    {(c.container_size || '-').replace(/_/g, " ")}
                                                </TableCell>
                                                <TableCell className="text-muted-foreground text-xs capitalize">
                                                    {c.container_type || 'dry'}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {c.is_returning ? (
                                                        <Badge variant="outline" className="text-[10px] h-5 bg-blue-50 text-blue-700 border-blue-200 uppercase">Returns</Badge>
                                                    ) : (
                                                        <span className="text-[10px] text-muted-foreground/40 italic">One-way</span>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <div className="text-sm text-muted-foreground italic">
                                {fullShipItem.container?.container_number || "No container detailed info available"}
                            </div>
                        )}

                        <div className="flex justify-end mt-2">
                            <Button
                                size="sm"
                                variant={selectedContainers.length > 0 ? "default" : "outline"}
                                onClick={() => setUploadModalOpen(true)}
                            >
                                {selectedContainers.length > 0 ? `Upload for Selected (${selectedContainers.length})` : "Upload Document"}
                            </Button>
                        </div>
                    </div>
                </div>

                {expanded && (
                    <div className="mt-4 border-t pt-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold flex items-center gap-2">
                                <FileText className="h-4 w-4" /> Documents
                            </h3>
                            <Button size="sm" onClick={() => setUploadModalOpen(true)}>
                                Upload new
                            </Button>
                        </div>

                        {loadingDocs ? (
                            <div className="flex justify-center py-4">
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : (
                            <DocumentList
                                documents={documents}
                            />
                        )}
                    </div>
                )}
            </CardContent>

            <CardFooter className="pt-0 justify-center border-t bg-muted/20 p-2">
                <Button
                    variant="ghost"
                    size="sm"
                    className="w-full h-8"
                    onClick={() => setExpanded(!expanded)}
                >
                    {expanded ? (
                        <>
                            <ChevronUp className="h-4 w-4 mr-2" /> Hide Documents
                        </>
                    ) : (
                        <>
                            <ChevronDown className="h-4 w-4 mr-2" /> Show Documents & Upload
                        </>
                    )}
                </Button>
            </CardFooter>

            <PodUploadModal
                open={uploadModalOpen}
                onOpenChange={(open) => {
                    setUploadModalOpen(open);
                    if (!open) setSelectedContainers([]);
                }}
                shipItem={fullShipItem}
                onUploadSuccess={() => {
                    fetchDocuments();
                    setSelectedContainers([]);
                }}
                selectedContainerIds={selectedContainers}
            />
        </Card>
    );
}
