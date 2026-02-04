"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  MoreHorizontal,
  Satellite,
  CheckCircle,
  XCircle,
  Filter,
  Eye,
  Pencil,
  Power,
  Truck,
  ChevronRight,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import type { GPSDeviceFilters, GPSDevice } from "@/types/gps-device";
import { format } from "date-fns";
import {
  useGPSDevices,
  useDeactivateGPSDevice,
  useUpdateGPSDevice,
} from "@/hooks/use-gps-devices";
import { useTrucks } from "@/hooks/use-trucks";
import { cn } from "@/lib/utils";

// Stats Card Component
function StatsCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  value: number | string;
  accent: string;
}) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/50 shadow-sm">
      <div className={cn("p-2 rounded-lg", accent)}>
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-lg font-bold text-foreground">{value}</p>
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
          {label}
        </p>
      </div>
    </div>
  );
}

// Status Badge Component
function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold",
        active
          ? "bg-emerald-500/10 text-emerald-600"
          : "bg-gray-500/10 text-gray-600",
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          active ? "bg-emerald-500" : "bg-gray-400",
        )}
      />
      {active ? "Active" : "Inactive"}
    </span>
  );
}

// Device Card Component
function DeviceCard({
  device,
  isAssigned,
  onView,
  onEdit,
  onDeactivate,
  onStatusChange,
  isUpdating,
}: {
  device: GPSDevice;
  isAssigned: boolean;
  onView: () => void;
  onEdit: () => void;
  onDeactivate: () => void;
  onStatusChange: (status: boolean) => void;
  isUpdating: boolean;
}) {
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch {
      return dateString;
    }
  };

  return (
    <div
      className="p-4 rounded-xl bg-card border border-border/50 shadow-sm space-y-3 active:scale-[0.99] transition-transform"
      onClick={onView}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <Satellite className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-bold">{device.external_device_id}</p>
            <p className="text-[10px] text-muted-foreground font-mono">
              IMEI: {device.imei_number}
            </p>
          </div>
        </div>
        <div onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
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
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              {device.status && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeactivate();
                  }}
                  className="text-destructive rounded-lg"
                >
                  <Power className="mr-2 h-4 w-4" />
                  Deactivate
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Info Row */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        {device.device_name && (
          <span className="truncate max-w-[120px]">{device.device_name}</span>
        )}
        {device.device_model && (
          <span className="truncate max-w-[100px]">{device.device_model}</span>
        )}
      </div>

      {/* Details Row */}
      <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
        <div className="flex items-center gap-1.5 text-xs">
          <Truck className="h-3.5 w-3.5 text-muted-foreground" />
          <span
            className={
              isAssigned
                ? "text-emerald-600 font-medium"
                : "text-muted-foreground"
            }
          >
            {isAssigned ? "Assigned" : "Unassigned"}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          <span>Exp: {formatDate(device.expire_date)}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-border/50">
        <div
          className="flex items-center gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          <Switch
            checked={device.status}
            onCheckedChange={onStatusChange}
            disabled={isUpdating}
            className="scale-75"
          />
          <StatusBadge active={device.status} />
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </div>
    </div>
  );
}

// Loading Skeleton
function DeviceCardSkeleton() {
  return (
    <div className="p-4 rounded-xl bg-card border border-border/50 shadow-sm space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-9 rounded-lg" />
          <div className="space-y-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
      <Skeleton className="h-8 w-full rounded-lg" />
      <div className="flex items-center justify-between pt-2 border-t">
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="h-4 w-4" />
      </div>
    </div>
  );
}

