import {
  Truck,
  ClipboardList,
  Tag,
  TrendingUp,
  MapPin,
  Clock,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

const stats = [
  { name: "Active Trucks", value: "12", icon: Truck, change: "+2", changeType: "positive" },
  { name: "Total Orders", value: "48", icon: ClipboardList, change: "+5", changeType: "positive" },
  { name: "Open Quotes", value: "3", icon: Tag, change: "0", changeType: "neutral" },
  { name: "Revenue (ETB)", value: "850,200", icon: TrendingUp, change: "+12.5%", changeType: "positive" },
];

const recentOrders = [
  { id: "ORD-721", route: "Gelile -> Djibouti", status: "In Transit", truck: "ET-A1234", time: "2h ago" },
  { id: "ORD-719", route: "Yibuku -> Djibouti", status: "Loaded", truck: "ET-B5678", time: "5h ago" },
  { id: "ORD-715", route: "Gelile -> Djibouti", status: "Delivered", truck: "ET-C9012", time: "1d ago" },
];

export default function Dashboard() {
  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500 pb-10 sm:pb-0">
      <div className="px-1 sm:px-0">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-brand-primary">Fleet Overview</h2>
        <p className="text-xs sm:text-sm text-muted-foreground">Monitoring your transport operations in real-time.</p>
      </div>

      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="p-3 sm:p-6 bg-card border border-border rounded-xl shadow-none sm:shadow-sm hover:shadow-md transition-shadow">
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

        {/* Recent Orders Table */}
        <div className="bg-card border border-border rounded-xl flex flex-col shadow-none sm:shadow-sm">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              Recent Activity
            </h3>
            <button className="text-xs text-primary hover:underline font-medium">View all</button>
          </div>
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-secondary/20 text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Order ID</th>
                  <th className="px-4 py-3 font-medium">Route</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Truck</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-accent/50 transition-colors cursor-pointer">
                    <td className="px-4 py-4 font-semibold text-primary">{order.id}</td>
                    <td className="px-4 py-4">{order.route}</td>
                    <td className="px-4 py-4">
                      <span className={StatusClasses(order.status)}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-muted-foreground">{order.truck}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="sm:hidden divide-y divide-border">
            {recentOrders.map((order) => (
              <div key={order.id} className="p-4 flex flex-col gap-3 active:bg-accent/50 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-semibold text-primary">{order.id}</span>
                    <h4 className="font-medium">{order.route}</h4>
                  </div>
                  <span className={StatusClasses(order.status)}>
                    {order.status}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Truck className="h-3 w-3" /> {order.truck}
                  </span>
                  <span>{order.time}</span>
                </div>
              </div>
            ))}
          </div>
          {recentOrders.length === 0 && (
            <div className="py-20 text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
              <p className="text-muted-foreground">No recent activity found.</p>
            </div>
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
  const base = "px-2.5 py-1 rounded-full text-xs font-semibold";
  switch (status) {
    case "In Transit": return `${base} bg-blue-500/10 text-blue-500 border border-blue-500/20`;
    case "Loaded": return `${base} bg-amber-500/10 text-amber-500 border border-amber-500/20`;
    case "Delivered": return `${base} bg-green-500/10 text-green-500 border border-green-500/20`;
    default: return `${base} bg-secondary text-secondary-foreground`;
  }
}
