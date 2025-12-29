import { useMutation, useQueryClient } from "@tanstack/react-query";
import { driverApi } from "../api/driver.api";
import { driverKeys } from "../query-keys";
import type { UpdateDriverPayload } from "../types";

export function useUpdateDriver(driverId: number) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateDriverPayload) =>
      driverApi.updateDriver(driverId, payload),

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: driverKeys.all, exact: false });
      qc.invalidateQueries({ queryKey: driverKeys.detail(driverId) });
    },
  });
}
