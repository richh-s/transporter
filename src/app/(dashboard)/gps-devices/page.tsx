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
import { gpsDeviceColumns, type GPSDeviceTableRow } from "@/app/modules/fleet/ui/columns/gps-device-columns";
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
    <div className="space-y-4 animate-in fade-in duration-300 pb-6 px-4 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
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
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
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

      <DataTable
        columns={gpsDeviceColumns}
        data={devices as GPSDeviceTableRow[]}
        isLoading={isLoading}
        onRowClick={(device) => router.push(`/gps-devices/placeholder?id=${device.id}`)}
        meta={{
          onEdit: (device: GPSDevice) => router.push(`/gps-devices/placeholder/edit?id=${device.id}`),
          onDeactivate: handleDeactivate,
          onStatusChange: handleStatusChange,
          isUpdating: updateMutation.isPending,
          gpsDeviceToTruckMap,
        }}
        // Server-side pagination
        manualPagination={true}
        page={page}
        pageCount={pages}
        total={total}
        perPage={perPage}
        onPageChange={setPage}
        onPerPageChange={setPerPage}
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
        }
      />
    </div>
  );
}
