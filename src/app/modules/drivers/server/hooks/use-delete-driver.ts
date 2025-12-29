import { useMutation, useQueryClient } from "@tanstack/react-query";
import { driverApi } from "../api/driver.api";
import { driverKeys } from "../query-keys";

export function useDeleteDriver() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => driverApi.deleteDriver(id),

    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: driverKeys.all,
        exact: false,
      });
    },
  });
}
