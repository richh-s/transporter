import React from "react";
import { ShipItemDocument, ShipItemDocumentTypeEnum } from "@/types/ship";
import { Button } from "@/components/ui/button";
import { FileText, Eye } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface DocumentListProps {
    documents: ShipItemDocument[];
}

export function DocumentList({ documents }: DocumentListProps) {
    if (documents.length === 0) {
        return (
            <div className="text-center py-6 bg-muted/20 rounded-lg border border-dashed">
                <p className="text-sm text-muted-foreground">No documents uploaded yet.</p>
            </div>
        );
    }

    // Group documents by type
    const podDocs = documents.filter(d => d.document_type === ShipItemDocumentTypeEnum.PROOF_OF_DELIVERY);
    const podDocumentDocs = documents.filter(d => d.document_type === ShipItemDocumentTypeEnum.POD_DOCUMENT);
    const returnDocs = documents.filter(d => d.document_type === ShipItemDocumentTypeEnum.CONTAINER_RETURN_RECEIPT);

    const renderDocItem = (doc: ShipItemDocument) => (
        <div key={doc.id} className="flex items-center justify-between p-3 border rounded-md bg-card mb-2">
            <div className="flex items-center gap-3 overflow-hidden">
                <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <FileText className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                        {doc.file_name || `${doc.document_type.replace(/_/g, " ")}.${doc.file_ext}`}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{format(new Date(doc.created_at), "MMM d, yyyy")}</span>
                        {doc.container_id && <span className="px-1.5 py-0.5 rounded-full bg-muted text-[10px]">Container #{doc.container_id}</span>}
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-1">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    title={doc.presigned_url ? "View Document" : "No URL available"}
                    disabled={!doc.presigned_url}
                    onClick={() => {
                        if (doc.presigned_url) {
                            window.open(doc.presigned_url, "_blank", "noopener,noreferrer");
                        } else {
                            toast.error("Document URL not available");
                        }
                    }}
                >
                    <Eye className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );

    return (
        <div className="space-y-4">
            {podDocs.length > 0 && (
                <div>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Proof of Delivery</h4>
                    {podDocs.map(renderDocItem)}
                </div>
            )}

            {returnDocs.length > 0 && (
                <div>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 mt-4">Return Receipts</h4>
                    {returnDocs.map(renderDocItem)}
                </div>
            )}

            {podDocumentDocs.length > 0 && (
                <div>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 mt-4">Proof of Delivery of Document</h4>
                    {podDocumentDocs.map(renderDocItem)}
                </div>
            )}
        </div>
    );
}
