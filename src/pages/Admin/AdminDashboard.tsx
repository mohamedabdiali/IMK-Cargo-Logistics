import { Link } from "react-router-dom";
import {
  AlertTriangle,
  Bell,
  Boxes,
  ClipboardCheck,
  Clock3,
  DollarSign,
  Gauge,
  Search,
  ShieldAlert,
  Truck,
  UserRound,
  Warehouse,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useAdminData } from "@/context/AdminDataContext";
import { useLogisticsControl } from "@/context/LogisticsControlContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import type { AdminNotification, JobStatus } from "@/types/admin";

const statusBadgeClasses: Record<JobStatus, string> = {
  Booked: "bg-blue-100 text-blue-700 border-blue-200",
  "In Transit": "bg-cyan-100 text-cyan-700 border-cyan-200",
  Customs: "bg-amber-100 text-amber-700 border-amber-200",
  "Out for Delivery": "bg-violet-100 text-violet-700 border-violet-200",
  Delivered: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Delayed: "bg-red-100 text-red-700 border-red-200",
  "On Hold": "bg-rose-100 text-rose-700 border-rose-200",
};

const orderFlowRank: Record<JobStatus, number> = {
  Booked: 0,
  "In Transit": 1,
  Customs: 2,
  "Out for Delivery": 3,
  Delivered: 4,
  Delayed: 5,
  "On Hold": 6,
};

const toTitleName = (emailOrName: string) =>
  emailOrName
    .split("@")[0]
    .split(/[.\-_ ]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const getInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

const formatDateTime = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Pending";
  }
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

const formatAlertTime = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Now";
  }
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const clampPercent = (value: number) => Math.max(0, Math.min(100, Math.round(value)));

const getAdminAlertPath = (notification: AdminNotification) =>
  notification.type === "New Request" ? "/admin/requests" : "/admin/orders";

