import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/core/auth/AuthContext";
import {
  getTeacherHomePath,
  isTeacherSurface,
} from "@/core/routing/appSurface";
import type { UserRole } from "@/core/auth/types";
import type { ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
  role?: UserRole;
}

function getRoleHome(role: UserRole): string {
  if (role === "admin") return "/admin";
  if (role === "teacher") return getTeacherHomePath();
  return "/student";
}

export const ProtectedRoute = ({ children, role }: ProtectedRouteProps) => {
  const { session, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8f7f5]">
        <p className="text-[#64748b]">جاري التحميل...</p>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/signin" replace state={{ from: location.pathname }} />;
  }

  if (role && session.role !== role) {
    if (isTeacherSurface() && session.role === "teacher") {
      return <Navigate to="/" replace />;
    }
    return <Navigate to={getRoleHome(session.role)} replace />;
  }

  return children;
};
