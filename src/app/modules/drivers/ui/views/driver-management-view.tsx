"use client";

import { toast } from "sonner";
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

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

import { driverColumns } from "../columns/driver-columns";
import { DriverDialog } from "../components/driver-dialog";

import { useDrivers } from "../../server/hooks/use-drivers";
import { useDeleteDriver } from "../../server/hooks/use-delete-driver";

import type { Driver } from "../../server/types";

export function DriverManagementView() {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [driverToDelete, setDriverToDelete] = useState<Driver | null>(null);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | "active" | "inactive">("all");

  const listParams = useMemo(
    () => ({
      first_name: search || undefined,
      driver_license_number: search || undefined,
      phone_number: search || undefined,
      status: status === "all" ? undefined : status,
    }),
    [search, status]
  );

  const { data, isLoading } = useDrivers(listParams);
  const deleteDriver = useDeleteDriver();

  const drivers = data?.items ?? [];

  const totalDrivers = drivers.length;
  const activeDrivers = drivers.filter((d) => d.status === "active").length;

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

        <Button
          onClick={() => {
            setSelectedDriver(null);
            setOpen(true);
          }}
        >
          + Add New Driver
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-5 flex items-center gap-4">
          <Users className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Total Drivers
            </p>
            <p className="text-2xl font-bold">{totalDrivers}</p>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900">
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
          placeholder="Search name, license, phone…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="md:max-w-sm"
        />

        <Select value={status} onValueChange={(v) => setStatus(v as "all" | "active" | "inactive")}>
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

      {/* Table Card */}
      <Card className="p-0 overflow-hidden">
        {/* Table */}
        <DataTable
          onRowClick={(driver) => router.push(`/drivers/${driver.id}`)}
          columns={driverColumns({
            onView: (driver) => router.push(`/drivers/${driver.id}`),
            onEdit: (driver) => {
              setSelectedDriver(driver);
              setOpen(true);
            },
            onDelete: (driver) => {
              setDriverToDelete(driver);
              setDeleteOpen(true);
            },
          })}
          data={drivers}
          isLoading={isLoading}
        />
      </Card>

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
        <DialogContent>
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

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteOpen(false);
                setDriverToDelete(null);
              }}
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
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
