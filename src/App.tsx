import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { AdminDataProvider } from "@/context/AdminDataContext";
import { LogisticsControlProvider } from "@/context/LogisticsControlContext";
import { BackToTopButton } from "@/components/layout/BackToTopButton";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import ClearingForwarding from "./pages/ClearingForwarding";
import About from "./pages/About";
import Contact from "./pages/Contact";
import TrackShipment from "./pages/TrackShipment";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/Admin/AdminLogin";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminOrders from "./pages/Admin/AdminOrders";
import AdminAnalytics from "./pages/Admin/AdminAnalytics";
import AdminProducts from "./pages/Admin/AdminProducts";
import AdminInventory from "./pages/Admin/AdminInventory";
import AdminShipments from "./pages/Admin/AdminShipments";
import AdminCustomers from "./pages/Admin/AdminCustomers";
import AdminFleet from "./pages/Admin/AdminFleet";
import AdminRequests from "./pages/Admin/AdminRequests";
import AdminProcessFlow from "./pages/Admin/AdminProcessFlow";
import CustomerLogin from "./pages/Customer/CustomerLogin";
import CustomerPortal from "./pages/Customer/CustomerPortal";
import AdminCompliance from "./pages/Admin/AdminCompliance";
import AdminCarriers from "./pages/Admin/AdminCarriers";
import AdminRoutes from "./pages/Admin/AdminRoutes";
import AdminBilling from "./pages/Admin/AdminBilling";
import AdminAlerts from "./pages/Admin/AdminAlerts";
import AdminMobile from "./pages/Admin/AdminMobile";

const queryClient = new QueryClient();
const routerBase = import.meta.env.BASE_URL.endsWith("/")
  ? import.meta.env.BASE_URL.slice(0, -1)
  : import.meta.env.BASE_URL;

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <AdminDataProvider>
        <LogisticsControlProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter basename={routerBase || "/"}>
              <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/services" element={<ClearingForwarding />} />
              <Route path="/quote" element={<ClearingForwarding />} />
              <Route path="/track" element={<TrackShipment />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/customer/login" element={<CustomerLogin />} />
              <Route
                path="/customer/portal"
                element={<ProtectedRoute requiredRole="customer"><CustomerPortal /></ProtectedRoute>}
              />

              <Route path="/admin/login" element={<AdminLogin />} />
              <Route
                path="/admin"
                element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>}
              />
              <Route
                path="/admin/requests"
                element={<ProtectedRoute requiredRole="admin"><AdminRequests /></ProtectedRoute>}
              />
              <Route
                path="/admin/orders"
                element={<ProtectedRoute requiredRole="admin"><AdminOrders /></ProtectedRoute>}
              />
              <Route
                path="/admin/customs"
                element={<ProtectedRoute requiredRole="admin"><AdminProducts /></ProtectedRoute>}
              />
              <Route
                path="/admin/warehouse"
                element={<ProtectedRoute requiredRole="admin"><AdminInventory /></ProtectedRoute>}
              />
              <Route
                path="/admin/shipments"
                element={<ProtectedRoute requiredRole="admin"><AdminShipments /></ProtectedRoute>}
              />
              <Route
                path="/admin/fleet"
                element={<ProtectedRoute requiredRole="admin"><AdminFleet /></ProtectedRoute>}
              />
              <Route
                path="/admin/clients"
                element={<ProtectedRoute requiredRole="admin"><AdminCustomers /></ProtectedRoute>}
              />
              <Route
                path="/admin/process"
                element={<ProtectedRoute requiredRole="admin"><AdminProcessFlow /></ProtectedRoute>}
              />
              <Route
                path="/admin/intelligence"
                element={<ProtectedRoute requiredRole="admin"><AdminAnalytics /></ProtectedRoute>}
              />
              <Route
                path="/admin/compliance"
                element={<ProtectedRoute requiredRole="admin"><AdminCompliance /></ProtectedRoute>}
              />
              <Route
                path="/admin/carriers"
                element={<ProtectedRoute requiredRole="admin"><AdminCarriers /></ProtectedRoute>}
              />
              <Route
                path="/admin/routes"
                element={<ProtectedRoute requiredRole="admin"><AdminRoutes /></ProtectedRoute>}
              />
              <Route
                path="/admin/billing"
                element={<ProtectedRoute requiredRole="admin"><AdminBilling /></ProtectedRoute>}
              />
              <Route
                path="/admin/alerts"
                element={<ProtectedRoute requiredRole="admin"><AdminAlerts /></ProtectedRoute>}
              />
              <Route
                path="/admin/mobile"
                element={<ProtectedRoute requiredRole="admin"><AdminMobile /></ProtectedRoute>}
              />

              {/* Backward-compatible legacy admin routes */}
              <Route path="/admin/jobs" element={<ProtectedRoute requiredRole="admin"><AdminOrders /></ProtectedRoute>} />
              <Route path="/admin/products" element={<ProtectedRoute requiredRole="admin"><AdminProducts /></ProtectedRoute>} />
              <Route path="/admin/inventory" element={<ProtectedRoute requiredRole="admin"><AdminInventory /></ProtectedRoute>} />
              <Route path="/admin/customers" element={<ProtectedRoute requiredRole="admin"><AdminCustomers /></ProtectedRoute>} />
              <Route path="/admin/analytics" element={<ProtectedRoute requiredRole="admin"><AdminAnalytics /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
              </Routes>
              <BackToTopButton />
            </BrowserRouter>
          </TooltipProvider>
        </LogisticsControlProvider>
      </AdminDataProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
