import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "@/app/features/auth/context/AuthContext"

export function ProtectedAdminRoute() {
  const { user, isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />
  }

  if (user?.role !== "admin") {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
