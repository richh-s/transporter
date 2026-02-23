"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Satellite,
  CheckCircle,
  XCircle,
  Filter,
  Truck,
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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { DataTable } from "@/components/ui/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  gpsDeviceColumns,
  type GPSDeviceTableRow,
} from "@/app/modules/fleet/ui/columns/gps-device-columns";
import { GPSDeviceCard } from "./gps-device-card";
import type { GPSDeviceFilters, GPSDevice } from "@/types/gps-device";
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
    <div className="flex items-center gap-3 p-3 sm:p-4 rounded-xl bg-card border border-border/50 shadow-sm h-full">
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

// Table loading skeleton (same as ships/fleet/drivers)
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

export default function GPSDevicesPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
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

  // Calculate stats (based on current page/view)
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

  const hasActiveFilters = Object.values(appliedFilters).some(
    (v) => v !== undefined && v !== "",
  );

  return (
    <div className="flex flex-col h-full space-y-4 sm:space-y-6 animate-in fade-in duration-300 pb-10 sm:pb-6 w-full overflow-x-hidden">
      {/* Header - same as ships/fleet/drivers */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 shrink-0 px-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            GPS Devices
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Manage and track your GPS devices
          </p>
        </div>
        <Button
          onClick={() => router.push("/gps-devices/create")}
          size="sm"
          className="rounded-xl h-9 gap-1.5 shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">New Device</span>
          <span className="sm:hidden">New</span>
        </Button>
      </div>

      {/* Stats - scrollable on mobile, equal gap (same as ships/fleet/drivers) */}
      <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 sm:overflow-visible shrink-0">
        <div className="flex sm:grid sm:grid-cols-4 gap-3 sm:gap-4 min-w-0 sm:min-w-full pr-4 sm:pr-0">
          <div className="shrink-0 w-[72%] min-w-[160px] sm:w-auto sm:min-w-0">
            <StatsCard
              icon={Satellite}
              label="Total"
              value={total}
              accent="bg-primary/10 text-primary"
            />
          </div>
          <div className="shrink-0 w-[72%] min-w-[160px] sm:w-auto sm:min-w-0">
            <StatsCard
              icon={CheckCircle}
              label="Active"
              value={activeCount}
              accent="bg-primary/10 text-primary"
            />
          </div>
          <div className="shrink-0 w-[72%] min-w-[160px] sm:w-auto sm:min-w-0">
            <StatsCard
              icon={XCircle}
              label="Inactive"
              value={inactiveCount}
              accent="bg-gray-500/10 text-gray-600"
            />
          </div>
          <div className="shrink-0 w-[72%] min-w-[160px] sm:w-auto sm:min-w-0">
            <StatsCard
              icon={Truck}
              label="Assigned"
              value={assignedCount}
              accent="bg-primary/10 text-primary"
            />
          </div>
        </div>
      </div>

      {/* Table - desktop same as others; mobile = cards via renderMobileCard */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {isLoading ? (
          <TableLoadingSkeleton />
        ) : (
          <DataTable
            columns={gpsDeviceColumns}
            data={devices as GPSDeviceTableRow[]}
            onRowClick={(device) =>
              router.push(`/gps-devices/placeholder?id=${device.id}`)
            }
            meta={{
              onEdit: (device: GPSDevice) =>
                router.push(`/gps-devices/placeholder/edit?id=${device.id}`),
              onDeactivate: handleDeactivate,
              onStatusChange: handleStatusChange,
              isUpdating: updateMutation.isPending,
              gpsDeviceToTruckMap,
            }}
            manualPagination
            page={page}
            pageCount={pages}
            total={total}
            perPage={perPage}
            onPageChange={setPage}
            onPerPageChange={setPerPage}
            variant="clean"
            hideColumnVisibility
            renderMobileCard={(device) => (
              <GPSDeviceCard
                device={device}
                assigned={!!gpsDeviceToTruckMap[device.id]}
                onClick={() =>
                  router.push(`/gps-devices/placeholder?id=${device.id}`)
                }
              />
            )}
            filterControls={
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
                              setFilters({
                                ...filters,
                                imei_number: e.target.value,
                              })
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
                              setFilters({
                                ...filters,
                                device_name: e.target.value,
                              })
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
                                  value === "all"
                                    ? undefined
                                    : value === "active",
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
            }
          />
        )}
      </div>
    </div>
  );
}
