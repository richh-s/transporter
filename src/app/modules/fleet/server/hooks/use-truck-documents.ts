import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { truckApi, type TruckDocument } from "@/lib/api/trucks";
import { ApiError } from "./use-create-truck";

export function useTruckDocuments(truckId: string) {
  return useQuery({
    queryKey: ["truck-documents", truckId],
    queryFn: async () => {
      const response = await truckApi.getDocuments(truckId);
      if (!response.data) {
        throw new Error(response.error || "Failed to fetch documents");
      }
      // API returns an array of TruckDocument objects
      return response.data as TruckDocument[];
    },
    enabled: !!truckId,
  });
}

export function useUploadTruckDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      truckId,
      file,
      documentType,
    }: {
      truckId: string;
      file: File;
      documentType: string;
    }) => {
      const response = await truckApi.uploadDocument(
        truckId,
        file,
        documentType,
      );
      if (!response.data) {
        throw new ApiError(
          response.error || "Failed to upload document",
          response.status || 500,
        );
      }
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["truck-documents", variables.truckId],
      });
    },
  });
}

export function useUpdateTruckDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      truckId,
      documentId,
      updateData,
    }: {
      truckId: string;
      documentId: string;
      updateData: { document_type?: string; file?: File };
    }) => {
      const response = await truckApi.updateDocument(
        truckId,
        documentId,
        updateData,
      );
      if (!response.data) {
        throw new ApiError(
          response.error || "Failed to update document",
          response.status || 500,
        );
      }
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["truck-documents", variables.truckId],
      });
    },
  });
}

export function useDeleteTruckDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      truckId,
      documentId,
    }: {
      truckId: string;
      documentId: string;
    }) => {
      const response = await truckApi.deleteDocument(truckId, documentId);
      if (!response.data) {
        throw new Error(response.error || "Failed to delete document");
      }
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["truck-documents", variables.truckId],
      });
    },
  });
}
