import React, { useState, useEffect } from "react";
import { ShipItem, ShipItemDocument, ShipItemDocumentTypeEnum } from "@/types/ship";
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

export function ShipItemPodCard({ shipItem: initialShipItem }: ShipItemPodCardProps) {
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
                const itemDetail = data.ship_items?.find((i: any) => i.id === initialShipItem.id);

                // Robust container normalization from the ship detail
                let containers = itemDetail?.containers || (itemDetail?.container ? [itemDetail.container] : []);

                if (containers.length === 0 && data.containers) {
                    // Fallback mapping: use container_id if present, otherwise try item ID (based on user's sample)
                    const containerId = itemDetail?.container_id || initialShipItem.id;
                    const found = data.containers.find((c: any) => c.id === containerId);
                    if (found) containers = [found];
                }

                setShipItem(prev => ({
                    ...prev,
                    ...(itemDetail || {}),
                    containers: containers.length > 0 ? containers : prev.containers,
                    // Keep parent values as fallback
                    origin: data.origin || prev.origin,
                    destination: data.destination || prev.destination,
                    pickup_date: data.pickup_date || prev.pickup_date,
                    ship_id: data.id,
                }));
            }
        } catch (error) {
            console.error("Failed to fetch ship details", error);
        }
    }, [initialShipItem.id, initialShipItem.ship_id]);

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
        setSelectedContainers(prev =>
            prev.includes(containerId)
                ? prev.filter(id => id !== containerId)
                : [...prev, containerId]
        );
    };

    const podCount = documents.filter(d => d.document_type === ShipItemDocumentTypeEnum.PROOF_OF_DELIVERY).length;
    const podDocCount = documents.filter(d => d.document_type === ShipItemDocumentTypeEnum.PROOF_OF_DELIVERY_OF_DOCUMENT).length;
    const returnCount = documents.filter(d => d.document_type === ShipItemDocumentTypeEnum.CONTAINER_INTERCHANGE_DOCUMENT).length;

    return (
        <Card className="w-full">
            <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-lg font-bold">
                            Shipment #{shipItem.ship_id} - Item #{shipItem.id}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                            Status: <Badge variant="outline" className="capitalize">{shipItem.status.replace(/_/g, " ")}</Badge>
                        </p>
                    </div>
                    <div className="text-right flex flex-col gap-1 items-end">
                        <div className="flex gap-2">
                            <Badge variant={podCount > 0 ? "default" : "secondary"}>
                                {podCount} POD
                            </Badge>
                            <Badge variant={returnCount > 0 ? "default" : "secondary"}>
                                {returnCount} Returns
                            </Badge>
                        </div>
                        {podDocCount > 0 && (
                            <Badge variant="default" className="bg-blue-600 hover:bg-blue-700">
                                {podDocCount} POD Document
                            </Badge>
                        )}
                    </div>
                </div>
                {(shipItem.origin || shipItem.destination) && (
                    <div className="mt-2 text-sm font-medium flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-3 w-3 text-red-500" />
                        {shipItem.origin || 'Unknown'}
                        <span className="text-muted-foreground/60">→</span>
                        {shipItem.destination || 'Unknown'}
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
                                {shipItem.assigned_truck ? (
                                    <>
                                        {shipItem.assigned_truck.plate_number}{" "}
                                        <span className="text-muted-foreground font-normal">
                                            ({shipItem.assigned_truck.make || ''} {shipItem.assigned_truck.model || ''})
                                        </span>
                                    </>
                                ) : (
                                    shipItem.truck_id ? `Assigned (ID: ${shipItem.truck_id})` : 'Not Assigned'
                                )}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">Driver:</span>
                            <span className="font-bold">
                                {shipItem.assigned_driver ?
                                    `${shipItem.assigned_driver.first_name} ${shipItem.assigned_driver.last_name}` :
                                    shipItem.driver_id ? `Assigned (ID: ${shipItem.driver_id})` :
                                        'Not Assigned'}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">Date:</span>
                            <span>{shipItem.created_at ? format(new Date(shipItem.created_at), "yyyy-MM-dd") : "N/A"}</span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center gap-2 mb-2">
                            <MapPin className="h-4 w-4 text-red-500" />
                            <span className="font-bold text-primary">Containers:</span>
                        </div>

                        {shipItem.containers && shipItem.containers.length > 0 ? (
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
                                        {shipItem.containers.map((c) => (
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
                                {shipItem.container?.container_number || "No container detailed info available"}
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
                shipItem={shipItem}
                onUploadSuccess={() => {
                    fetchDocuments();
                    setSelectedContainers([]);
                }}
                selectedContainerIds={selectedContainers}
            />
        </Card>
    );
}
