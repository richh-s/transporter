import { useMutation, useQueryClient, type QueryKey } from "@tanstack/react-query";
import { toast } from "sonner";
import { driverApi } from "../api/driver.api";
import type { DriversResponse } from "../types";

type RollbackContext = {
  previous?: Array<[QueryKey, unknown]>;
};

export function useDeleteDriver() {
  const qc = useQueryClient();

  return useMutation<
    unknown,
    unknown,
    number,
    RollbackContext
  >({
    mutationFn: (id: number) => driverApi.deleteDriver(id),

    onMutate: async (id) => {
      await qc.cancelQueries({
        queryKey: ["drivers", "list"],
        exact: false,
      });

      const previous = qc.getQueriesData({
        queryKey: ["drivers", "list"],
      });

      // 🔥 OPTIMISTIC REMOVE
      qc.setQueriesData(
        { queryKey: ["drivers", "list"], exact: false },
        (old: DriversResponse | undefined) => {
          if (!old) return old;

          return {
            ...old,
            items: old.items.filter((d) => d.id !== id),
            total: Math.max(0, old.total - 1),
          };
        }
      );

      return { previous };
    },

    onSuccess: () => {
      toast.success("Driver deleted successfully");
    },
    onError: (err: unknown, _id, ctx) => {
      ctx?.previous?.forEach(([key, data]) => {
        qc.setQueryData(key, data);
      });
      toast.error((err as Error)?.message || "Failed to delete driver");
    },

    onSettled: () => {
      qc.invalidateQueries({
        queryKey: ["drivers", "list"],
        exact: false,
      });
    },
  });
}
