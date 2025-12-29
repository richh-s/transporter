"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";

import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Users, UserCheck } from "lucide-react";

import { driverColumns } from "../columns/driver-columns";
import { DriverDialog } from "../components/driver-dialog";

import { useDrivers } from "../../server/hooks/use-drivers";
import { useCreateDriver } from "../../server/hooks/use-create-driver";
import { useUpdateDriver } from "../../server/hooks/use-update-driver";
import { useDeleteDriver } from "../../server/hooks/use-delete-driver";

import type { CreateDriverInput } from "@/lib/zod/driver";

export function DriverManagementView() {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<any | null>(null);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | "active" | "inactive">("all");

  /* ==================================================
     ✅ STABLE QUERY PARAMS (THIS IS THE REAL FIX)
  ================================================== */
  const listParams = useMemo(
    () => ({
      first_name: search || undefined,
      driver_license_number: search || undefined,
      phone_number: search || undefined,
      status: status === "all" ? undefined : status,
    }),
    [search, status]
  );

  /* =======================
     Queries & Mutations
  ======================= */
  const { data, isLoading, isError } = useDrivers(listParams);

  const createDriver = useCreateDriver();
  const updateDriver = useUpdateDriver(selectedDriver?.id);
  const deleteDriver = useDeleteDriver();

  const drivers = data?.items ?? [];

  /* =======================
     Stats
  ======================= */
  const totalDrivers = drivers.length;
  const activeDrivers = drivers.filter(
    (d) => d.status === "active"
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-muted/50 border rounded-xl px-6 py-4">
        <div>
          <h1 className="text-2xl font-bold">Driver Management</h1>
          <p className="text-muted-foreground">
            Manage your drivers and assignments.
          </p>
        </div>

        <Button onClick={() => setOpen(true)}>+ Add New Driver</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* TOTAL */}
        <Card className="p-5 flex items-center gap-4 bg-card border border-border">
          <Users className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Total Drivers
            </p>
            <p className="text-2xl font-bold">{totalDrivers}</p>
          </div>
        </Card>

        {/* ACTIVE */}
        <Card className="p-5 flex items-center gap-4 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900">
          <UserCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Active Drivers
            </p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {activeDrivers}
            </p>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-center gap-3">
        <Input
          placeholder="Search name, license, phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="md:max-w-sm"
        />

        <Select
          value={status}
          onValueChange={(v) =>
            setStatus(v as "all" | "active" | "inactive")
          }
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* States */}
      {isLoading && (
        <div className="border rounded-xl p-12 text-center text-muted-foreground">
          Loading drivers...
        </div>
      )}

      {isError && (
        <div className="border rounded-xl p-12 text-center text-destructive">
          Failed to load drivers
        </div>
      )}

      {!isLoading && drivers.length === 0 && (
        <div className="border rounded-xl p-12 text-center">
          <p className="text-lg font-semibold">No drivers found</p>
          <p className="text-muted-foreground mt-1">
            Try adjusting your search or add a new driver.
          </p>
        </div>
      )}

      {/* Table */}
      {!isLoading && drivers.length > 0 && (
        <div className="rounded-xl border overflow-hidden">
          <DataTable
            columns={driverColumns({
              onView: (driver) => router.push(`/drivers/${driver.id}`),
              onEdit: (driver) => {
                setSelectedDriver(driver);
                setOpen(true);
              },
              onDelete: (driver) => deleteDriver.mutate(driver.id),
            })}
            data={drivers}
          />
        </div>
      )}

      {/* Dialog */}
      <DriverDialog
        open={open}
        onOpenChange={setOpen}
        driver={selectedDriver}
        onSubmit={(values: CreateDriverInput) => {
          if (selectedDriver) {
            updateDriver.mutate(values, {
              onSuccess: () => {
                setOpen(false);
                setSelectedDriver(null);
              },
            });
          } else {
            createDriver.mutate(values, {
              onSuccess: () => setOpen(false),
            });
          }
        }}
      />
    </div>
  );
}
