import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function AdminRoute() {
  const { user } = useAuth();

  // Redirect non-ADMIN users to /pos instead of /dashboard to avoid redirect loops
  if (user?.role !== "ADMIN") {
    return <Navigate to="/pos" replace />;
  }

  return <Outlet />;
}