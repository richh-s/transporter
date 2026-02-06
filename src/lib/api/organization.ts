import { request } from "@/lib/api-client";

export interface OrganizationDocument {
  id: number;
  document_type: string;
  file_path: string;
  presigned_url?: string; // Pre-signed URL when fetched via GET /{id}/get
  truck_id?: number | null;
  driver_id?: number | null;
  organization_id?: number;
  entity_type?: string;
  status?: string;
  deleted?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateOrganizationDocumentRequest {
  file: File;
  document_type: string;
}

export interface UpdateOrganizationDocumentRequest {
  document_type?: string;
  file?: File; // Optional file for overwrite
}

export interface OrganizationDocumentListResponse {
  items: OrganizationDocument[];
  total?: number;
}

export const organizationApi = {
  /**
   * Upload a document for the organization
   * POST /api/v1/organization/documents
   */
  uploadDocument: async (file: File, documentType: string) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("document_type", documentType);

    return request<OrganizationDocument>("/organization/documents", {
      method: "POST",
      body: formData,
    });
  },

  /**
   * List all documents for the organization
   * GET /api/v1/organization/documents/list
   */
  listDocuments: async () => {
    const response = await request<OrganizationDocument[] | { items: OrganizationDocument[] }>("/organization/documents/list");

    if (response.data) {
      // API might return array directly or wrapped in object
      const items = Array.isArray(response.data) ? response.data : response.data.items || [];
      return { ...response, data: items as OrganizationDocument[] };
    }

    return response as any;
  },

  /**
   * Get a document with pre-signed URL
   * GET /api/v1/organization/documents/{document_id}/get
   */
  getDocument: async (documentId: string | number) => {
    return request<OrganizationDocument>(`/organization/documents/${documentId}/get`);
  },

  /**
   * Update document metadata (and optionally overwrite file)
   * PATCH /api/v1/organization/documents/{document_id}/update
   */
  updateDocument: async (
    documentId: string | number,
    data: UpdateOrganizationDocumentRequest,
  ) => {
    const formData = new FormData();

    if (data.document_type) {
      formData.append("document_type", data.document_type);
    }
    if (data.file) {
      formData.append("file", data.file);
    }

    return request<OrganizationDocument>(
      `/organization/documents/${documentId}/update`,
      {
        method: "PATCH",
        body: formData,
      }
    );
  },

  /**
   * Delete a document
   * DELETE /api/v1/organization/documents/{document_id}/delete
   */
  deleteDocument: async (documentId: string | number) => {
    return request<{ success: boolean }>(
      `/organization/documents/${documentId}/delete`,
      {
        method: "DELETE"
      }
    );
  },
};
