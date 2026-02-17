"use client";

import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Anchor, MapPin, Package, TrendingUp } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./columns";
import { useShips } from "@/hooks/use-ships";
import { Ship } from "@/types/ship";
import { cn } from "@/lib/utils";

// Stats Card Component
function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  gradient,
  iconBg,
}: {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: React.ElementType;
  gradient: string;
  iconBg: string;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl p-4 sm:p-5",
        "bg-card border border-border/50",
        "shadow-sm hover:shadow-md transition-all duration-300",
        "group",
      )}
    >
      {/* Gradient overlay */}
      <div
        className={cn(
          "absolute inset-0 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity",
          gradient,
        )}
      />

      <div className="relative z-10 flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {title}
          </p>
          <p className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            {value}
          </p>
          {subtitle && (
            <p className="text-[10px] sm:text-xs text-muted-foreground font-medium">
              {subtitle}
            </p>
          )}
        </div>
        <div
          className={cn(
            "p-2.5 sm:p-3 rounded-xl transition-all duration-300",
            "group-hover:scale-110 group-hover:rotate-3",
            iconBg,
          )}
        >
          <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
        </div>
      </div>
    </div>
  );
}

// Stats Cards Section
function ShipsStatsCards({ ships }: { ships: Ship[] }) {
  const totalShips = ships.length;
  const inTransit = ships.filter(
    (s) => s.status?.toUpperCase() === "IN_TRANSIT",
  ).length;
  const delivered = ships.filter(
    (s) => s.status?.toUpperCase() === "DELIVERED",
  ).length;
  const completed = ships.filter(
    (s) => s.status?.toUpperCase() === "COMPLETED",
  ).length;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
      <StatsCard
        title="Total Ships"
        value={totalShips}
        subtitle="Active shipments"
        icon={Anchor}
        gradient="bg-gradient-to-br from-primary to-primary/50"
        iconBg="bg-primary/10 text-primary"
      />
      <StatsCard
        title="In Transit"
        value={inTransit}
        subtitle="On the move"
        icon={TrendingUp}
        gradient="bg-gradient-to-br from-amber-500 to-amber-500/50"
        iconBg="bg-amber-500/10 text-amber-600"
      />
      <StatsCard
        title="Delivered"
        value={delivered}
        subtitle="Arrived at destination"
        icon={Package}
        gradient="bg-gradient-to-br from-blue-500 to-blue-500/50"
        iconBg="bg-blue-500/10 text-blue-600"
      />
      <StatsCard
        title="Completed"
        value={completed}
        subtitle="Fully processed"
        icon={MapPin}
        gradient="bg-gradient-to-br from-emerald-500 to-emerald-500/50"
        iconBg="bg-emerald-500/10 text-emerald-600"
      />
    </div>
  );
}

// Loading skeleton for stats
function StatsLoadingSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="relative overflow-hidden rounded-2xl p-4 sm:p-5 bg-card border border-border/50 animate-pulse"
        >
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="h-3 w-16 bg-muted rounded" />
              <div className="h-8 w-12 bg-muted rounded" />
              <div className="h-2 w-20 bg-muted rounded" />
            </div>
            <div className="h-10 w-10 bg-muted rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Table Loading
function TableLoading() {
  return (
    <div className="flex items-center justify-center h-32 gap-2 text-muted-foreground">
      <Loader2 className="h-5 w-5 animate-spin" />
      <span className="text-sm font-medium">Loading ships...</span>
    </div>
  );
}

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ShipStatusEnum } from "@/types/ship";

// ... existing code ...

// Main content component
function ShipsContent() {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const { data, isLoading } = useShips({
    per_page: 100,
  });

  const ships = data?.items || [];

  const filteredShips = ships.filter((ship) => {
    if (statusFilter === "ALL") return true;
    return ship.status?.toLowerCase() === statusFilter.toLowerCase();
  });

  const filterControls = (
    <div className="flex items-center gap-2">
      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger className="h-9 w-[150px] sm:w-[180px] bg-background text-xs sm:text-sm">
          <SelectValue placeholder="All Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All Status</SelectItem>
          <SelectItem value={ShipStatusEnum.CREATED}>Created</SelectItem>
          <SelectItem value={ShipStatusEnum.PRICE_REQUESTED}>
            Price Requested
          </SelectItem>
          <SelectItem value={ShipStatusEnum.PRICED}>Priced</SelectItem>
          <SelectItem value={ShipStatusEnum.ACCEPTED_BY_SHIPPER}>
            Accepted by Shipper
          </SelectItem>
          <SelectItem value={ShipStatusEnum.REJECTED_BY_SHIPPER}>
            Rejected by Shipper
          </SelectItem>
          <SelectItem value={ShipStatusEnum.ALLOCATED}>Allocated</SelectItem>
          <SelectItem value={ShipStatusEnum.READY_FOR_PICKUP}>
            Ready for Pickup
          </SelectItem>
          <SelectItem value={ShipStatusEnum.IN_TRANSIT}>In Transit</SelectItem>
          <SelectItem value={ShipStatusEnum.DELIVERED}>Delivered</SelectItem>
          <SelectItem value={ShipStatusEnum.COMPLETED}>Completed</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <div className="flex flex-col h-full space-y-4 sm:space-y-6 animate-in fade-in duration-500 w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 shrink-0">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Ships
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Manage and track your shipments
          </p>
        </div>
      </div>

      {/* Stats Cards - Hide on mobile when scrolled */}
      <div
        className={cn(
          "shrink-0 transition-all duration-300",
          isScrolled ? "hidden sm:block" : "block",
        )}
      >
        {isLoading ? (
          <StatsLoadingSkeleton />
        ) : (
          <ShipsStatsCards ships={ships} />
        )}
      </div>

      {/* Table Section */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {isLoading ? (
          <TableLoading />
        ) : (
          <DataTable
            columns={columns}
            data={filteredShips}
            searchKey="origin"
            searchPlaceholder="Search routes..."
            filterControls={filterControls}
            onRowClick={(row) => router.push(`/ships/placeholder?id=${row.id}`)}
            onScrollChange={setIsScrolled}
          />
        )}
      </div>
    </div>
  );
}

export default function ShipsPage() {
  return (
    <Suspense fallback={<TableLoading />}>
      <ShipsContent />
    </Suspense>
  );
}
