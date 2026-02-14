import { useMemo } from "react";
import { Link } from "react-router-dom";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { useLogisticsControl } from "@/context/LogisticsControlContext";
import { useAdminData } from "@/context/AdminDataContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, Siren, MapPinned } from "lucide-react";

const severityClass = {
  Info: "bg-blue-100 text-blue-700 border-blue-200",
  Warning: "bg-yellow-100 text-yellow-700 border-yellow-200",
  Critical: "bg-red-100 text-red-700 border-red-200",
} as const;

export default function AdminAlerts() {
  const {
    adminNotifications,
    unreadAdminNotifications,
    markAdminNotificationRead,
    markAllAdminNotificationsRead,
  } = useAdminData();
  const {
    notifications,
    exceptionAlerts,
    geofenceAlerts,
    markNotificationRead,
    resolveExceptionAlert,
    resolveGeofenceAlert,
  } = useLogisticsControl();

  const unread = useMemo(() => notifications.filter((notification) => !notification.read), [notifications]);
  const openExceptions = useMemo(() => exceptionAlerts.filter((alert) => alert.status === "Open"), [exceptionAlerts]);
  const openGeo = useMemo(() => geofenceAlerts.filter((alert) => !alert.resolved), [geofenceAlerts]);
  const recentAdminNotifications = useMemo(
    () => adminNotifications.slice(0, 20),
    [adminNotifications]
  );

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Alerts Center</h1>
          <p className="text-muted-foreground">
            Unified push, SMS, and email alerts for status updates, geofence events, and operational exceptions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">New Customer Alerts</p><p className="text-2xl font-bold">{unreadAdminNotifications}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Unread Notifications</p><p className="text-2xl font-bold">{unread.length}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Open Exceptions</p><p className="text-2xl font-bold">{openExceptions.length}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Open Geofence Alerts</p><p className="text-2xl font-bold">{openGeo.length}</p></CardContent></Card>
        </div>

        <Card className="border-border/60">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-lg">New Customer Orders & Requests</CardTitle>
            {unreadAdminNotifications > 0 && (
              <Button size="sm" variant="outline" onClick={markAllAdminNotificationsRead}>
                Mark All Read
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-2">
            {recentAdminNotifications.length === 0 && (
              <p className="text-sm text-muted-foreground">No customer alerts yet.</p>
            )}
            {recentAdminNotifications.map((notification) => (
              <div key={notification.id} className="rounded-md border border-border/60 p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold">{notification.title}</p>
                  {!notification.read && <Badge variant="destructive">New</Badge>}
                </div>
                <p className="text-xs text-muted-foreground">{notification.message}</p>
                <p className="text-xs text-muted-foreground mt-1">{new Date(notification.createdAt).toLocaleString()}</p>
                <div className="mt-2 flex gap-2">
                  <Link to={notification.type === "New Request" ? "/admin/requests" : "/admin/orders"}>
                    <Button size="sm" variant="outline">Manage</Button>
                  </Link>
                  {!notification.read && (
                    <Button size="sm" variant="outline" onClick={() => markAdminNotificationRead(notification.id)}>
                      Mark Read
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2"><Bell className="h-5 w-5" />Shipment Notifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {notifications.slice(0, 20).map((notification) => (
                <div key={notification.id} className="rounded-md border border-border/60 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold">{notification.title}</p>
                    <Badge variant="outline" className={severityClass[notification.severity]}>{notification.severity}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{notification.trackingNumber} | {notification.channel}</p>
                  <p className="text-xs text-muted-foreground mt-1">{notification.message}</p>
                  {!notification.read && (
                    <Button size="sm" variant="outline" className="mt-2" onClick={() => markNotificationRead(notification.id)}>
                      Mark Read
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2"><Siren className="h-5 w-5" />Exception Alerts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {exceptionAlerts.slice(0, 20).map((alert) => (
                <div key={alert.id} className="rounded-md border border-border/60 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold">{alert.type}</p>
                    <Badge variant="outline">{alert.severity}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{alert.trackingNumber} | {alert.status}</p>
                  {alert.note && <p className="text-xs text-muted-foreground mt-1">{alert.note}</p>}
                  {alert.status === "Open" && (
                    <Button size="sm" variant="outline" className="mt-2" onClick={() => resolveExceptionAlert(alert.id, "Resolved by operations desk")}>
                      Resolve
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2"><MapPinned className="h-5 w-5" />Geo-Fence Alerts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {geofenceAlerts.slice(0, 20).map((alert) => (
                <div key={alert.id} className="rounded-md border border-border/60 p-3">
                  <p className="text-sm font-semibold">{alert.zoneName}</p>
                  <p className="text-xs text-muted-foreground">{alert.trackingNumber} | {alert.event}</p>
                  <p className="text-xs text-muted-foreground">{new Date(alert.timestamp).toLocaleString()}</p>
                  {!alert.resolved && (
                    <Button size="sm" variant="outline" className="mt-2" onClick={() => resolveGeofenceAlert(alert.id)}>
                      Resolve
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
