"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import React from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import {
  useOrganizationDocuments,
  useUploadOrganizationDocument,
  useUpdateOrganizationDocument,
  useDeleteOrganizationDocument,
  useOrganizationDocument,
} from "../../server/hooks";
import { organizationDocumentColumns } from "../columns/document-columns";
import type { OrganizationDocumentTableRow } from "../columns/document-columns";
import {
  UploadDocumentModal,
  EditDocumentModal,
  DeleteDocumentModal,
  DocumentStatsCards,
  DocumentStatusTabs,
  OrganizationDocumentMobileCard,
} from "../components";
import { toast } from "sonner";
import { organizationApi } from "@/lib/api/organization";
import { openInApp } from "@/lib/utils/open-in-app";

export function OrganizationDocumentsView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(
    null,
  );
  const [documentToDelete, setDocumentToDelete] = useState<number | null>(null);

  // Pagination state
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [isScrolled, setIsScrolled] = useState(false);

  // Filter state
  const [filters, setFilters] = useState<{
    status?: "pending" | "approved" | "rejected" | null;
    document_type?: "trade_licence" | "id" | "other" | null;
    entity_type?: "truck" | "driver" | null;
  }>({});

  const { data: documents, isLoading: documentsLoading } =
    useOrganizationDocuments();
  const uploadDocumentMutation = useUploadOrganizationDocument();
  const updateDocumentMutation = useUpdateOrganizationDocument();
  const deleteDocumentMutation = useDeleteOrganizationDocument();

  // Get selected document for editing
  const { data: selectedDocument } = useOrganizationDocument(
    selectedDocumentId || "",
  );

  const handleUploadDocument = async (file: File, documentType: string) => {
    // Close modal optimistically
    setIsUploadModalOpen(false);

    uploadDocumentMutation.mutate(
      {
        file,
        documentType,
      },
      {
        onSuccess: () => {
          toast.success("Document uploaded successfully");
        },
        onError: (error) => {
          toast.error(
            error instanceof Error
              ? error.message
              : "Failed to upload document",
          );
        },
      },
    );
  };

  const handleUpdateDocument = async (
    id: string | number,
    data: { document_type?: string; file?: File },
  ) => {
    // Close modal optimistically
    setIsEditModalOpen(false);
    setSelectedDocumentId(null);

    updateDocumentMutation.mutate(
      { id, data },
      {
        onSuccess: () => {
          toast.success("Document updated successfully");
        },
        onError: (error) => {
          toast.error(
            error instanceof Error
              ? error.message
              : "Failed to update document",
          );
        },
      },
    );
  };

  const handleDeleteDocument = (documentId: number) => {
    setDocumentToDelete(documentId);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async (documentId: number) => {
    // Close modal optimistically
    setIsDeleteModalOpen(false);
    setDocumentToDelete(null);

    deleteDocumentMutation.mutate(documentId, {
      onSuccess: () => {
        toast.success("Document deleted successfully");
      },
      onError: (error) => {
        toast.error(
          error instanceof Error ? error.message : "Failed to delete document",
        );
      },
    });
  };

  const handleViewDocument = async (id: string) => {
    try {
      // Always fetch a fresh presigned URL (bypass cache since URLs expire)
      const response = await organizationApi.getDocument(id);

      if (!response.data) {
        throw new Error(response.error || "Failed to fetch document");
      }

      if (response.data.presigned_url) {
        await openInApp(response.data.presigned_url);
      } else {
        toast.error("Document URL not available");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to view document",
      );
    }
  };

  const handleEditDocument = (id: string) => {
    setSelectedDocumentId(id);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedDocumentId(null);
  };

  const handleEntityClick = (entityType: string, entityId: number | null) => {
    if (!entityId) return;

    if (entityType === "truck") {
      router.push(`/fleet/placeholder?id=${entityId}`);
    } else if (entityType === "driver") {
      // Navigate to driver detail page when it's available
      // For now, you can update this route when driver pages are implemented
      router.push(`/drivers/placeholder?id=${entityId}`);
    }
  };

  // Filter handlers
  const handleStatusFilter = (
    status: "pending" | "approved" | "rejected" | "all" | null,
  ) => {
    setFilters((prev) => ({
      ...prev,
      status: status === "all" ? null : status,
    }));
    setPage(1);
  };


  // Filter documents based on active filters
  const filteredDocuments = React.useMemo(() => {
    return (documents || []).filter((doc) => {
      if (filters.status) {
        // Rejected tab shows rejected and inactive documents (handles both "inactive" and "in_active")
        if (filters.status === "rejected") {
          const status = (doc.status || "").toLowerCase().replace(/_/g, "");
          if (status !== "rejected" && status !== "inactive") return false;
        } else if ((doc.status || "").toLowerCase() !== filters.status) {
          return false;
        }
      }
      if (filters.document_type && doc.document_type !== filters.document_type)
        return false;
      if (filters.entity_type && doc.entity_type !== filters.entity_type)
        return false;
      return true;
    });
  }, [documents, filters]);

  // Reset scroll state when filters or page change
  useEffect(() => {
    setIsScrolled(false);
  }, [filters, page]);

  // Handle auto-open upload modal if upload=true is in URL
  useEffect(() => {
    if (searchParams.get("upload") === "true") {
      setIsUploadModalOpen(true);
      // Clean up the URL after opening the modal
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.delete("upload");
      const queryString = newParams.toString();
      router.replace(
        `/organization/documents${queryString ? `?${queryString}` : ""}`,
      );
    }
  }, [searchParams, router]);

  return (
    <div className="flex flex-col h-full space-y-3 sm:space-y-4 animate-in fade-in duration-500 w-full overflow-x-hidden relative">
      {/* Header */}
      <div className="space-y-3 pb-2 border-b shrink-0">
        <div className="flex flex-row items-center justify-between gap-3">
          <div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-brand-primary">
              Documents
            </h2>
            <p className="hidden sm:block text-xs sm:text-sm text-muted-foreground">
              Upload and manage organization-related documents securely
            </p>
          </div>
        </div>
      </div>

      {/* Stats cards first */}
      <div className="shrink-0">
        <DocumentStatsCards documents={filteredDocuments} />
      </div>

      {/* Main Content - Search below cards, then full-width filter tabs, then Table/Cards */}
      <div className="flex-1 min-h-0 overflow-hidden shrink-0 flex flex-col">
        <DataTable
          columns={organizationDocumentColumns(
            handleViewDocument,
            handleEditDocument,
            handleDeleteDocument,
            deleteDocumentMutation.isPending,
            handleEntityClick,
          )}
          data={filteredDocuments as OrganizationDocumentTableRow[]}
          searchKey="document_type"
          searchPlaceholder="Search documents by type..."
          manualPagination={false}
          page={page}
          perPage={perPage}
          onPageChange={setPage}
          onPerPageChange={(newPerPage) => {
            setPerPage(newPerPage);
            setPage(1);
          }}
          onScrollChange={setIsScrolled}
          isScrolled={isScrolled}
          isLoading={documentsLoading}
          topSection={
            <div className="-mt-1">
              <DocumentStatusTabs
                current={filters.status ?? null}
                onSelect={handleStatusFilter}
                className="w-full"
              />
            </div>
          }
          headerActions={
            <div className="hidden sm:block">
              <Button
                onClick={() => setIsUploadModalOpen(true)}
                className="h-8 text-xs"
              >
                <Upload className="h-3.5 w-3.5 mr-1.5" />
                Upload Document
              </Button>
            </div>
          }
          mobileAddButton={null}
          renderMobileCard={(doc) => (
            <OrganizationDocumentMobileCard
              document={doc as OrganizationDocumentTableRow}
              onView={handleViewDocument}
              onEdit={handleEditDocument}
              onDelete={handleDeleteDocument}
              isDeleting={deleteDocumentMutation.isPending}
            />
          )}
        />
      </div>

      {/* FAB - Mobile only */}
      <div className="md:hidden fixed bottom-20 right-4 z-30">
        <Button
          size="icon"
          className="h-14 w-14 rounded-full bg-brand-primary hover:bg-brand-secondary text-white shadow-lg"
          onClick={() => setIsUploadModalOpen(true)}
        >
          <Upload className="h-6 w-6" />
        </Button>
      </div>

      {/* Upload Document Modal */}
      <UploadDocumentModal
        isOpen={isUploadModalOpen}
        onOpenChange={setIsUploadModalOpen}
        onUpload={handleUploadDocument}
        isUploading={uploadDocumentMutation.isPending}
      />

      {/* Edit Document Modal */}
      <EditDocumentModal
        isOpen={isEditModalOpen}
        onOpenChange={handleCloseEditModal}
        document={selectedDocument || null}
        onUpdate={handleUpdateDocument}
        isUpdating={updateDocumentMutation.isPending}
      />

      {/* Delete Document Modal */}
      <DeleteDocumentModal
        isOpen={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        document={
          documentToDelete
            ? documents?.find((doc) => doc.id === documentToDelete) || null
            : null
        }
        onDelete={handleConfirmDelete}
        isDeleting={deleteDocumentMutation.isPending}
      />
    </div>
  );
}
