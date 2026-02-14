import { useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Anchor,
  ArrowLeft,
  BarChart3,
  BadgeCheck,
  BriefcaseBusiness,
  Car,
  ClipboardCheck,
  FileText,
  LayoutDashboard,
  BellRing,
  Map,
  MapPin,
  Network,
  LogOut,
  Phone,
  ShieldCheck,
  Smartphone,
  Truck,
  Users,
  Warehouse,
  Workflow,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useAdminData } from "@/context/AdminDataContext";
import { toast } from "@/hooks/use-toast";
import { ADMIN_LABELS, COMPANY_CONTACT, buildWhatsAppChatUrl } from "@/constants/operations";

const flowItems = [
  { icon: ClipboardCheck, label: ADMIN_LABELS.customerRequests, path: "/admin/requests" },
  { icon: BriefcaseBusiness, label: ADMIN_LABELS.operationsOrders, path: "/admin/orders" },
  { icon: Truck, label: ADMIN_LABELS.shipmentTracking, path: "/admin/shipments" },
  { icon: ShieldCheck, label: ADMIN_LABELS.customsClearance, path: "/admin/customs" },
  { icon: Warehouse, label: ADMIN_LABELS.warehouseOperations, path: "/admin/warehouse" },
  { icon: Car, label: ADMIN_LABELS.fleetControl, path: "/admin/fleet" },
  { icon: FileText, label: ADMIN_LABELS.billingAndPayments, path: "/admin/billing" },
  { icon: BellRing, label: ADMIN_LABELS.alertsCenter, path: "/admin/alerts" },
  { icon: Workflow, label: ADMIN_LABELS.endToEndProcess, path: "/admin/process" },
];

const operationsItems = [
  { icon: LayoutDashboard, label: ADMIN_LABELS.cargoControlTower, path: "/admin" },
  { icon: BadgeCheck, label: ADMIN_LABELS.complianceEngine, path: "/admin/compliance" },
  { icon: Network, label: ADMIN_LABELS.carrierConnections, path: "/admin/carriers" },
  { icon: Map, label: ADMIN_LABELS.routeOptimization, path: "/admin/routes" },
  { icon: BarChart3, label: ADMIN_LABELS.operationsIntelligence, path: "/admin/intelligence" },
  { icon: Smartphone, label: ADMIN_LABELS.mobileOps, path: "/admin/mobile" },
  { icon: Users, label: ADMIN_LABELS.customerAccounts, path: "/admin/clients" },
];

export function AdminSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { adminNotifications, unreadAdminNotifications } = useAdminData();
  const previousUnread = useRef(unreadAdminNotifications);
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      previousUnread.current = unreadAdminNotifications;
      return;
    }

    if (unreadAdminNotifications > previousUnread.current) {
      const latestUnread = adminNotifications.find((notification) => !notification.read);
      if (latestUnread) {
        toast({
          title: "New customer activity",
          description: latestUnread.title,
        });
      }
    }
    previousUnread.current = unreadAdminNotifications;
  }, [adminNotifications, unreadAdminNotifications]);

  const isPathActive = (path: string) => {
    if (path === "/admin") {
      return location.pathname === path;
    }
    if (path === "/admin/orders") {
      return location.pathname.startsWith("/admin/orders") || location.pathname.startsWith("/admin/jobs");
    }
    if (path === "/admin/customs") {
      return location.pathname.startsWith("/admin/customs") || location.pathname.startsWith("/admin/products");
    }
    if (path === "/admin/warehouse") {
      return location.pathname.startsWith("/admin/warehouse") || location.pathname.startsWith("/admin/inventory");
    }
    if (path === "/admin/clients") {
      return location.pathname.startsWith("/admin/clients") || location.pathname.startsWith("/admin/customers");
    }
    if (path === "/admin/intelligence") {
      return location.pathname.startsWith("/admin/intelligence") || location.pathname.startsWith("/admin/analytics");
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  return (
    <aside className="w-72 min-h-screen flex flex-col border-r border-slate-800 bg-gradient-to-b from-[#0b1424] to-[#111b2f] text-slate-100">
      <div className="p-6 border-b border-slate-800/90">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-300">
            <Anchor className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold leading-tight">{ADMIN_LABELS.cargoControlTower}</h1>
            <p className="text-xs text-slate-400 mt-0.5">Clearing & Forwarding Platform</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 overflow-y-auto">
        <div className="mb-6">
          <div className="flex items-center justify-between px-4 pb-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
              Quick Panel
            </p>
            {unreadAdminNotifications > 0 && (
              <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-[10px] font-semibold text-red-200">
                {unreadAdminNotifications} new
              </span>
            )}
          </div>
          <div className="mb-4 rounded-xl border border-slate-700/70 bg-slate-900/30 px-4 py-3">
            <div className="space-y-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500/80">
                  Office Location
                </p>
                <p className="mt-1 flex items-center gap-2 text-sm text-slate-200">
                  <MapPin className="h-4 w-4 text-emerald-300" />
                  {COMPANY_CONTACT.officeLocation}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500/80">
                  Phone Line
                </p>
                <a
                  href={buildWhatsAppChatUrl("Admin panel contact line")}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 inline-flex items-center gap-2 text-sm font-medium text-emerald-300 hover:text-emerald-200"
                >
                  <Phone className="h-4 w-4" />
                  {COMPANY_CONTACT.phoneLine}
                </a>
              </div>
            </div>
          </div>
          <p className="px-4 pb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500/80">
            End-to-End Flow
          </p>
          <ul className="space-y-2">
            {flowItems.map((item) => {
              const isActive = isPathActive(item.path);
              const isAlerts = item.path === "/admin/alerts";
              return (
                <li key={`action-${item.label}`}>
                  <Link
                    to={item.path}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-all",
                      isActive
                        ? "bg-slate-800 text-emerald-300 font-medium"
                        : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    <span className="flex-1">{item.label}</span>
                    {isAlerts && unreadAdminNotifications > 0 && (
                      <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-[10px] font-semibold text-red-200">
                        {unreadAdminNotifications}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        <p className="px-4 pb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
          Operations Modules
        </p>
        <ul className="space-y-2">
          {operationsItems.map((item) => {
            const isActive = isPathActive(item.path);
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-all",
                    isActive
                      ? "bg-slate-800 text-emerald-300 font-medium"
                      : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="space-y-2 border-t border-slate-800/90 p-4">
        {user && (
          <p className="truncate rounded-lg bg-slate-800/60 px-4 py-2 text-sm text-slate-300">{user.email}</p>
        )}
        <Link
          to="/"
          className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm text-slate-300 transition-colors hover:bg-slate-800/60 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Website
        </Link>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm text-slate-300 transition-colors hover:bg-slate-800/60 hover:text-white"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}
