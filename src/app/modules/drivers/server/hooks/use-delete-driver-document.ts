import { useMutation, useQueryClient } from "@tanstack/react-query";
import { driverApi } from "../api/driver.api";
import { driverKeys } from "../query-keys";
import type { DriverDocument } from "../types";

type DeleteDriverDocumentInput = {
  driverId: number;
  documentId: number;
};

type RollbackContext = {
  previous?: DriverDocument[];
};

export function useDeleteDriverDocument() {
  const qc = useQueryClient();

  return useMutation<
    unknown,
    unknown,
    DeleteDriverDocumentInput,
    RollbackContext
  >({
    mutationFn: ({ driverId, documentId }) =>
      driverApi.deleteDriverDocument(driverId, documentId),

    onMutate: async ({ driverId, documentId }) => {
      await qc.cancelQueries({
        queryKey: driverKeys.documents(driverId),
      });

      const previous = qc.getQueryData<DriverDocument[]>(
        driverKeys.documents(driverId)
      );

      // 🔥 OPTIMISTIC REMOVE
      qc.setQueryData<DriverDocument[]>(
        driverKeys.documents(driverId),
        (old = []) => old.filter((doc) => doc.id !== documentId)
      );

      return { previous };
    },

    onError: (_err, vars, ctx) => {
      if (ctx?.previous) {
        qc.setQueryData(
          driverKeys.documents(vars.driverId),
          ctx.previous
        );
      }
    },

    onSettled: (_d, _e, vars) => {
      qc.invalidateQueries({
        queryKey: driverKeys.documents(vars.driverId),
      });

      qc.invalidateQueries({
        queryKey: driverKeys.detail(vars.driverId),
      });
    },
  });
}