export default function GPSDevicesPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [perPage] = useState(20);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);

  // Filters
  const [filters, setFilters] = useState<GPSDeviceFilters>({
    external_device_id: "",
    imei_number: "",
    device_name: "",
    device_model: "",
    status: undefined,
  });
  const [appliedFilters, setAppliedFilters] = useState<GPSDeviceFilters>({});

  const { data: devicesResponse, isLoading } = useGPSDevices(
    page,
    perPage,
    appliedFilters,
  );
  const deactivateMutation = useDeactivateGPSDevice();
  const updateMutation = useUpdateGPSDevice();
  const { data: trucks = [] } = useTrucks();

  const devices = devicesResponse?.items || [];
  const total = devicesResponse?.total || 0;
  const pages = devicesResponse?.pages || 0;

  // Create mapping object: { [gps_device_id]: truck_id }
  const gpsDeviceToTruckMap = useMemo(() => {
    const map: Record<number, number> = {};
    trucks.forEach((truck) => {
      if (truck.gps_device_id !== null && truck.gps_device_id !== undefined) {
        map[truck.gps_device_id] = truck.id;
      }
    });
    return map;
  }, [trucks]);

  // Calculate stats
  const activeCount = devices.filter((d) => d.status).length;
  const inactiveCount = devices.filter((d) => !d.status).length;
  const assignedCount = devices.filter((d) => gpsDeviceToTruckMap[d.id]).length;

  const handleApplyFilters = () => {
    setAppliedFilters(filters);
    setPage(1);
    setFilterSheetOpen(false);
  };

  const handleClearFilters = () => {
    const emptyFilters: GPSDeviceFilters = {
      external_device_id: "",
      imei_number: "",
      device_name: "",
      device_model: "",
      status: undefined,
    };
    setFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
    setPage(1);
  };

  const handleDeactivate = (id: number) => {
    if (!confirm("Are you sure you want to deactivate this GPS device?"))
      return;
    deactivateMutation.mutate(id);
  };

  const handleStatusChange = (device: GPSDevice, newStatus: boolean) => {
    updateMutation.mutate({ id: device.id, data: { status: newStatus } });
  };

  const getPaginationPages = () => {
    if (pages <= 5) return Array.from({ length: pages }, (_, i) => i + 1);
    const pagesToShow: (number | string)[] = [1];
    if (page > 3) pagesToShow.push("...");
    const start = Math.max(2, page - 1);
    const end = Math.min(pages - 1, page + 1);
    for (let i = start; i <= end; i++) pagesToShow.push(i);
    if (page < pages - 2) pagesToShow.push("...");
    if (pages > 1) pagesToShow.push(pages);
    return pagesToShow;
  };

  const hasActiveFilters = Object.values(appliedFilters).some(
    (v) => v !== undefined && v !== "",
  );

  return (
    <div className="space-y-4 animate-in fade-in duration-300 pb-6 px-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">GPS Devices</h1>
          <p className="text-xs text-muted-foreground">{total} total devices</p>
        </div>
        <Button
          onClick={() => router.push("/gps-devices/create")}
          size="sm"
          className="rounded-xl h-9 gap-1.5"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">New Device</span>
          <span className="sm:hidden">New</span>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatsCard
          icon={Satellite}
          label="Total"
          value={total}
          accent="bg-primary/10 text-primary"
        />
        <StatsCard
          icon={CheckCircle}
          label="Active"
          value={activeCount}
          accent="bg-emerald-500/10 text-emerald-600"
        />
        <StatsCard
          icon={XCircle}
          label="Inactive"
          value={inactiveCount}
          accent="bg-gray-500/10 text-gray-600"
        />
        <StatsCard
          icon={Truck}
          label="Assigned"
          value={assignedCount}
          accent="bg-blue-500/10 text-blue-600"
        />
      </div>

      {/* Filter Button */}
      <div className="flex items-center gap-2">
        <Sheet open={filterSheetOpen} onOpenChange={setFilterSheetOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "rounded-xl h-9 gap-2",
                hasActiveFilters && "border-primary text-primary",
              )}
            >
              <Filter className="h-4 w-4" />
              Filters
              {hasActiveFilters && (
                <span className="h-5 w-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                  {
                    Object.values(appliedFilters).filter(
                      (v) => v !== undefined && v !== "",
                    ).length
                  }
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-3xl">
            <SheetHeader className="pb-4">
              <SheetTitle>Filter Devices</SheetTitle>
            </SheetHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    External ID
                  </label>
                  <Input
                    placeholder="Search..."
                    value={filters.external_device_id || ""}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        external_device_id: e.target.value,
                      })
                    }
                    className="h-10 rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    IMEI
                  </label>
                  <Input
                    placeholder="Search..."
                    value={filters.imei_number || ""}
                    onChange={(e) =>
                      setFilters({ ...filters, imei_number: e.target.value })
                    }
                    className="h-10 rounded-xl"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Device Name
                  </label>
                  <Input
                    placeholder="Search..."
                    value={filters.device_name || ""}
                    onChange={(e) =>
                      setFilters({ ...filters, device_name: e.target.value })
                    }
                    className="h-10 rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Status
                  </label>
                  <Select
                    value={
                      filters.status === undefined
                        ? "all"
                        : filters.status
                          ? "active"
                          : "inactive"
                    }
                    onValueChange={(value) =>
                      setFilters({
                        ...filters,
                        status:
                          value === "all" ? undefined : value === "active",
                      })
                    }
                  >
                    <SelectTrigger className="h-10 rounded-xl">
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={handleClearFilters}
                  className="flex-1 rounded-xl"
                >
                  Clear
                </Button>
                <Button
                  onClick={handleApplyFilters}
                  className="flex-1 rounded-xl"
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="text-xs text-muted-foreground"
          >
            Clear all
          </Button>
        )}
      </div>

      {/* Device Cards List */}
      <div className="space-y-3">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <DeviceCardSkeleton key={i} />
          ))
        ) : devices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="p-4 rounded-full bg-muted/50 mb-4">
              <Satellite className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">No devices found</p>
            <p className="text-xs text-muted-foreground mb-4">
              Create your first GPS device
            </p>
            <Button
              onClick={() => router.push("/gps-devices/create")}
              size="sm"
              className="rounded-xl"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Device
            </Button>
          </div>
        ) : (
          devices.map((device) => (
            <DeviceCard
              key={device.id}
              device={device}
              isAssigned={!!gpsDeviceToTruckMap[device.id]}
              onView={() =>
                router.push(`/gps-devices/placeholder?id=${device.id}`)
              }
              onEdit={() =>
                router.push(`/gps-devices/placeholder/edit?id=${device.id}`)
              }
              onDeactivate={() => handleDeactivate(device.id)}
              onStatusChange={(status) => handleStatusChange(device, status)}
              isUpdating={updateMutation.isPending}
            />
          ))
        )}
      </div>

      {/* Pagination */}
      {!isLoading && pages > 1 && (
        <div className="flex flex-col items-center gap-3 pt-4">
          <div className="text-xs text-muted-foreground">
            Page {page} of {pages} • {total} devices
          </div>
          <Pagination>
            <PaginationContent className="gap-1">
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setPage(Math.max(1, page - 1))}
                  className={cn(
                    "h-8 rounded-lg",
                    page === 1 && "pointer-events-none opacity-50",
                  )}
                />
              </PaginationItem>
              {getPaginationPages().map((p, idx) =>
                typeof p === "string" ? (
                  <PaginationItem key={`ellipsis-${idx}`}>
                    <span className="h-8 w-8 flex items-center justify-center text-xs">
                      ...
                    </span>
                  </PaginationItem>
                ) : (
                  <PaginationItem key={p}>
                    <PaginationLink
                      onClick={() => setPage(p)}
                      isActive={page === p}
                      className="h-8 w-8 rounded-lg text-xs"
                    >
                      {p}
                    </PaginationLink>
                  </PaginationItem>
                ),
              )}
              <PaginationItem>
                <PaginationNext
                  onClick={() => setPage(Math.min(pages, page + 1))}
                  className={cn(
                    "h-8 rounded-lg",
                    page >= pages && "pointer-events-none opacity-50",
                  )}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
