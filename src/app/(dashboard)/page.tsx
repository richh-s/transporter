"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Truck,
  ClipboardList,
  Tag,
  TrendingUp,
  MapPin,
  Clock,
  AlertCircle,
  Loader2,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { shipApi } from "@/lib/api/ships";
import { truckApi } from "@/lib/api/trucks";
import { PriceQuoteService } from "@/lib/price-quote-api";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/utils";

interface DashboardStat {
  name: string;
  value: string;
  icon: any;
  change: string;
  changeType: "positive" | "negative" | "neutral";
}

interface Activity {
  id: string;
  shipId: number;
  route: string;
  status: string;
  truck: string;
  time: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStat[]>([
    { name: "Active Trucks", value: "--", icon: Truck, change: "0", changeType: "neutral" },
    { name: "Total Orders", value: "--", icon: ClipboardList, change: "0", changeType: "neutral" },
    { name: "Open Quotes", value: "--", icon: Tag, change: "0", changeType: "neutral" },
    { name: "Revenue (ETB)", value: "--", icon: TrendingUp, change: "0", changeType: "neutral" },
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
      const allShipItems = ships.flatMap((ship: any) =>
        (ship.ship_items || []).map((item: any) => ({
          ...item,
          // Inject ship-level data needed for display
          ship_id: ship.id,
          pickup_date: ship.pickup_date,
          origin: ship.origin,
          destination: ship.destination
        }))
      );

      // Calculate revenue from these items
      const revenue = allShipItems.reduce((acc: number, item: any) => acc + (Number(item.computed_price) || 0), 0);

      // 3. Fetch Quotes
      const quotesRes = await PriceQuoteService.listQuotes(1, 1);
      const totalQuotes = quotesRes.total || 0;

      setStats([
        {
          name: "Active Trucks",
          value: totalTrucks.toString(),
          icon: Truck,
          change: "Live",
          changeType: "positive"
        },
        {
          name: "Total Orders",
          value: totalOrders.toString(),
          icon: ClipboardList,
          change: "Updated",
          changeType: "positive"
        },
        {
          name: "Open Quotes",
          value: totalQuotes.toString(),
          icon: Tag,
          change: "Current",
          changeType: "neutral"
        },
        {
          name: "Revenue (ETB)",
          value: formatCurrency(revenue, "ETB").replace("ETB", "").trim(),
          icon: TrendingUp,
          change: "Page Total",
          changeType: "positive"
        }
      ]);

      // 4. Map Recent Activity (Filter for items with at least one assignment)
      const activities: Activity[] = allShipItems
        .filter((item: any) => {
          const hasTruck = item.truck_id || item.assigned_truck_id || item.assigned_truck?.id || item.truck?.id;
          const hasDriver = item.driver_id || item.assigned_driver_id || item.assigned_driver?.id || item.driver?.id;
          return hasTruck || hasDriver;
        })
        .sort((a: any, b: any) => b.id - a.id) // Show newest first
        .slice(0, 5) // Limit to 5
        .map((item: any) => {
          const hasTruck = item.truck_id || item.assigned_truck_id || item.assigned_truck?.id || item.truck?.id;
          const hasDriver = item.driver_id || item.assigned_driver_id || item.assigned_driver?.id || item.driver?.id;
          const isFull = hasTruck && hasDriver;

          return {
            id: `ORD-${item.id}`,
            shipId: item.ship_id,
            route: `${item.origin || 'N/A'} → ${item.destination || 'N/A'}`,
            status: isFull ? "Full Assigned" : "Partial Assigned",
            truck: item.assigned_truck?.plate_number || item.truck?.plate_number || (hasTruck ? "Truck Assigned" : "Driver Assigned"),
            time: item.created_at ? new Date(item.created_at).toLocaleDateString() : "Recent"
          };
        });
      setRecentActivities(activities);

    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoadingStats(false);
      setLoadingActivity(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleActivityClick = (shipId: number) => {
    router.push(`/ships/placeholder?id=${shipId}`);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500 pb-10 sm:pb-0">
      <div className="px-1 sm:px-0 flex justify-between items-end">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-brand-primary">Fleet Overview</h2>
          <p className="text-xs sm:text-sm text-muted-foreground">Monitoring your transport operations in real-time.</p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="text-xs text-primary hover:underline flex items-center gap-1"
        >
          <Loader2 className={cn("h-3 w-3", loadingStats && "animate-spin")} />
          Refresh
        </button>
      </div>

      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="p-3 sm:p-6 bg-card border border-border rounded-xl shadow-none sm:shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
            {loadingStats && (
              <div className="absolute inset-0 bg-card/60 flex items-center justify-center z-10 backdrop-blur-[1px]">
                <Loader2 className="h-4 w-4 animate-spin text-primary opacity-20" />
              </div>
            )}
            <div className="flex items-center justify-between">
              <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg">
                <stat.icon className="h-4 w-4 sm:h-6 sm:w-6 text-primary" />
              </div>
              <span className={cn(StatChangeClasses(stat.changeType), "text-[10px] sm:text-xs")}>
                {stat.change}
              </span>
            </div>
            <div className="mt-2 sm:mt-4">
              <h3 className="text-[10px] sm:text-sm font-medium text-muted-foreground truncate uppercase tracking-wider">{stat.name}</h3>
              <p className="text-xl sm:text-3xl font-bold mt-0.5 sm:mt-1">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Active Shipments Map Placeholder */}
        <div className="bg-card border border-border rounded-xl overflow-hidden min-h-[400px] flex flex-col shadow-none sm:shadow-sm">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2">
              <MapPin className="h-4 w-4 text-red-500" />
              Live Fleet Location
            </h3>
            <span className="text-xs bg-green-500/10 text-green-500 px-2 py-1 rounded-full animate-pulse">
              Live
            </span>
          </div>
          <div className="flex-1 bg-secondary/30 flex items-center justify-center p-8 text-center">
            <div className="max-w-xs space-y-4">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="h-8 w-8 text-primary opacity-50" />
              </div>
              <p className="text-sm text-muted-foreground">
                GPS Tracking Map Integration<br />
                (Phase 3 Deployment)
              </p>
            </div>
          </div>
        </div>

        {/* Recent Activity Table */}
        <div className="bg-card border border-border rounded-xl flex flex-col shadow-none sm:shadow-sm">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              Recent Activity
            </h3>
            <button
              onClick={() => router.push('/ships')}
              className="text-xs text-primary hover:underline font-medium"
            >
              View all
            </button>
          </div>

          {loadingActivity ? (
            <div className="flex-1 flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary opacity-50" />
            </div>
          ) : recentActivities.length === 0 ? (
            <div className="py-20 text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
              <p className="text-muted-foreground">No recent activity found.</p>
            </div>
          ) : (
            <>
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-secondary/20 text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 font-medium text-[11px] uppercase tracking-wider">ID</th>
                      <th className="px-4 py-3 font-medium text-[11px] uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 font-medium text-[11px] uppercase tracking-wider">Truck</th>
                      <th className="px-4 py-3 font-medium text-[11px] uppercase tracking-wider">Date</th>
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
                        <td className="px-4 py-4 font-semibold text-primary">{activity.id}</td>
                        <td className="px-4 py-4">
                          <span className={StatusClasses(activity.status)}>
                            {activity.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-muted-foreground">{activity.truck}</td>
                        <td className="px-4 py-4 text-muted-foreground text-xs">{activity.time}</td>
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
                        <span className="text-[10px] font-bold text-primary">{activity.id}</span>
                        <h4 className="font-medium text-sm">{activity.truck}</h4>
                      </div>
                      <span className={StatusClasses(activity.status)}>
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

function StatChangeClasses(type: string) {
  switch (type) {
    case "positive": return "text-xs font-bold text-green-500 bg-green-500/10 px-2 py-1 rounded-full";
    case "negative": return "text-xs font-bold text-red-500 bg-red-500/10 px-2 py-1 rounded-full";
    default: return "text-xs font-bold text-muted-foreground bg-muted-foreground/10 px-2 py-1 rounded-full";
  }
}

function StatusClasses(status: string) {
  const base = "px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-semibold whitespace-nowrap uppercase tracking-tight";
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
