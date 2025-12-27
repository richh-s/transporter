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
import type { GPSDeviceFilters } from "@/types/gps-device";
import { format } from "date-fns";
import {
  useGPSDevices,
  useDeactivateGPSDevice,
} from "@/hooks/use-gps-devices";

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
    error,
  } = useGPSDevices(page, perPage, appliedFilters);

  const deactivateMutation = useDeactivateGPSDevice();

  const devices = devicesResponse?.items || [];
  const total = devicesResponse?.total || 0;
  const pages = devicesResponse?.pages || 0;

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
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-brand-primary">
            GPS Devices
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage and monitor your GPS tracking devices
          </p>
        </div>
        <Button onClick={() => router.push("/gps-devices/create")}>
          <Plus className="mr-2 h-4 w-4" />
          Create New Device
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
          <div className="flex gap-2 mt-4">
            <Button onClick={handleApplyFilters}>Apply Filters</Button>
            <Button variant="outline" onClick={handleClearFilters}>
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>GPS Devices</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : devices.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No GPS devices found. Create your first device.
              </p>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>External Device ID</TableHead>
                      <TableHead>IMEI Number</TableHead>
                      <TableHead>Device Name</TableHead>
                      <TableHead>Device Model</TableHead>
                      <TableHead>Truck</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Expire Date</TableHead>
                      <TableHead>Last Synced</TableHead>
                      <TableHead>Actions</TableHead>
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
                        <TableCell className="font-medium">
                          {device.id}
                        </TableCell>
                        <TableCell>{device.external_device_id}</TableCell>
                        <TableCell>{device.imei_number}</TableCell>
                        <TableCell>
                          {device.device_name || (
                            <span className="text-muted-foreground">
                              N/A
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {device.device_model || (
                            <span className="text-muted-foreground">
                              N/A
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {device.truck_id ? (
                            <span className="font-medium text-green-600">
                              Assigned
                            </span>
                          ) : (
                            <span className="text-muted-foreground">
                              Unassigned
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={device.status ? "default" : "secondary"}
                            className={
                              device.status
                                ? "bg-green-500 hover:bg-green-600"
                                : "bg-gray-500 hover:bg-gray-600"
                            }
                          >
                            {device.status ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(device.expire_date)}</TableCell>
                        <TableCell>
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

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Showing {(page - 1) * perPage + 1} to{" "}
                  {Math.min(page * perPage, total)} of {total} devices
                </div>
                <div className="flex items-center gap-2">
                  <Select
                    value={perPage.toString()}
                    onValueChange={(value) => {
                      setPerPage(Number(value));
                      setPage(1);
                    }}
                  >
                    <SelectTrigger className="w-[100px]">
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
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

