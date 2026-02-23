"use client";

import { Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/ui/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { truckColumns, type TruckTableRow } from "../columns/truck-columns";
import { TruckCard } from "./truck-card";
import { useSuspenseQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
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
  onRowClick?: (truck: Truck) => void;
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
  onRowClick,
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
      onRowClick={
        onRowClick || ((row) => router.push(`/fleet/placeholder?id=${row.id}`))
      }
      meta={{
        onEdit,
        onDelete,
      }}
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
      variant="clean"
      hideColumnVisibility
      renderMobileCard={(truck) => (
        <TruckCard
          truck={truck}
          onClick={() => router.push(`/fleet/placeholder?id=${truck.id}`)}
        />
      )}
    />
  );
}

function TableLoadingSkeleton() {
  const rows = 8;
  const cols = 5;
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="p-4 border-b border-border flex items-center justify-between gap-4">
        <Skeleton className="h-9 w-48 sm:w-64" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-9" />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              {[...Array(cols)].map((_, i) => (
                <th key={i} className="px-4 py-3 text-left">
                  <Skeleton className="h-4 w-16 sm:w-24" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {[...Array(rows)].map((_, rowIdx) => (
              <tr key={rowIdx}>
                {[...Array(cols)].map((_, colIdx) => (
                  <td key={colIdx} className="px-4 py-3">
                    <Skeleton
                      className={cn(
                        "h-4",
                        colIdx === 0 ? "w-20 sm:w-28" : "w-16 sm:w-24",
                      )}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function TrucksTable(props: TrucksTableProps) {
  return (
    <Suspense fallback={<TableLoadingSkeleton />}>
      <TrucksTableContent {...props} />
    </Suspense>
  );
}
