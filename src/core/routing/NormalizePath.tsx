import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";

function normalizePathname(pathname: string): string {
  const normalized = pathname.replace(/\/{2,}/g, "/");
  return normalized.length > 1 && normalized.endsWith("/")
    ? normalized.slice(0, -1)
    : normalized;
}

export const NormalizePath = ({ children }: { children: ReactNode }) => {
  const { pathname, search, hash } = useLocation();
  const normalized = normalizePathname(pathname);

  if (normalized !== pathname) {
    return <Navigate to={`${normalized}${search}${hash}`} replace />;
  }

  return children;
};
