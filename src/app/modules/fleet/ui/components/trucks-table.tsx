"use client";

import { Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { truckColumns, type TruckTableRow } from "../columns/truck-columns";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  truckApi,
  type GetTrucksParams,
  type PaginatedTrucksResponse,
} from "@/lib/api/trucks";
import type { Truck } from "@/lib/api/trucks";

interface TrucksTableProps {
  page: number;
  perPage: number;
  filters: {
    status?: "active" | "inactive" | "maintenance" | "out_of_service" | null;
    truck_type?: "flatbed" | "trailer" | null;
    vin?: string | null;
    plate_number?: string | null;
    make?: string | null;
    model?: string | null;
  };
  onEdit: (truck: Truck) => void;
  onDelete: (truck: Truck) => void;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
  onSearchChange: (search: string) => void;
  onScrollChange?: (isScrolled: boolean) => void;
  isScrolled?: boolean;
  onPageCountChange?: (pageCount: number) => void;
  filterControls: React.ReactNode;
  headerActions?: React.ReactNode;
  mobileAddButton?: React.ReactNode;
}

function TrucksTableContent({
  page,
  perPage,
  filters,
  onEdit,
  onDelete,
  onPageChange,
  onPerPageChange,
  onSearchChange,
  onScrollChange,
  isScrolled,
  onPageCountChange,
  filterControls,
  headerActions,
  mobileAddButton,
}: TrucksTableProps) {
  const router = useRouter();
  const { data: trucksData } = useSuspenseQuery({
    queryKey: ["trucks", { page, per_page: perPage, ...filters }],
    queryFn: async () => {
      const params: GetTrucksParams = {
        page,
        per_page: perPage,
        ...filters,
      };

      const response = await truckApi.getTrucks(params);

      if (!response.data) {
        const errorMessage = response.error || "Failed to fetch trucks";
        const statusMessage = response.status
          ? ` (Status: ${response.status})`
          : "";
        console.error("❌ Failed to fetch trucks:", {
          error: errorMessage,
          status: response.status,
          params,
        });
        throw new Error(`${errorMessage}${statusMessage}`);
      }

      const data = response.data;

      if (
        data &&
        typeof data === "object" &&
        "items" in data &&
        "total" in data &&
        "page" in data &&
        "status" in data
      ) {
        const paginatedData = data as PaginatedTrucksResponse;

        if (!paginatedData.status) {
          throw new Error(paginatedData.message || "Failed to fetch trucks");
        }

        return {
          trucks: paginatedData.items || [],
          total: paginatedData.total || 0,
          page: paginatedData.page || 1,
          per_page: paginatedData.per_page || perPage,
          pages: paginatedData.pages || 1,
        };
      }

      if (Array.isArray(data)) {
        const trucksArray = data as Truck[];
        return {
          trucks: trucksArray,
          total: trucksArray.length,
          page: 1,
          per_page: trucksArray.length,
          pages: 1,
        };
      }

      return {
        trucks: [],
        total: 0,
        page: 1,
        per_page: perPage,
        pages: 0,
      };
    },
    staleTime: 1000 * 60 * 5,
  });

  const trucks = trucksData?.trucks || [];
  const total = trucksData?.total || 0;
  const totalPages = trucksData?.pages || 0;

  useEffect(() => {
    if (onPageCountChange) {
      onPageCountChange(totalPages);
    }
  }, [totalPages, onPageCountChange]);

  return (
    <DataTable
      columns={truckColumns}
      data={trucks as TruckTableRow[]}
      searchKey="plate_number"
      searchPlaceholder="Search plate, VIN, or make..."
      onRowClick={(row) => router.push(`/fleet/placeholder?id=${row.id}`)}
      meta={{
        onEdit,
        onDelete,
      }}
      // Server-side pagination
      manualPagination={true}
      page={page}
      pageCount={totalPages}
      total={total}
      perPage={perPage}
      onPageChange={onPageChange}
      onSearchChange={onSearchChange}
      onPerPageChange={onPerPageChange}
      onScrollChange={onScrollChange}
      isScrolled={isScrolled}
      filterControls={filterControls}
      headerActions={headerActions}
      mobileAddButton={mobileAddButton}
    />
  );
}

function TrucksTableLoading() {
  return (
    <div className="flex items-center justify-center h-32 gap-2 text-muted-foreground">
      <Loader2 className="h-5 w-5 animate-spin" />
      <span className="text-sm">Loading fleet data...</span>
    </div>
  );
}

export function TrucksTable(props: TrucksTableProps) {
  return (
    <Suspense fallback={<TrucksTableLoading />}>
      <TrucksTableContent {...props} />
    </Suspense>
  );
}
