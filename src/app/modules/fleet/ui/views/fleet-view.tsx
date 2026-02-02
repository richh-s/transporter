"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Truck as TruckType } from "@/lib/api/trucks";
import {
  useCreateTruck,
  useUpdateTruck,
  useDeleteTruck,
} from "@/app/modules/fleet/server/hooks";
import {
  FleetStatsCardsWrapper,
  FleetFilterControls,
  AddTruckModal,
  EditTruckModal,
  DeleteTruckModal,
  TrucksTable,
} from "../components";
import { useQueryClient } from "@tanstack/react-query";

export const FleetView = () => {
  const router = useRouter();
  // Pagination state - Use 10 for mobile, 5 for desktop
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  // Filter state
  const [filters, setFilters] = useState<{
    status?: "active" | "inactive" | "maintenance" | "out_of_service" | null;
    truck_type?: "flatbed" | "trailer" | null;
    vin?: string | null;
    plate_number?: string | null;
    make?: string | null;
    model?: string | null;
  }>({});

  const queryClient = useQueryClient();

  const createTruckMutation = useCreateTruck();
  const updateTruckMutation = useUpdateTruck();
  const deleteTruckMutation = useDeleteTruck();

  // UI State
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedTruck, setSelectedTruck] = useState<TruckType | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [pageCount, setPageCount] = useState(0);

  // Filter handlers
  const handleStatusFilter = (
    status:
      | "active"
      | "inactive"
      | "maintenance"
      | "out_of_service"
      | "all"
      | null
  ) => {
    setFilters((prev) => ({
      ...prev,
      status: status === "all" ? null : status,
    }));
    setPage(1);
  };

  const handleTypeFilter = (type: "flatbed" | "trailer" | "all" | null) => {
    setFilters((prev) => ({
      ...prev,
      truck_type: type === "all" ? null : type,
    }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({});
    setPage(1);
  };

  const handleEditClick = (truck: TruckType) => {
    setSelectedTruck(truck);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (truck: TruckType) => {
    setSelectedTruck(truck);
    setIsDeleteModalOpen(true);
  };

  const handleSuccess = () => {
    setSuccess("Operation completed successfully!");
    // Invalidate and refetch trucks data
    queryClient.invalidateQueries({ queryKey: ["trucks"] });
    setTimeout(() => setSuccess(null), 3000);
  };



  // Reset scroll state when page or filters change
  useEffect(() => {
    setIsScrolled(false);
  }, [page, filters]);

  return (
    <div className="flex flex-col min-h-full space-y-6 animate-in fade-in duration-500 w-full overflow-x-hidden pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-brand-primary">
            Fleet Management
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Manage your trucks and fleet capacity.
          </p>
        </div>
      </div>

      {/* Stats Cards - Will be updated when data loads - Hide on mobile when scrolled or on last page */}
      <div
        className={`shrink-0 transition-all duration-300 md:block ${isScrolled || (pageCount > 0 && page === pageCount)
          ? "hidden md:block"
          : "block"
          }`}
      >
        <FleetStatsCardsWrapper
          page={page}
          perPage={perPage}
          filters={filters}
        />
      </div>

      {/* Add Truck Button - Mobile only - Hide when scrolled or on last page */}
      <div
        className={`block sm:hidden shrink-0 transition-all duration-300 ${isScrolled || (pageCount > 0 && page === pageCount)
          ? "hidden"
          : "block"
          }`}
      >
        <AddTruckModal onSuccess={handleSuccess} />
      </div>

      {/* Success/Error Alerts */}
      {((createTruckMutation.error as Error | null) ||
        (updateTruckMutation.error as Error | null) ||
        (deleteTruckMutation.error as Error | null)) && (
          <Alert
            variant="destructive"
            className="bg-red-50 border-red-100 shrink-0"
          >
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              {createTruckMutation.error instanceof Error
                ? createTruckMutation.error.message
                : updateTruckMutation.error instanceof Error
                  ? updateTruckMutation.error.message
                  : deleteTruckMutation.error instanceof Error
                    ? deleteTruckMutation.error.message
                    : "An error occurred"}
            </AlertDescription>
          </Alert>
        )}
      {success && (
        <Alert className="bg-green-50 border-green-100 text-green-700 shrink-0">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Main Content - Table with Suspense - Takes remaining space */}
      <div className="flex-1 min-h-0 shrink-0">
        <TrucksTable
          onRowClick={(truck) => router.push(`/fleet/${truck.id}`)}
          page={page}
          perPage={perPage}
          filters={filters}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
          onPageChange={(newPage) => setPage(newPage)}
          onSearchChange={(search) => {
            setFilters((prev) => ({
              ...prev,
              plate_number: search || null,
            }));
            setPage(1);
          }}
          onPerPageChange={(newPerPage) => {
            setPerPage(newPerPage);
            setPage(1);
          }}
          onScrollChange={setIsScrolled}
          isScrolled={isScrolled}
          onPageCountChange={setPageCount}
          filterControls={
            <FleetFilterControls
              filters={filters}
              onStatusFilter={handleStatusFilter}
              onTypeFilter={handleTypeFilter}
              onClearFilters={clearFilters}
            />
          }
          headerActions={
            <div className="hidden sm:block">
              <AddTruckModal onSuccess={handleSuccess} />
            </div>
          }
          mobileAddButton={
            <AddTruckModal onSuccess={handleSuccess} variant="icon-only" />
          }
        />
      </div>

      {/* Edit Modal */}
      <EditTruckModal
        truck={selectedTruck}
        isOpen={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        onSuccess={handleSuccess}
      />

      {/* Delete Modal */}
      <DeleteTruckModal
        truck={selectedTruck}
        isOpen={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        onSuccess={handleSuccess}
      />
    </div>
  );
};
