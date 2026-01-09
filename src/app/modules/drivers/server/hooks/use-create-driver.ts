import { useMutation, useQueryClient } from "@tanstack/react-query";
import { driverApi } from "../api/driver.api";
import { driverKeys } from "../query-keys";


export function useCreateDriver() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: driverApi.createDriver,

    onMutate: async (newDriver) => {
      await qc.cancelQueries({ queryKey: driverKeys.all });

      const previous = qc.getQueriesData({ queryKey: driverKeys.list({}) });

      qc.setQueriesData(
        { queryKey: driverKeys.list({}), exact: false },
        (old: any) => {
          if (!old) return old;
          return {
            ...old,
            items: [{ id: Date.now(), ...newDriver }, ...old.items],
            total: old.total + 1,
          };
        }
      );

      return { previous };
    },

    onError: (_, __, ctx) => {
      ctx?.previous?.forEach(([key, data]) => {
        qc.setQueryData(key, data);
      });
    },

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: driverKeys.all });
    },
  });
}

