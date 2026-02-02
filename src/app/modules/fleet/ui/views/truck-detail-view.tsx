"use client";

import { toast } from "sonner";

import { Suspense } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Edit2, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  useTruck,
  useTruckDocuments,
  useUploadTruckDocument,
  useUpdateTruckDocument,
  useDeleteTruckDocument,
} from "@/app/modules/fleet/server/hooks";
import { cn } from "@/lib/utils";
import { useState } from "react";
import {
  EditTruckModal,
  DeleteTruckModal,
  UploadDocumentModal,
  UpdateDocumentModal,
  DeleteDocumentModal,
} from "../components";
import { useQueryClient } from "@tanstack/react-query";
import { DataTable } from "@/components/ui/data-table";
import { documentColumns } from "../columns/document-columns";
import type { DocumentTableRow } from "../columns/document-columns";
import type { TruckDocument } from "@/lib/api/trucks";

interface TruckDetailContentProps {
  id: string;
}

function TruckDetailContent({ id }: TruckDetailContentProps) {
  const { data: truck } = useTruck(id);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isUpdateDocumentModalOpen, setIsUpdateDocumentModalOpen] = useState(false);
  const [isDeleteDocumentModalOpen, setIsDeleteDocumentModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<TruckDocument | null>(null);

  const { data: documents, isLoading: documentsLoading } =
    useTruckDocuments(id);
  const uploadDocumentMutation = useUploadTruckDocument();
  const updateDocumentMutation = useUpdateTruckDocument();
  const deleteDocumentMutation = useDeleteTruckDocument();

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["truck", id] });
    queryClient.invalidateQueries({ queryKey: ["trucks"] });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-700 hover:bg-green-100";
      case "maintenance":
        return "bg-amber-100 text-amber-700 hover:bg-amber-100";
      case "inactive":
        return "bg-gray-100 text-gray-700 hover:bg-gray-100";
      case "out_of_service":
        return "bg-red-100 text-red-700 hover:bg-red-100";
      default:
        return "bg-gray-100 text-gray-700 hover:bg-gray-100";
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };


  const handleUploadDocument = async (file: File, documentType: string) => {
    try {
      await uploadDocumentMutation.mutateAsync({
        truckId: id,
        file,
        documentType,
      });
      // Invalidate documents query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["truck-documents", id] });
      toast.success("Document uploaded successfully");
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || "Failed to upload document");
    }
  };

  const handleUpdateDocument = (documentId: number) => {
    const doc = documents?.find((d) => d.id === documentId);
    if (doc) {
      setSelectedDocument(doc);
      setIsUpdateDocumentModalOpen(true);
    }
  };

  const handleUpdateDocumentSubmit = async (documentType: string, file?: File) => {
    if (!selectedDocument) return;
    try {
      await updateDocumentMutation.mutateAsync({
        truckId: id,
        documentId: String(selectedDocument.id),
        updateData: {
          document_type: documentType,
          ...(file && { file }),
        },
      });
      setIsUpdateDocumentModalOpen(false);
      setSelectedDocument(null);
      toast.success("Document updated successfully");
    } catch (error) {
      const err = error as Error;
      console.error("Failed to update document:", err);
      toast.error(err.message || "Failed to update document");
    }
  };

  const handleDeleteDocument = (documentId: number) => {
    const doc = documents?.find((d) => d.id === documentId);
    if (doc) {
      setSelectedDocument(doc);
      setIsDeleteDocumentModalOpen(true);
    }
  };

  const handleDeleteDocumentConfirm = async () => {
    if (!selectedDocument) return;
    try {
      await deleteDocumentMutation.mutateAsync({
        truckId: id,
        documentId: String(selectedDocument.id),
      });
      setIsDeleteDocumentModalOpen(false);
      setSelectedDocument(null);
      toast.success("Document deleted successfully");
    } catch (error) {
      const err = error as Error;
      console.error("Failed to delete document:", err);
      toast.error(err.message || "Failed to delete document");
    }
  };

  const handleViewDocument = (url: string) => {
    window.open(url, "_blank");
  };



  return (
    <div className="flex flex-col min-h-full space-y-3 sm:space-y-4 md:space-y-6 animate-in fade-in duration-500 w-full overflow-x-hidden pb-8">
      {/* Header */}
      <div className="space-y-3 pb-2 border-b shrink-0">
        <div className="flex flex-row items-center justify-between gap-3">
          <div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-brand-primary">
              Truck Details
            </h2>
            <p className="hidden sm:block text-xs sm:text-sm text-muted-foreground">
              View and manage truck information
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditModalOpen(true)}
              className="h-8 text-xs"
            >
              <Edit2 className="h-3.5 w-3.5 mr-1.5" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDeleteModalOpen(true)}
              className="h-8 text-xs text-destructive hover:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
              Delete
            </Button>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/fleet")}
          className="h-8"
        >
          <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
          Back
        </Button>
      </div>

      {/* Main Content - No restrictive nested scroll */}
      <div className="flex-1 min-h-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 pb-4">
          {/* Basic Information */}
          <Card className="p-2 flex flex-col gap-2">
            <CardHeader className="p-0">
              <CardTitle className="text-[10px] font-semibold">
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="grid grid-cols-2 gap-x-1 gap-y-0.5">
                <div>
                  <label className="text-[10px] font-medium text-muted-foreground leading-none">
                    Plate Number
                  </label>
                  <p className="text-xs font-semibold text-brand-primary mt-0 leading-none">
                    {truck.plate_number}
                  </p>
                </div>
                <div>
                  <label className="text-[10px] font-medium text-muted-foreground leading-none">
                    VIN
                  </label>
                  <p className="text-xs font-mono mt-0 leading-none">
                    {truck.vin}
                  </p>
                </div>
                <div>
                  <label className="text-[10px] font-medium text-muted-foreground leading-none">
                    Status
                  </label>
                  <div className="mt-0">
                    <Badge
                      variant="secondary"
                      className={cn(
                        "font-semibold text-[10px] px-0.5 py-0 h-3.5",
                        getStatusColor(truck.status)
                      )}
                    >
                      {truck.status
                        ? truck.status
                          .replace(/_/g, " ")
                          .charAt(0)
                          .toUpperCase() +
                        truck.status.replace(/_/g, " ").slice(1)
                        : "Unknown"}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-medium text-muted-foreground leading-none">
                    Truck Type
                  </label>
                  <p className="text-xs capitalize mt-0 leading-none">
                    {truck.truck_type}
                  </p>
                </div>
                <div>
                  <label className="text-[10px] font-medium text-muted-foreground leading-none">
                    Registration Date
                  </label>
                  <p className="text-xs mt-0 leading-none">
                    {formatDate(truck.registration_date)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Vehicle Details */}
          <Card className="p-2 flex flex-col gap-2">
            <CardHeader className="p-0">
              <CardTitle className="text-[10px] font-semibold">
                Vehicle Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="grid grid-cols-2 gap-x-1 gap-y-0.5">
                <div>
                  <label className="text-[10px] font-medium text-muted-foreground leading-none">
                    Make
                  </label>
                  <p className="text-xs mt-0 leading-none">
                    {truck.make || "—"}
                  </p>
                </div>
                <div>
                  <label className="text-[10px] font-medium text-muted-foreground leading-none">
                    Model
                  </label>
                  <p className="text-xs mt-0 leading-none">
                    {truck.model || "—"}
                  </p>
                </div>
                <div>
                  <label className="text-[10px] font-medium text-muted-foreground leading-none">
                    Year
                  </label>
                  <p className="text-xs mt-0 leading-none">
                    {truck.year || "—"}
                  </p>
                </div>
                <div>
                  <label className="text-[10px] font-medium text-muted-foreground leading-none">
                    Color
                  </label>
                  <p className="text-xs capitalize mt-0 leading-none">
                    {truck.color || "—"}
                  </p>
                </div>
                <div>
                  <label className="text-[10px] font-medium text-muted-foreground leading-none">
                    Capacity
                  </label>
                  <p className="text-xs font-semibold mt-0 leading-none">
                    {truck.capacity_quintal} Q
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card className="p-2 flex flex-col gap-2">
            <CardHeader className="p-0">
              <CardTitle className="text-[10px] font-semibold">
                Additional Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="grid grid-cols-2 gap-x-1 gap-y-0.5">
                <div>
                  <label className="text-[10px] font-medium text-muted-foreground leading-none">
                    Government ID
                  </label>
                  <p className="text-xs mt-0 leading-none">
                    {truck.gov_id || "—"}
                  </p>
                </div>
                <div>
                  <label className="text-[10px] font-medium text-muted-foreground leading-none">
                    GPS Device ID
                  </label>
                  <p className="text-xs mt-0 leading-none">
                    {truck.gps_device_id || "—"}
                  </p>
                </div>
                <div>
                  <label className="text-[10px] font-medium text-muted-foreground leading-none">
                    Libre Key
                  </label>
                  <p className="text-xs mt-0 leading-none">
                    {truck.libre_key || "—"}
                  </p>
                </div>
                {truck.created_at && (
                  <div>
                    <label className="text-[10px] font-medium text-muted-foreground leading-none">
                      Created At
                    </label>
                    <p className="text-xs mt-0 leading-none">
                      {formatDate(truck.created_at)}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Documents Section */}
        <div className="space-y-3 mt-4 sm:mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Documents</h2>
            <Button onClick={() => setIsUploadModalOpen(true)} className="h-8">
              <Upload className="h-4 w-4 mr-2" />
              Upload Document
            </Button>
          </div>

          {/* Documents Table */}
          <DataTable
            columns={documentColumns(
              handleViewDocument,
              handleUpdateDocument,
              handleDeleteDocument,
              deleteDocumentMutation.isPending
            )}
            data={(documents || []) as DocumentTableRow[]}
            searchKey="document_type"
            searchPlaceholder="Search documents..."
            // Client-side pagination
            manualPagination={false}
            perPage={10}
            isLoading={documentsLoading}
          />
        </div>
      </div>

      {/* Edit Modal */}
      <EditTruckModal
        truck={truck}
        isOpen={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        onSuccess={handleSuccess}
      />

      {/* Delete Modal */}
      <DeleteTruckModal
        truck={truck}
        isOpen={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        onSuccess={() => {
          handleSuccess();
          router.push("/fleet");
        }}
      />

      {/* Upload Document Modal */}
      <UploadDocumentModal
        isOpen={isUploadModalOpen}
        onOpenChange={setIsUploadModalOpen}
        onUpload={handleUploadDocument}
        isUploading={uploadDocumentMutation.isPending}
      />

      {/* Update Document Modal */}
      <UpdateDocumentModal
        document={selectedDocument}
        isOpen={isUpdateDocumentModalOpen}
        onOpenChange={setIsUpdateDocumentModalOpen}
        onUpdate={handleUpdateDocumentSubmit}
        isUpdating={updateDocumentMutation.isPending}
      />

      {/* Delete Document Modal */}
      <DeleteDocumentModal
        document={selectedDocument}
        isOpen={isDeleteDocumentModalOpen}
        onOpenChange={setIsDeleteDocumentModalOpen}
        onConfirm={handleDeleteDocumentConfirm}
        isDeleting={deleteDocumentMutation.isPending}
      />
    </div>
  );
}

function TruckDetailLoading() {
  return (
    <div className="flex items-center justify-center h-64 gap-2 text-muted-foreground">
      <Loader2 className="h-5 w-5 animate-spin" />
      <span className="text-sm">Loading truck details...</span>
    </div>
  );
}

interface TruckDetailViewProps {
  id: string;
}

export function TruckDetailView({ id }: TruckDetailViewProps) {
  return (
    <Suspense fallback={<TruckDetailLoading />}>
      <TruckDetailContent id={id} />
    </Suspense>
  );
}
