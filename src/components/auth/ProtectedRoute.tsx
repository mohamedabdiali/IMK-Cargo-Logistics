import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

type Role = "admin" | "customer";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: Role;
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  requiredRole,
  redirectTo,
}: ProtectedRouteProps) {
  const { user } = useAuth();
  const fallbackRedirect = requiredRole === "admin" ? "/admin/login" : "/customer/login";
  const targetRedirect = redirectTo ?? fallbackRedirect;

  if (!user) {
    return <Navigate to={targetRedirect} replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to={targetRedirect} replace />;
  }

  return <>{children}</>;
}
