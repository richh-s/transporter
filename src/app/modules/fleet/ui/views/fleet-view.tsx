"use client";

import { useState, useTransition } from "react";
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
  // Pagination state
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(5);

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

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]  space-y-6 animate-in fade-in duration-500 w-full overflow-x-hidden overflow-y-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-brand-primary">
            Fleet Management
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Manage your trucks and fleet capacity.
          </p>
        </div>
      </div>

      {/* Stats Cards - Will be updated when data loads */}
      <FleetStatsCardsWrapper page={page} perPage={perPage} filters={filters} />

      {/* Add Truck Button - Mobile only */}
      <div className="block sm:hidden">
        <AddTruckModal onSuccess={handleSuccess} />
      </div>

      {/* Success/Error Alerts */}
      {(createTruckMutation.error ||
        updateTruckMutation.error ||
        deleteTruckMutation.error) && (
        <Alert variant="destructive" className="bg-red-50 border-red-100">
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
        <Alert className="bg-green-50 border-green-100 text-green-700">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Main Content - Table with Suspense */}
      <TrucksTable
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
      />

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
