"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
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
import type { GPSDeviceFilters, GPSDevice } from "@/types/gps-device";
import { format } from "date-fns";
import {
  useGPSDevices,
  useDeactivateGPSDevice,
  useUpdateGPSDevice,
} from "@/hooks/use-gps-devices";
import { useTrucks } from "@/hooks/use-trucks";
import { Switch } from "@/components/ui/switch";
import { useMemo } from "react";

export default function GPSDevicesPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);

  // Filters
  const [filters, setFilters] = useState<GPSDeviceFilters>({
    external_device_id: "",
    imei_number: "",
    device_name: "",
    device_model: "",
    status: undefined,
  });

  const [appliedFilters, setAppliedFilters] = useState<GPSDeviceFilters>({});

  // Use TanStack Query hook
  const {
    data: devicesResponse,
    isLoading,
  } = useGPSDevices(page, perPage, appliedFilters);

  const deactivateMutation = useDeactivateGPSDevice();
  const updateMutation = useUpdateGPSDevice();

  // Fetch all trucks to create mapping
  const { data: trucks = [] } = useTrucks();

  const devices = devicesResponse?.items || [];
  const total = devicesResponse?.total || 0;
  const pages = devicesResponse?.pages || 0;

  // Create mapping object: { [gps_device_id]: truck_id }
  // Only include trucks that have a gps_device_id (assigned trucks)
  const gpsDeviceToTruckMap = useMemo(() => {
    const map: Record<number, number> = {};
    trucks.forEach((truck) => {
      if (truck.gps_device_id !== null && truck.gps_device_id !== undefined) {
        map[truck.gps_device_id] = truck.id;
      }
    });
    if (process.env.NODE_ENV === "development") {
      console.log("[GPS Devices Table] GPS Device to Truck Mapping:", map);
    }
    return map;
  }, [trucks]);

  // Debug: Log device data to check truck_id
  if (devices.length > 0 && process.env.NODE_ENV === "development") {
    console.log("GPS Devices in table:", devices);
    console.log("Device with ID 6:", devices.find((d) => d.id === 6));
  }

  const handleApplyFilters = () => {
    setAppliedFilters(filters);
    setPage(1);
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

  const handleDeactivate = async (id: number) => {
    if (!confirm("Are you sure you want to deactivate this GPS device?")) {
      return;
    }

    deactivateMutation.mutate(id);
  };

  const handleStatusChange = (device: GPSDevice, newStatus: boolean) => {
    updateMutation.mutate({
      id: device.id,
      data: {
        status: newStatus,
      },
    });
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch {
      return dateString;
    }
  };

  const formatDateTime = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy HH:mm");
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-500 max-w-full overflow-x-hidden px-2 sm:px-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-brand-primary">
            GPS Devices
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Manage and monitor your GPS tracking devices
          </p>
        </div>
        <Button
          onClick={() => router.push("/gps-devices/create")}
          className="w-full sm:w-auto"
        >
          <Plus className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Create New Device</span>
          <span className="sm:hidden">Create</span>
        </Button>
      </div>

      {/* Filters */}
      <Card className="w-full">
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="text-lg sm:text-xl">Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
            <Input
              placeholder="External Device ID"
              value={filters.external_device_id || ""}
              onChange={(e) =>
                setFilters({ ...filters, external_device_id: e.target.value })
              }
            />
            <Input
              placeholder="IMEI Number"
              value={filters.imei_number || ""}
              onChange={(e) =>
                setFilters({ ...filters, imei_number: e.target.value })
              }
            />
            <Input
              placeholder="Device Name"
              value={filters.device_name || ""}
              onChange={(e) =>
                setFilters({ ...filters, device_name: e.target.value })
              }
            />
            <Input
              placeholder="Device Model"
              value={filters.device_model || ""}
              onChange={(e) =>
                setFilters({ ...filters, device_model: e.target.value })
              }
            />
            <Select
              value={
                filters.status === undefined
                  ? "all"
                  : filters.status
                    ? "active"
                    : "inactive"
              }
              onValueChange={(value) => {
                setFilters({
                  ...filters,
                  status:
                    value === "all"
                      ? undefined
                      : value === "active"
                        ? true
                        : false,
                });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-2 pt-2">
            <Button
              onClick={handleApplyFilters}
              className="w-full sm:w-auto"
            >
              Apply Filters
            </Button>
            <Button
              variant="outline"
              onClick={handleClearFilters}
              className="w-full sm:w-auto"
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="w-full">
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="text-lg sm:text-xl">GPS Devices</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-2 p-6">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : devices.length === 0 ? (
            <div className="text-center py-12 p-6">
              <p className="text-muted-foreground">
                No GPS devices found. Create your first device.
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto -mx-2 sm:mx-0">
                <div className="min-w-[800px] px-2 sm:px-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="whitespace-nowrap">ID</TableHead>
                        <TableHead className="whitespace-nowrap">External Device ID</TableHead>
                        <TableHead className="whitespace-nowrap">IMEI Number</TableHead>
                        <TableHead className="whitespace-nowrap">Device Name</TableHead>
                        <TableHead className="whitespace-nowrap">Device Model</TableHead>
                        <TableHead className="whitespace-nowrap">Truck</TableHead>
                        <TableHead className="whitespace-nowrap">Status</TableHead>
                        <TableHead className="whitespace-nowrap">Expire Date</TableHead>
                        <TableHead className="whitespace-nowrap">Last Synced</TableHead>
                        <TableHead className="whitespace-nowrap">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {devices.map((device) => (
                        <TableRow
                          key={device.id}
                          className="cursor-pointer"
                          onClick={() =>
                            router.push(`/gps-devices/${device.id}`)
                          }
                        >
                          <TableCell className="font-medium whitespace-nowrap text-xs sm:text-sm">
                            {device.id}
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-xs sm:text-sm">{device.external_device_id}</TableCell>
                          <TableCell className="whitespace-nowrap text-xs sm:text-sm">{device.imei_number}</TableCell>
                          <TableCell className="whitespace-nowrap text-xs sm:text-sm">
                            {device.device_name || (
                              <span className="text-muted-foreground">
                                N/A
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-xs sm:text-sm">
                            {device.device_model || (
                              <span className="text-muted-foreground">
                                N/A
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-xs sm:text-sm" onClick={(e) => e.stopPropagation()}>
                            {gpsDeviceToTruckMap[device.id] ? (
                              <span className="font-medium text-green-600">
                                Assigned
                              </span>
                            ) : (
                              <span className="text-muted-foreground">
                                Unassigned
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-xs sm:text-sm" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center gap-1 sm:gap-2">
                              <Switch
                                checked={device.status}
                                onCheckedChange={(checked) =>
                                  handleStatusChange(device, checked)
                                }
                                disabled={updateMutation.isPending}
                                className="scale-75 sm:scale-100"
                              />
                              <Badge
                                variant={device.status ? "default" : "secondary"}
                                className={
                                  device.status
                                    ? "bg-green-500 hover:bg-green-600 text-[10px] sm:text-xs"
                                    : "bg-gray-500 hover:bg-gray-600 text-[10px] sm:text-xs"
                                }
                              >
                                {device.status ? "Active" : "Inactive"}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-xs sm:text-sm">{formatDate(device.expire_date)}</TableCell>
                          <TableCell className="whitespace-nowrap text-xs sm:text-sm">
                            {formatDateTime(device.last_synced_at)}
                          </TableCell>
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() =>
                                    router.push(`/gps-devices/${device.id}`)
                                  }
                                >
                                  View
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    router.push(`/gps-devices/${device.id}/edit`)
                                  }
                                >
                                  Edit
                                </DropdownMenuItem>
                                {device.status && (
                                  <DropdownMenuItem
                                    className="text-red-600"
                                    onClick={() => handleDeactivate(device.id)}
                                  >
                                    Deactivate
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </>
          )}
        </CardContent>
        {!isLoading && devices.length > 0 && (
          <CardContent className="pt-4 sm:pt-6">
            {/* Pagination */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="text-xs sm:text-sm text-muted-foreground">
                Showing {(page - 1) * perPage + 1} to{" "}
                {Math.min(page * perPage, total)} of {total} devices
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                <Select
                  value={perPage.toString()}
                  onValueChange={(value) => {
                    setPerPage(Number(value));
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="w-full sm:w-[100px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setPage(Math.max(1, page - 1))}
                        className={
                          page === 1 ? "pointer-events-none opacity-50" : ""
                        }
                      />
                    </PaginationItem>
                    {[...Array(Math.min(pages, 5))].map((_, i) => {
                      const pageNum = i + 1;
                      return (
                        <PaginationItem key={pageNum}>
                          <PaginationLink
                            onClick={() => setPage(pageNum)}
                            isActive={page === pageNum}
                          >
                            {pageNum}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => setPage(Math.min(pages, page + 1))}
                        className={
                          page >= pages ? "pointer-events-none opacity-50" : ""
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}