export default function AdminDashboard() {
  const { user } = useAuth();
  const {
    analytics,
    cargoJobs,
    customsEntries,
    fleetUnits,
    warehouseRecords,
    serviceRequests,
    adminNotifications,
    unreadAdminNotifications,
    markAdminNotificationRead,
  } = useAdminData();
  const { exceptionAlerts, invoices } = useLogisticsControl();

  const inTransitOrders = cargoJobs.filter(
    (job) => job.status === "In Transit" || job.status === "Out for Delivery"
  ).length;
  const customsHolds = customsEntries.filter((entry) => entry.status === "On Hold").length;
  const awaitingRequests = serviceRequests.filter((request) =>
    ["Requested", "Quoted", "Awaiting Approval"].includes(request.stage)
  ).length;
  const activeFleet = fleetUnits.filter((unit) => unit.status === "En Route").length;
  const warehouseActive = warehouseRecords.filter((record) => record.status !== "Dispatched").length;
  const openExceptions = exceptionAlerts.filter((alert) => alert.status === "Open").length;
  const unpaidInvoices = invoices.filter((invoice) => invoice.status !== "Paid").length;
  const todayCreatedOrders = cargoJobs.filter((job) => {
    const date = new Date(job.createdAt);
    const now = new Date();
    return (
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth() &&
      date.getDate() === now.getDate()
    );
  }).length;

  const displayName = user?.name?.trim() || (user?.email ? toTitleName(user.email) : "Operations Admin");
  const displayDate = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const recentAdminAlerts = adminNotifications.slice(0, 5);
  const operationsBoardOrders = [...cargoJobs]
    .sort((a, b) => {
      const rankDiff = orderFlowRank[a.status] - orderFlowRank[b.status];
      if (rankDiff !== 0) {
        return rankDiff;
      }

      const etaA = new Date(a.eta).getTime();
      const etaB = new Date(b.eta).getTime();
      if (!Number.isNaN(etaA) && !Number.isNaN(etaB) && etaA !== etaB) {
        return etaA - etaB;
      }

      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    })
    .slice(0, 6);

  const kpiCards = [
    {
      title: "Total Orders",
      value: analytics.totalJobs.toLocaleString(),
      note: `+${todayCreatedOrders} created today`,
      noteClass: "text-emerald-600",
      icon: Boxes,
      iconClass: "bg-sky-100 text-sky-700",
    },
    {
      title: "Active Orders",
      value: analytics.activeJobs.toLocaleString(),
      note: `${inTransitOrders} in transit`,
      noteClass: "text-slate-500",
      icon: Truck,
      iconClass: "bg-cyan-100 text-cyan-700",
    },
    {
      title: "On-Time Delivery",
      value: `${analytics.onTimeRate}%`,
      note: "Service reliability",
      noteClass: "text-emerald-600",
      icon: Clock3,
      iconClass: "bg-emerald-100 text-emerald-700",
    },
    {
      title: "Customs Holds",
      value: customsHolds.toLocaleString(),
      note: `${customsEntries.length} files in desk`,
      noteClass: customsHolds > 0 ? "text-red-600" : "text-slate-500",
      icon: ShieldAlert,
      iconClass: "bg-amber-100 text-amber-700",
    },
    {
      title: "Fleet Active",
      value: `${activeFleet}/${fleetUnits.length}`,
      note: `${analytics.fleetUtilization}% utilization`,
      noteClass: "text-slate-500",
      icon: Gauge,
      iconClass: "bg-violet-100 text-violet-700",
    },
    {
      title: "Warehouse Flow",
      value: warehouseActive.toLocaleString(),
      note: `${warehouseRecords.length} active records`,
      noteClass: "text-slate-500",
      icon: Warehouse,
      iconClass: "bg-indigo-100 text-indigo-700",
    },
    {
      title: "Customer Requests",
      value: awaitingRequests.toLocaleString(),
      note: "Need quotation or approval",
      noteClass: "text-slate-500",
      icon: ClipboardCheck,
      iconClass: "bg-teal-100 text-teal-700",
    },
    {
      title: "Billing & Payments",
      value: unpaidInvoices.toLocaleString(),
      note: `${openExceptions} open exceptions`,
      noteClass: unpaidInvoices > 0 ? "text-red-600" : "text-emerald-600",
      icon: DollarSign,
      iconClass: "bg-rose-100 text-rose-700",
    },
  ];

  const activeCustomsCases = customsEntries.filter(
    (entry) => entry.status !== "Cleared" && entry.status !== "Rejected"
  ).length;
  const departmentLoad = [
    {
      label: "Customs Clearance",
      value: clampPercent((activeCustomsCases / Math.max(1, customsEntries.length)) * 100),
      detail: `${activeCustomsCases} active files`,
      barClass: "bg-rose-500",
    },
    {
      label: "Operations Orders",
      value: clampPercent((analytics.activeJobs / Math.max(1, analytics.totalJobs)) * 100),
      detail: `${analytics.activeJobs} active orders`,
      barClass: "bg-blue-500",
    },
    {
      label: "Warehouse Operations",
      value: clampPercent((warehouseActive / Math.max(1, warehouseRecords.length)) * 100),
      detail: `${warehouseActive} cargos in flow`,
      barClass: "bg-cyan-500",
    },
    {
      label: "Fleet Control",
      value: clampPercent(analytics.fleetUtilization),
      detail: `${activeFleet} units en route`,
      barClass: "bg-emerald-500",
    },
  ];

  return (
    <div className="flex min-h-screen bg-[#f3f6fb]">
      <AdminSidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-6 py-4 backdrop-blur md:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="relative w-full max-w-2xl">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                placeholder="Search orders, customers, tracking numbers..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-700 outline-none transition focus:border-cyan-500 focus:bg-white"
              />
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/admin/alerts"
                className="relative rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 transition hover:bg-slate-50"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4" />
                {unreadAdminNotifications > 0 && (
                  <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-red-500 px-1.5 text-center text-[10px] font-semibold text-white">
                    {unreadAdminNotifications}
                  </span>
                )}
              </Link>
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-600/15 text-teal-700">
                  <UserRound className="h-4 w-4" />
                </div>
                <div className="leading-tight">
                  <p className="text-sm font-semibold text-slate-800">{displayName}</p>
                  <p className="text-xs text-slate-500">Operations Administrator</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="space-y-6 p-6 md:p-8">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">Cargo Control Tower</h1>
            <p className="mt-1 text-slate-500">
              Cargo and logistics control overview for clearing, forwarding, and final delivery.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {kpiCards.map((card) => (
              <Card key={card.title} className="rounded-2xl border border-slate-200 shadow-sm">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm text-slate-500">{card.title}</p>
                      <p className="mt-2 text-4xl font-semibold leading-none text-slate-900">
                        {card.value}
                      </p>
                      <p className={cn("mt-2 text-sm", card.noteClass)}>{card.note}</p>
                    </div>
                    <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", card.iconClass)}>
                      <card.icon className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
            <Card className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm xl:col-span-8">
              <CardHeader className="flex flex-row items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
                <CardTitle className="text-xl text-slate-900">Today&apos;s Operations Orders Board</CardTitle>
                <span className="text-sm text-slate-500">{displayDate}</span>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-slate-200">
                  {operationsBoardOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between gap-4 px-6 py-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-700">
                          {getInitials(order.clientName)}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-slate-900">{order.clientName}</p>
                          <p className="truncate text-sm text-slate-500">
                            {order.id} | {order.trackingNumber} | {order.origin} to {order.destination}
                          </p>
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-sm text-slate-500">{formatDateTime(order.createdAt)}</p>
                        <span
                          className={cn(
                            "mt-1 inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium",
                            statusBadgeClasses[order.status]
                          )}
                        >
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t border-slate-200 px-6 py-4">
                  <Link
                    to="/admin/orders"
                    className="text-sm font-medium text-cyan-700 transition hover:text-cyan-800"
                  >
                    View Full Operations Board
                  </Link>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6 xl:col-span-4">
              <Card className="rounded-2xl border border-slate-200 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl text-slate-900">New Customer Alerts</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {recentAdminAlerts.length === 0 && (
                    <p className="text-sm text-slate-500">No new customer request or order alerts.</p>
                  )}
                  {recentAdminAlerts.map((notification) => (
                    <div key={notification.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{notification.title}</p>
                          <p className="text-xs text-slate-500">{notification.message}</p>
                          <p className="mt-1 text-xs text-slate-400">{formatAlertTime(notification.createdAt)}</p>
                        </div>
                        {!notification.read && (
                          <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-700">
                            New
                          </span>
                        )}
                      </div>
                      <div className="mt-3 flex gap-2">
                        <Link to={getAdminAlertPath(notification)}>
                          <Button size="sm" variant="outline">Manage</Button>
                        </Link>
                        {!notification.read && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => markAdminNotificationRead(notification.id)}
                          >
                            Mark Read
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="rounded-2xl border border-slate-200 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl text-slate-900">Operations Load</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {departmentLoad.map((item) => (
                    <div key={item.label}>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span className="font-medium text-slate-700">{item.label}</span>
                        <span className="text-slate-500">{item.detail}</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={cn("h-full rounded-full", item.barClass)}
                          style={{ width: `${item.value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      <span>{openExceptions} operational exceptions require attention.</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
