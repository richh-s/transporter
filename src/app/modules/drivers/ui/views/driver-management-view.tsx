"use client";

import { toast } from "sonner";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  UserCheck,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Phone,
  Mail,
  ChevronLeft,
  ChevronRight,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

import { DriverDialog } from "../components/driver-dialog";
import { useDrivers } from "../../server/hooks/use-drivers";
import { useDeleteDriver } from "../../server/hooks/use-delete-driver";

import type { Driver } from "../../server/types";

// Stats Card Component
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
    <div className="p-3 rounded-xl bg-card border border-border/50 shadow-sm">
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

// Status Badge Component
function StatusBadge({ status }: { status: string }) {
  const isActive = status === "active";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase",
        isActive
          ? "bg-emerald-500/10 text-emerald-600"
          : "bg-gray-500/10 text-gray-500",
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          isActive ? "bg-emerald-500" : "bg-gray-400",
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

// Loading Skeleton
function DriverCardSkeleton() {
  return (
    <div className="p-4 rounded-xl bg-card border border-border/50 shadow-sm space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <div className="space-y-1.5 flex-1">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-5 w-14 rounded-full" />
      </div>
      <Skeleton className="h-px w-full" />
      <div className="grid grid-cols-2 gap-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-28" />
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
  const [filterOpen, setFilterOpen] = useState(false);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | "active" | "inactive">("all");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const listParams = useMemo(
    () => ({
      first_name: search || undefined,
      driver_license_number: search || undefined,
      phone_number: search || undefined,
      status: status === "all" ? undefined : status,
    }),
    [search, status],
  );

  const { data, isLoading } = useDrivers(listParams);
  const deleteDriver = useDeleteDriver();

  const drivers = data?.items ?? [];
  const totalDrivers = drivers.length;
  const activeDrivers = drivers.filter((d) => d.status === "active").length;

  // Pagination
  const totalPages = Math.ceil(drivers.length / pageSize);
  const paginatedDrivers = drivers.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );

  const clearFilters = () => {
    setSearch("");
    setStatus("all");
    setFilterOpen(false);
  };

  const hasActiveFilters = search || status !== "all";

  return (
    <div className="space-y-4 animate-in fade-in duration-300 pb-6 px-4">
      {/* Header */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <h1 className="text-lg font-bold">Driver Management</h1>
          <p className="text-xs text-muted-foreground">Manage your drivers</p>
        </div>
        <Button
          className="rounded-xl h-9 px-3"
          onClick={() => {
            setSelectedDriver(null);
            setOpen(true);
          }}
        >
          <Plus className="mr-1 h-4 w-4" />
          Add
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <StatsCard
          icon={Users}
          label="Total"
          value={totalDrivers}
          accent="bg-blue-500/10 text-blue-500"
          isLoading={isLoading}
        />
        <StatsCard
          icon={UserCheck}
          label="Active"
          value={activeDrivers}
          accent="bg-emerald-500/10 text-emerald-600"
          isLoading={isLoading}
        />
      </div>

      {/* Filter Button */}
      <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-between rounded-xl h-10",
              hasActiveFilters && "border-primary",
            )}
          >
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span>Filters</span>
              {hasActiveFilters && (
                <span className="px-1.5 py-0.5 text-[10px] bg-primary text-primary-foreground rounded-full">
                  Active
                </span>
              )}
            </div>
            <Search className="h-4 w-4 text-muted-foreground" />
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="rounded-t-2xl">
          <SheetHeader className="mb-4">
            <SheetTitle>Filter Drivers</SheetTitle>
          </SheetHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Search</label>
              <Input
                placeholder="Name, license, phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-11 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Status</label>
              <Select
                value={status}
                onValueChange={(v) => setStatus(v as typeof status)}
              >
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={clearFilters}
                className="flex-1 h-11 rounded-xl"
              >
                Clear
              </Button>
              <Button
                onClick={() => setFilterOpen(false)}
                className="flex-1 h-11 rounded-xl"
              >
                Apply
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Driver Cards */}
      <div className="space-y-3">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <DriverCardSkeleton key={i} />
          ))
        ) : paginatedDrivers.length === 0 ? (
          <div className="text-center py-12">
            <div className="p-4 rounded-full bg-muted/50 w-fit mx-auto mb-3">
              <Users className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">No drivers found</p>
            {hasActiveFilters && (
              <Button
                variant="link"
                size="sm"
                onClick={clearFilters}
                className="mt-2"
              >
                Clear filters
              </Button>
            )}
          </div>
        ) : (
          paginatedDrivers.map((driver) => (
            <DriverCard
              key={driver.id}
              driver={driver}
              onView={() => router.push(`/drivers/placeholder?id=${driver.id}`)}
              onEdit={() => {
                setSelectedDriver(driver);
                setOpen(true);
              }}
              onDelete={() => {
                setDriverToDelete(driver);
                setDeleteOpen(true);
              }}
            />
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-muted-foreground">
            {(page - 1) * pageSize + 1}–
            {Math.min(page * pageSize, totalDrivers)} of {totalDrivers}
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-lg"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-xs font-medium px-2">
              {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-lg"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Create / Edit Dialog */}
      <DriverDialog
        open={open}
        onOpenChange={(val: boolean | ((prevState: boolean) => boolean)) => {
          setOpen(val);
          if (!val) setSelectedDriver(null);
        }}
        driver={selectedDriver}
      />

      {/* Delete Dialog */}
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
                setDeleteOpen(false);
                setDriverToDelete(null);
                deleteDriver.mutate(driverToDelete.id, {
                  onSuccess: () => {
                    toast.success("Driver deleted successfully");
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
