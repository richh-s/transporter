"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function DriverFilters({
  search,
  setSearch,
  status,
  setStatus,
}: any) {
  return (
    <div className="flex flex-col md:flex-row gap-3 md:items-center">
      <Input
        placeholder="Search name, license, phone..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="md:max-w-sm"
      />

      <Select value={status} onValueChange={setStatus}>
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
  );
}
