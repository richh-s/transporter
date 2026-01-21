import React, { useState, useEffect } from "react";
import { ShipItem, ShipItemDocument } from "@/types/ship";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MapPin, Truck, User, Calendar, FileText, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { DocumentList } from "./DocumentList";
import { PodUploadModal } from "./PodUploadModal";
import { shipApi } from "@/lib/api/ships";
import { toast } from "sonner"; // Assuming global toast is available, or use a hook

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

    const fetchDocuments = async () => {
        setLoadingDocs(true);
        try {
            const response = await shipApi.getShipItemDocuments(shipItem.id);
            // Assuming response is the array directly based on my implementation plan for api-client
            // or check if response.data exists. 
            // My implementation of getShipItemDocuments returns `request<any[]>` which returns `{ data: any[], ... }`.
            // Wait, my `uploadShipItemDocument` used fetch and returned json.
            // `getShipItemDocuments` used `request`.
            // So I need to handle `ApiResponse`.
            if (response.data) {
                setDocuments(response.data);
            } else {
                // Some fallback if structure dictates
            }
        } catch (error) {
            console.error("Failed to fetch documents", error);
        } finally {
            setLoadingDocs(false);
        }
    };

    useEffect(() => {
        fetchDocuments();
    }, [shipItem.id]);

    const handleDeleteDocument = async (docId: number) => {
        if (!confirm("Are you sure you want to delete this document?")) return;
        try {
            await shipApi.deleteShipItemDocument(shipItem.id, docId);
            toast.success("Document deleted");
            fetchDocuments();
        } catch (error) {
            console.error("Delete failed", error);
            toast.error("Failed to delete document");
        }
    };

    const podCount = documents.filter(d => d.document_type === "proof_of_delivery").length;
    const returnCount = documents.filter(d => d.document_type === "container_return_receipt").length;

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
                    <div className="text-right">
                        <Badge variant={podCount > 0 ? "default" : "secondary"}>
                            {podCount} POD
                        </Badge>
                        {/* Show return count if relevant (container return) */}
                        <Badge variant={returnCount > 0 ? "default" : "secondary"} className="ml-2">
                            {returnCount} Returns
                        </Badge>
                    </div>
                </div>
                {(shipItem.origin || shipItem.destination) && (
                    <div className="mt-2 text-sm font-medium flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-3 w-3" />
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
                            <span>
                                {shipItem.assigned_truck ?
                                    `${shipItem.assigned_truck.plate_number} (${shipItem.assigned_truck.model || 'Unknown'})` :
                                    shipItem.truck_id ? `Assigned (ID: ${shipItem.truck_id})` :
                                        'Not Assigned'}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">Driver:</span>
                            <span>
                                {shipItem.assigned_driver ?
                                    `${shipItem.assigned_driver.first_name} ${shipItem.assigned_driver.last_name}` :
                                    shipItem.driver_id ? `Assigned (ID: ${shipItem.driver_id})` :
                                        'Not Assigned'}
                            </span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">Containers:</span>
                            <span>
                                {shipItem.containers && shipItem.containers.length > 0
                                    ? shipItem.containers.map(c => c.container_number).filter(Boolean).join(", ")
                                    : shipItem.container?.container_number
                                    || "No container info"}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">Date:</span>
                            <span>{shipItem.created_at ? format(new Date(shipItem.created_at), "yyyy-MM-dd") : "N/A"}</span>
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
                                onDelete={handleDeleteDocument}
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
                onOpenChange={setUploadModalOpen}
                shipItem={shipItem}
                onUploadSuccess={fetchDocuments}
            />
        </Card>
    );
}
