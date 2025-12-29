import { useMutation, useQueryClient } from "@tanstack/react-query";
import { driverApi } from "../api/driver.api";
import { driverKeys } from "../query-keys";

type DeleteDriverDocumentInput = {
  driverId: number;
  documentId: number;
};

export function useDeleteDriverDocument() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ driverId, documentId }: DeleteDriverDocumentInput) =>
      driverApi.deleteDriverDocument(driverId, documentId),

    onSuccess: (_, { driverId }) => {
      qc.invalidateQueries({
        queryKey: driverKeys.documents(driverId),
      });
      qc.invalidateQueries({
        queryKey: driverKeys.detail(driverId),
      });
    },
  });
}
