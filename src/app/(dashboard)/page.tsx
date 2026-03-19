"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Truck,
  ClipboardList,
  Tag,
  TrendingUp,
  Clock,
  AlertCircle,
  ChevronRight,
  FileText,
  Users,
  Radio,
  ArrowRight,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { shipApi } from "@/lib/api/ships";
import { truckApi } from "@/lib/api/trucks";
import { PriceQuoteService } from "@/lib/price-quote-api";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { formatDate } from "@/lib/format";

interface DashboardStat {
  name: string;
  value: string;
  icon: React.ElementType;
}

interface Activity {
  id: string;
  shipId: number;
  route: string;
  status: string;
  truck: string;
  time: string;
  rawStatus: string;
}

export default function Dashboard() {
  const router = useRouter();
  const { t } = useTranslation(["dashboard", "common"]);
  const [stats, setStats] = useState<DashboardStat[]>([
    { name: t("dashboard:overview.stats.active_trucks"), value: "--", icon: Truck },
    { name: t("dashboard:overview.stats.total_orders"), value: "--", icon: ClipboardList },
    { name: t("dashboard:overview.stats.open_quotes"), value: "--", icon: Tag },
    { name: t("dashboard:overview.stats.revenue"), value: "--", icon: TrendingUp },
  ]);

  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingActivity, setLoadingActivity] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    setLoadingStats(true);
    setLoadingActivity(true);

    try {
      // 1. Fetch Trucks
      const trucksRes = await truckApi.getTrucks({ per_page: 1 });
      const totalTrucks = trucksRes.data?.total || 0;

      // 2. Fetch Ships (which include their items)
      // We fetch more ships to have a better chance of finding assigned items
      const shipsRes = await shipApi.getShips({ per_page: 20 });
      const totalOrders = shipsRes.data?.total || 0;
      const ships = shipsRes.data?.items || [];

      // Extract and flatten all ship items from the ships
      const allShipItems = ships.flatMap((ship) =>
        (ship.ship_items || []).map((item) => ({
          ...item,
          ship_id: ship.id,
          pickup_date: ship.pickup_date,
          origin: ship.origin,
          destination: ship.destination,
        })),
      );

      // Revenue only from started ship items (transporter may reject others)
      const startedShipItems = allShipItems.filter(
        (item) => item.status?.toLowerCase() === "started",
      );
      const revenue = startedShipItems.reduce(
        (acc: number, item) => acc + (Number(item.computed_price) || 0),
        0,
      );

      // 3. Fetch Quotes
      const quotesRes = await PriceQuoteService.listQuotes(1, 1);
      const totalQuotes = quotesRes.total || 0;

      setStats([
        { name: t("dashboard:overview.stats.active_trucks"), value: totalTrucks.toString(), icon: Truck },
        {
          name: t("dashboard:overview.stats.total_orders"),
          value: totalOrders.toString(),
          icon: ClipboardList,
        },
        { name: t("dashboard:overview.stats.open_quotes"), value: totalQuotes.toString(), icon: Tag },
        {
          name: t("dashboard:overview.stats.revenue"),
          value: formatCurrency(revenue, "ETB").replace("ETB", "").trim(),
          icon: TrendingUp,
        },
      ]);

      // 4. Map Recent Activity (Filter for items with at least one assignment)
      const activities: Activity[] = allShipItems
        .filter((item) => {
          const hasTruck =
            item.truck_id ||
            item.assigned_truck_id ||
            item.assigned_truck?.id ||
            item.truck?.id;
          const hasDriver =
            item.driver_id ||
            item.assigned_driver_id ||
            item.assigned_driver?.id ||
            item.driver?.id;
          return hasTruck || hasDriver;
        })
        .sort((a, b) => b.id - a.id) // Show newest first
        .slice(0, 5) // Limit to 5
        .map((item) => {
          const hasTruck =
            item.truck_id ||
            item.assigned_truck_id ||
            item.assigned_truck?.id ||
            item.truck?.id;
          const hasDriver =
            item.driver_id ||
            item.assigned_driver_id ||
            item.assigned_driver?.id ||
            item.driver?.id;
          const isFull = hasTruck && hasDriver;

          return {
            id: `ORD-${item.id}`,
            shipId: item.ship_id,
            route: `${item.origin || "N/A"} → ${item.destination || "N/A"}`,
            status: isFull ? t("dashboard:recent_activity.status.full_assigned") : t("dashboard:recent_activity.status.partial_assigned"),
            rawStatus: isFull ? "full" : "partial",
            truck:
              item.assigned_truck?.plate_number ||
              item.truck?.plate_number ||
              (hasTruck ? t("dashboard:recent_activity.status.truck_assigned") : t("dashboard:recent_activity.status.driver_assigned")),
            time: item.created_at
              ? formatDate(item.created_at)
              : t("common:labels.date"),
          };
        });
      setRecentActivities(activities);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoadingStats(false);
      setLoadingActivity(false);
    }
  }, [t]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleActivityClick = (shipId: number) => {
    router.push(`/ships/placeholder?id=${shipId}`);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500 pb-10 sm:pb-0 w-full overflow-x-hidden">
      <div className="px-0">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-brand-primary">
          {t("dashboard:overview.title")}
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground">
          {t("dashboard:overview.subtitle")}
        </p>
      </div>

      {/* Stat cards - scrollable on mobile with equal left/right gap (match ships page) */}
      <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 sm:overflow-visible">
        <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 min-w-0 sm:min-w-full pr-4 sm:pr-0">
          {loadingStats
            ? Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="shrink-0 w-[72%] min-w-[160px] sm:w-auto sm:min-w-0 p-3 sm:p-6 bg-card border border-border rounded-xl shadow-none sm:shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg" />
                    <Skeleton className="h-5 w-14 rounded-full" />
                  </div>
                  <div className="mt-2 sm:mt-4 space-y-2">
                    <Skeleton className="h-3 w-20 sm:w-24" />
                    <Skeleton className="h-7 sm:h-9 w-16 sm:w-24" />
                  </div>
                </div>
              ))
            : stats.map((stat) => (
                <div
                  key={stat.name}
                  className="shrink-0 w-[72%] min-w-[160px] sm:w-auto sm:min-w-0"
                >
                  <div className="p-3 sm:p-6 bg-card border border-border rounded-xl shadow-none sm:shadow-sm hover:shadow-md transition-shadow h-full">
                    <div className="flex items-center justify-between">
                      <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg">
                        <stat.icon className="h-4 w-4 sm:h-6 sm:w-6 text-primary" />
                      </div>
                    </div>
                    <div className="mt-2 sm:mt-4">
                      <h3 className="text-[10px] sm:text-sm font-medium text-muted-foreground truncate uppercase tracking-wider">
                        {stat.name}
                      </h3>
                      <p className="text-xl sm:text-3xl font-bold mt-0.5 sm:mt-1">
                        {stat.value}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Quick Actions */}
        <div className="bg-card border border-border rounded-xl overflow-hidden flex flex-col shadow-none sm:shadow-sm">
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              {t("dashboard:quick_actions.title")}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              {t("dashboard:quick_actions.subtitle")}
            </p>
          </div>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              { label: t("dashboard:quick_actions.items.ships"), href: "/ships", icon: ClipboardList },
              { label: t("dashboard:quick_actions.items.quotes"), href: "/price-quotes", icon: Tag },
              { label: t("dashboard:quick_actions.items.fleet"), href: "/fleet", icon: Truck },
              { label: t("dashboard:quick_actions.items.drivers"), href: "/drivers", icon: Users },
              { label: t("dashboard:quick_actions.items.gps"), href: "/gps-devices", icon: Radio },
            ].map((item) => (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className="flex items-center justify-between p-3 rounded-lg border border-border bg-background hover:bg-accent/50 hover:border-primary/30 transition-colors text-left group"
              >
                <span className="flex items-center gap-2 text-sm font-medium">
                  <item.icon className="h-4 w-4 text-muted-foreground" />
                  {item.label}
                </span>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
              </button>
            ))}
          </div>
        </div>

        {/* Recent Activity Table */}
        <div className="bg-card border border-border rounded-xl flex flex-col shadow-none sm:shadow-sm">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              {t("dashboard:recent_activity.title")}
            </h3>
            <button
              onClick={() => router.push("/ships")}
              className="text-xs text-primary hover:underline font-medium"
            >
              {t("dashboard:recent_activity.view_all")}
            </button>
          </div>

          {loadingActivity ? (
            <div className="p-4 space-y-0">
              <div className="hidden sm:block space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 py-3 border-b border-border last:border-0"
                  >
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-5 w-24 rounded-full" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-14" />
                    <Skeleton className="h-4 w-4 ml-auto rounded" />
                  </div>
                ))}
              </div>
              <div className="sm:hidden space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="p-4 space-y-3 border-b border-border last:border-0"
                  >
                    <div className="flex justify-between">
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-5 w-24 rounded-full" />
                    </div>
                    <Skeleton className="h-3 w-28" />
                  </div>
                ))}
              </div>
            </div>
          ) : recentActivities.length === 0 ? (
            <div className="py-20 text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
              <p className="text-muted-foreground">{t("dashboard:recent_activity.no_data")}</p>
            </div>
          ) : (
            <>
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-secondary/20 text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 font-medium text-[11px] uppercase tracking-wider">
                        {t("dashboard:recent_activity.table.id")}
                      </th>
                      <th className="px-4 py-3 font-medium text-[11px] uppercase tracking-wider">
                        {t("dashboard:recent_activity.table.status")}
                      </th>
                      <th className="px-4 py-3 font-medium text-[11px] uppercase tracking-wider">
                        {t("dashboard:recent_activity.table.truck")}
                      </th>
                      <th className="px-4 py-3 font-medium text-[11px] uppercase tracking-wider">
                        {t("dashboard:recent_activity.table.date")}
                      </th>
                      <th className="px-4 py-3 font-medium text-right"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {recentActivities.map((activity) => (
                      <tr
                        key={activity.id}
                        className="hover:bg-accent/50 transition-colors cursor-pointer group"
                        onClick={() => handleActivityClick(activity.shipId)}
                      >
                        <td className="px-4 py-4 font-semibold text-primary">
                          {activity.id}
                        </td>
                        <td className="px-4 py-4">
                          <span className={StatusClasses(activity.rawStatus || activity.status)}>
                            {activity.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-muted-foreground">
                          {activity.truck}
                        </td>
                        <td className="px-4 py-4 text-muted-foreground text-xs">
                          {activity.time}
                        </td>
                        <td className="px-4 py-4 text-right">
                          <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="sm:hidden divide-y divide-border">
                {recentActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="p-4 flex flex-col gap-3 active:bg-accent/50 transition-colors cursor-pointer"
                    onClick={() => handleActivityClick(activity.shipId)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-bold text-primary">
                          {activity.id}
                        </span>
                        <h4 className="font-medium text-sm">
                          {activity.truck}
                        </h4>
                      </div>
                      <span className={StatusClasses(activity.rawStatus || activity.status)}>
                        {activity.status}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {activity.time}
                      </span>
                      <ChevronRight className="h-3 w-3" />
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusClasses(status: string) {
  const base =
    "px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-semibold whitespace-nowrap uppercase tracking-tight";
  const s = status.toLowerCase();

  if (s.includes("transit")) {
    return `${base} bg-blue-500/10 text-blue-500 border border-blue-500/20`;
  }
  if (s.includes("load") || s.includes("assign")) {
    return `${base} bg-amber-500/10 text-amber-500 border border-amber-500/20`;
  }
  if (s.includes("deliver") || s.includes("complete")) {
    return `${base} bg-green-500/10 text-green-500 border border-green-500/20`;
  }

  return `${base} bg-secondary text-secondary-foreground`;
}
