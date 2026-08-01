import { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import { getAppSurface } from "./appSurface";
import { RouteLoadingFallback } from "@/shared/components/RouteLoadingFallback";
import { lazyRoute } from "@/shared/routing/lazyRoute";

const AdminRouter = lazyRoute(
  () => import("../../admin/routes/AdminRouter"),
  "AdminRouter",
);
const StudentRouter = lazyRoute(
  () => import("../../student/routes/StudentRouter"),
  "StudentRouter",
);
const TeacherRouter = lazyRoute(
  () => import("../../teacher/routes/TeacherRouter"),
  "TeacherRouter",
);
const WebsiteRouter = lazyRoute(
  () => import("../../website/routes/WebsiteRouter"),
  "WebsiteRouter",
);
const SigninPage = lazyRoute(
  () => import("../../website/modules/auth/views/SigninPage"),
  "SigninPage",
);

const MainAppRouter = () => {
  return (
    <Suspense fallback={<RouteLoadingFallback />}>
      <Routes>
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute role="admin">
              <AdminRouter />
            </ProtectedRoute>
          }
        />

        <Route
          path="/teacher/*"
          element={
            <ProtectedRoute role="teacher">
              <TeacherRouter />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/*"
          element={
            <ProtectedRoute role="student">
              <StudentRouter />
            </ProtectedRoute>
          }
        />

        <Route path="/*" element={<WebsiteRouter />} />
      </Routes>
    </Suspense>
  );
};

const TeacherSurfaceRouter = () => {
  return (
    <Suspense fallback={<RouteLoadingFallback />}>
      <Routes>
        <Route path="/signin" element={<SigninPage />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute role="teacher">
              <TeacherRouter />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Suspense>
  );
};

const AdminSurfaceRouter = () => {
  return (
    <Suspense fallback={<RouteLoadingFallback />}>
      <Routes>
        <Route path="/signin" element={<SigninPage />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute role="admin">
              <AdminRouter />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Suspense>
  );
};

export const AppRouter = () => {
  const surface = getAppSurface();

  if (surface === "teacher") {
    return <TeacherSurfaceRouter />;
  }

  if (surface === "admin") {
    return <AdminSurfaceRouter />;
  }

  return <MainAppRouter />;
};
