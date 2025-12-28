"use client";

import { useMemo, useState } from "react";
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

import { driverColumns, Driver } from "../columns/driver-columns";
import { DriverDialog } from "../components/driver-dialog";


const MOCK_DATA: Driver[] = [
    {
      id: "1",
      first_name: "Abebe",
      last_name: "Kebede",
      phone_number: "0912345678",
      email: "abebe@example.com",
      driver_license_number: "DL-12345",
      status: "active",
    },
    {
      id: "2",
      first_name: "Tesfaye",
      last_name: "Alemu",
      phone_number: "0911223344",
      email: "tesfaye@example.com",
      driver_license_number: "DL-67890",
      status: "inactive",
    },
    {
      id: "3",
      first_name: "Bekele",
      last_name: "Tadesse",
      phone_number: "0923456789",
      email: "bekele@example.com",
      driver_license_number: "DL-33456",
      status: "active",
    },
    {
      id: "4",
      first_name: "Mulugeta",
      last_name: "Haile",
      phone_number: "0934567890",
      email: "mulugeta@example.com",
      driver_license_number: "DL-44567",
      status: "active",
    },
    {
      id: "5",
      first_name: "Solomon",
      last_name: "Getachew",
      phone_number: "0919876543",
      email: "solomon@example.com",
      driver_license_number: "DL-55678",
      status: "inactive",
    },
    {
      id: "6",
      first_name: "Yonas",
      last_name: "Mengistu",
      phone_number: "0921122334",
      email: "yonas@example.com",
      driver_license_number: "DL-66789",
      status: "active",
    },
    {
      id: "7",
      first_name: "Dawit",
      last_name: "Assefa",
      phone_number: "0932233445",
      email: "dawit@example.com",
      driver_license_number: "DL-77890",
      status: "active",
    },
    {
      id: "8",
      first_name: "Samuel",
      last_name: "Bekele",
      phone_number: "0943344556",
      email: "samuel@example.com",
      driver_license_number: "DL-88901",
      status: "inactive",
    },
    {
      id: "9",
      first_name: "Henok",
      last_name: "Tesfahun",
      phone_number: "0954455667",
      email: "henok@example.com",
      driver_license_number: "DL-99012",
      status: "active",
    },
  ];
  
export function DriverManagementView() {
  const [open, setOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | "active" | "inactive">("all");

// filter
  const filteredDrivers = useMemo(() => {
    return MOCK_DATA.filter((driver) => {
      const fullName = `${driver.first_name} ${driver.last_name}`.toLowerCase();

      const matchesSearch =
        fullName.includes(search.toLowerCase()) ||
        driver.driver_license_number
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        driver.phone_number.includes(search);

      const matchesStatus =
        status === "all" ? true : driver.status === status;

      return matchesSearch && matchesStatus;
    });
  }, [search, status]);

// stats
  const totalDrivers = filteredDrivers.length;
  const activeDrivers = filteredDrivers.filter(
    (d) => d.status === "active"
  ).length;

  return (
    <div className="space-y-6">
  {/* header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Driver Management</h1>
          <p className="text-muted-foreground">
            Manage your drivers and assignments.
          </p>
        </div>

        <Button onClick={() => setOpen(true)}>
          + Add New Driver
        </Button>
      </div>

  {/* stat card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-5 flex items-center gap-4">
          <Users className="text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground uppercase">
              Total Drivers
            </p>
            <p className="text-2xl font-bold">{totalDrivers}</p>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4 bg-blue-50">
          <UserCheck className="text-blue-600" />
          <div>
            <p className="text-xs text-muted-foreground uppercase">
              Active Drivers
            </p>
            <p className="text-2xl font-bold text-blue-600">
              {activeDrivers}
            </p>
          </div>
        </Card>
      </div>

{/* search */}
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
{/* no driversfound  */}
      {filteredDrivers.length === 0 && (
        <div className="border rounded-xl p-12 text-center">
          <p className="text-lg font-semibold">No drivers found</p>
          <p className="text-muted-foreground mt-1">
            Try adjusting your search or add a new driver.
          </p>
        </div>
      )}

     {/* table */}
      {filteredDrivers.length > 0 && (
        <div
          className="
            rounded-xl border overflow-hidden
            [&_thead]:sticky [&_thead]:top-0 [&_thead]:bg-muted
            [&_tbody_tr:nth-child(even)]:bg-muted/30
            [&_tbody_tr:hover]:bg-muted/60
            transition-colors
          "
        >
          <DataTable
            columns={driverColumns(
              (driver) => {
                setSelectedDriver(driver);
                setOpen(true);
              },
              (driver) => {
                console.log("delete", driver);
              }
            )}
            data={filteredDrivers}
          />
        </div>
      )}

{/* add dialog */}
      <DriverDialog
        open={open}
        onOpenChange={setOpen}
        driver={selectedDriver}
        onSubmit={(data: any) => {
          console.log(data);
          setOpen(false);
          setSelectedDriver(null);
        }}
      />
    </div>
  );
}
