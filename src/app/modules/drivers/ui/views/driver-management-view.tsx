"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  UserCheck,
  Plus,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Phone,
  Mail,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTable } from "@/components/ui/data-table";
import { cn } from "@/lib/utils";

import { DriverDialog } from "../components/driver-dialog";
import { useDrivers } from "../../server/hooks/use-drivers";
import { useDeleteDriver } from "../../server/hooks/use-delete-driver";
import { driverColumns } from "../columns/driver-columns";

import type { Driver } from "../../server/types";

// Stats Card (scrollable on mobile, equal gap)
function StatsCard({
  icon: Icon,
  label,
  value,
  accent,
  isLoading,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  accent: string;
  isLoading?: boolean;
}) {
  return (
    <div className="p-3 sm:p-4 rounded-xl bg-card border border-border/50 shadow-sm h-full">
      <div className="flex items-center gap-3">
        <div className={cn("p-2 rounded-lg", accent)}>
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
            {label}
          </p>
          {isLoading ? (
            <Skeleton className="h-6 w-12 mt-0.5" />
          ) : (
            <p className="text-lg font-bold">{value}</p>
          )}
        </div>
      </div>
    </div>
  );
}

// Table loading skeleton (desktop, same as ships/fleet)
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

// Status Badge Component
function StatusBadge({ status }: { status: string }) {
  const isActive = status === "active";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase",
        isActive
          ? "bg-primary/10 text-primary"
          : "bg-gray-500/10 text-gray-500",
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          isActive ? "bg-primary" : "bg-gray-400",
        )}
      />
      {status}
    </span>
  );
}

// Driver Card Component
function DriverCard({
  driver,
  onView,
  onEdit,
  onDelete,
}: {
  driver: Driver;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className="p-4 rounded-xl bg-card border border-border/50 shadow-sm cursor-pointer active:scale-[0.99] transition-transform"
      onClick={onView}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="p-2.5 rounded-xl bg-primary/10 shrink-0">
            <User className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-sm truncate">
              {driver.first_name} {driver.last_name}
            </h3>
            <p className="text-xs text-muted-foreground truncate">
              {driver.driver_license_number}
            </p>
          </div>
        </div>
        <div
          className="flex items-center gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          <StatusBadge status={driver.status} />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 rounded-xl">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onView();
                }}
                className="rounded-lg"
              >
                <Eye className="mr-2 h-4 w-4" />
                View
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="rounded-lg"
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="rounded-lg text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-border/50 grid grid-cols-2 gap-2">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Phone className="h-3 w-3" />
          <span className="truncate">{driver.phone_number || "—"}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Mail className="h-3 w-3" />
          <span className="truncate">{driver.email || "—"}</span>
        </div>
      </div>
    </div>
  );
}

export function DriverManagementView() {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [driverToDelete, setDriverToDelete] = useState<Driver | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "suspended"
  >("all");
  const [page, setPage] = useState(1);
  const perPage = 10;

  const listParams = useMemo(
    () => ({
      first_name: search || undefined,
      status: statusFilter === "all" ? undefined : statusFilter,
      page,
      per_page: perPage,
    }),
    [search, statusFilter, page, perPage],
  );

  const { data, isLoading } = useDrivers(listParams);
  const deleteDriver = useDeleteDriver();

  const drivers = data?.items ?? [];
  const totalDrivers = data?.total ?? 0;
  const totalPages =
    data?.pages ?? Math.max(1, Math.ceil(totalDrivers / perPage));
  const activeCount =
    statusFilter === "active"
      ? totalDrivers
      : drivers.filter((d) => d.status === "active").length;

  const handleView = useCallback(
    (driver: Driver) => router.push(`/drivers/placeholder?id=${driver.id}`),
    [router],
  );
  const handleEdit = useCallback((driver: Driver) => {
    setSelectedDriver(driver);
    setOpen(true);
  }, []);
  const handleDelete = useCallback((driver: Driver) => {
    setDriverToDelete(driver);
    setDeleteOpen(true);
  }, []);

  const columns = useMemo(
    () =>
      driverColumns({
        onView: handleView,
        onEdit: handleEdit,
        onDelete: handleDelete,
      }),
    [handleView, handleEdit, handleDelete],
  );

  return (
    <div className="flex flex-col h-full space-y-4 sm:space-y-6 animate-in fade-in duration-300 pb-10 sm:pb-6 w-full overflow-x-hidden">
      {/* Header - same as ships/fleet */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 shrink-0 px-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Driver Management
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Manage your drivers
          </p>
        </div>
        <Button
          className="rounded-xl h-9 px-3 shrink-0"
          onClick={() => {
            setSelectedDriver(null);
            setOpen(true);
          }}
        >
          <Plus className="mr-1 h-4 w-4" />
          Add
        </Button>
      </div>

      {/* Stats - scrollable on mobile, equal gap (same as ships/fleet) */}
      <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 sm:overflow-visible shrink-0">
        <div className="flex sm:grid sm:grid-cols-2 gap-3 sm:gap-4 min-w-0 sm:min-w-full pr-4 sm:pr-0">
          <div className="shrink-0 w-[72%] min-w-[160px] sm:w-auto sm:min-w-0">
            <StatsCard
              icon={Users}
              label="Total"
              value={totalDrivers}
              accent="bg-primary/10 text-primary"
              isLoading={isLoading}
            />
          </div>
          <div className="shrink-0 w-[72%] min-w-[160px] sm:w-auto sm:min-w-0">
            <StatsCard
              icon={UserCheck}
              label="Active"
              value={activeCount}
              accent="bg-primary/10 text-primary"
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>

      {/* Table - desktop same as ships/fleet; mobile = cards via renderMobileCard */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {isLoading ? (
          <TableLoadingSkeleton />
        ) : (
          <DataTable
            columns={columns}
            data={drivers}
            searchKey="first_name"
            searchPlaceholder="Search name or license..."
            onRowClick={(row) => handleView(row)}
            manualPagination
            page={page}
            pageCount={totalPages}
            perPage={perPage}
            onPageChange={setPage}
            onSearchChange={setSearch}
            manualFiltering
            filterControls={
              <Select
                value={statusFilter}
                onValueChange={(v) => {
                  setStatusFilter(v as typeof statusFilter);
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-9 w-[130px] sm:w-[150px] bg-background text-xs sm:text-sm">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            }
            variant="clean"
            hideColumnVisibility
            renderMobileCard={(driver) => (
              <DriverCard
                driver={driver}
                onView={() => handleView(driver)}
                onEdit={() => handleEdit(driver)}
                onDelete={() => handleDelete(driver)}
              />
            )}
          />
        )}
      </div>

      {/* Create / Edit Dialog */}
      <DriverDialog
        open={open}
        onOpenChange={(val: boolean | ((prevState: boolean) => boolean)) => {
          setOpen(val);
          if (!val) setSelectedDriver(null);
        }}
        driver={selectedDriver}
      />

      <Dialog
        open={deleteOpen}
        onOpenChange={(val) => {
          setDeleteOpen(val);
          if (!val) setDriverToDelete(null);
        }}
      >
        <DialogContent className="max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle>Delete Driver</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-semibold">
                {driverToDelete?.first_name} {driverToDelete?.last_name}
              </span>
              ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteOpen(false);
                setDriverToDelete(null);
              }}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={!driverToDelete || deleteDriver.isPending}
              onClick={() => {
                if (!driverToDelete) return;
                deleteDriver.mutate(driverToDelete.id, {
                  onSuccess: () => {
                    setDeleteOpen(false);
                    setDriverToDelete(null);
                  },
                });
              }}
              className="rounded-xl"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
