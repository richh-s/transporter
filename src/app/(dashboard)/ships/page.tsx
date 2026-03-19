"use client";

import { useState, Suspense, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Anchor, MapPin, Package, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTable } from "@/components/ui/data-table";
import { getColumns } from "./columns";
import { ShipCard } from "./ship-card";
import { useShips } from "@/hooks/use-ships";
import { Ship } from "@/types/ship";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation(["shipments", "common"]);
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
    <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 sm:overflow-visible">
      <div className="flex sm:grid sm:grid-cols-4 gap-3 sm:gap-4 min-w-0 sm:min-w-full pr-4 sm:pr-0">
        <div className="shrink-0 w-[72%] min-w-[160px] sm:w-auto sm:min-w-0">
          <StatsCard
            title={t("shipments:columns.shipment_id")}
            value={totalShips}
            subtitle={t("shipments:labels.all_shipments")}
            icon={Anchor}
            gradient="bg-gradient-to-br from-primary to-primary/50"
            iconBg="bg-primary/10 text-primary"
          />
        </div>
        <div className="shrink-0 w-[72%] min-w-[160px] sm:w-auto sm:min-w-0">
          <StatsCard
            title={t("shipments:status.in_transit")}
            value={inTransit}
            subtitle={t("shipments:status.in_transit")}
            icon={TrendingUp}
            gradient="bg-gradient-to-br from-amber-500 to-amber-500/50"
            iconBg="bg-amber-500/10 text-amber-600"
          />
        </div>
        <div className="shrink-0 w-[72%] min-w-[160px] sm:w-auto sm:min-w-0">
          <StatsCard
            title={t("shipments:status.delivered")}
            value={delivered}
            subtitle={t("shipments:status.delivered")}
            icon={Package}
            gradient="bg-gradient-to-br from-blue-500 to-blue-500/50"
            iconBg="bg-blue-500/10 text-blue-600"
          />
        </div>
        <div className="shrink-0 w-[72%] min-w-[160px] sm:w-auto sm:min-w-0">
          <StatsCard
            title={t("shipments:status.delivered")}
            value={completed}
            subtitle={t("shipments:status.delivered")}
            icon={MapPin}
            gradient="bg-gradient-to-br from-emerald-500 to-emerald-500/50"
            iconBg="bg-emerald-500/10 text-emerald-600"
          />
        </div>
      </div>
    </div>
  );
}

// ... loading skeletons stay the same ...

// Loading skeleton for stats (scrollable on mobile)
function StatsLoadingSkeleton() {
  return (
    <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 sm:overflow-visible">
      <div className="flex sm:grid sm:grid-cols-4 gap-3 sm:gap-4 min-w-0 sm:min-w-full pr-4 sm:pr-0">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="shrink-0 w-[72%] min-w-[160px] sm:w-auto sm:min-w-0"
          >
            <div className="relative overflow-hidden rounded-2xl p-4 sm:p-5 bg-card border border-border/50 animate-pulse">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="h-3 w-16 bg-muted rounded" />
                  <div className="h-8 w-12 bg-muted rounded" />
                  <div className="h-2 w-20 bg-muted rounded" />
                </div>
                <div className="h-10 w-10 bg-muted rounded-xl" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Table loading skeleton
function TableLoadingSkeleton() {
  const rows = 8;
  const cols = 6;
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
  const { t } = useTranslation(["shipments", "common"]);
  const [isScrolled, setIsScrolled] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const columns = useMemo(() => getColumns(t), [t]);

  const { data, isLoading } = useShips(
    { per_page: 100 },
    { refetchInterval: 60 * 1000 },
  );

  const ships = data?.items || [];

  const filteredShips = ships.filter((ship) => {
    if (statusFilter === "ALL") return true;
    return ship.status?.toLowerCase() === statusFilter.toLowerCase();
  });

  const filterControls = (
    <div className="flex items-center gap-2">
      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger className="h-9 w-[150px] sm:w-[180px] bg-background text-xs sm:text-sm">
          <SelectValue placeholder={t("shipments:labels.status_filters")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">{t("shipments:labels.all_shipments")}</SelectItem>
          <SelectItem value={ShipStatusEnum.CREATED}>{t("shipments:status.pending")}</SelectItem>
          <SelectItem value={ShipStatusEnum.PRICE_REQUESTED}>
            {t("shipments:status.pending")}
          </SelectItem>
          <SelectItem value={ShipStatusEnum.PRICED}>{t("shipments:status.pending")}</SelectItem>
          <SelectItem value={ShipStatusEnum.ACCEPTED_BY_SHIPPER}>
            {t("shipments:status.assigned")}
          </SelectItem>
          <SelectItem value={ShipStatusEnum.REJECTED_BY_SHIPPER}>
            {t("shipments:status.cancelled")}
          </SelectItem>
          <SelectItem value={ShipStatusEnum.ALLOCATED}>{t("shipments:status.assigned")}</SelectItem>
          <SelectItem value={ShipStatusEnum.READY_FOR_PICKUP}>
            {t("shipments:status.assigned")}
          </SelectItem>
          <SelectItem value={ShipStatusEnum.IN_TRANSIT}>{t("shipments:status.in_transit")}</SelectItem>
          <SelectItem value={ShipStatusEnum.DELIVERED}>{t("shipments:status.delivered")}</SelectItem>
          <SelectItem value={ShipStatusEnum.COMPLETED}>{t("shipments:status.delivered")}</SelectItem>
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
            {t("shipments:title")}
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {t("shipments:subtitle")}
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
          <TableLoadingSkeleton />
        ) : (
          <DataTable
            columns={columns}
            data={filteredShips}
            searchKey="origin"
            searchPlaceholder={t("shipments:labels.search_placeholder")}
            filterControls={filterControls}
            onRowClick={(row) => router.push(`/ships/placeholder?id=${row.id}`)}
            onScrollChange={setIsScrolled}
            variant="clean"
            hideColumnVisibility
            renderMobileCard={(ship) => (
              <ShipCard
                ship={ship}
                onClick={() => router.push(`/ships/placeholder?id=${ship.id}`)}
              />
            )}
          />
        )}
      </div>
    </div>
  );
}

export default function ShipsPage() {
  return (
    <Suspense fallback={<TableLoadingSkeleton />}>
      <ShipsContent />
    </Suspense>
  );
}
