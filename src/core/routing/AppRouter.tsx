import { Routes, Route } from "react-router-dom";
import { WebsiteRouter } from "../../website/routes/WebsiteRouter";
import { AdminRouter } from "../../admin/routes/AdminRouter";
import { StudentRouter } from "../../student/routes/StudentRouter";
import { TeacherRouter } from "../../teacher/routes/TeacherRouter";
import { SigninPage } from "../../website/modules/auth";
import { ProtectedRoute } from "./ProtectedRoute";
import { getAppSurface } from "./appSurface";

const MainAppRouter = () => {
  return (
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
  );
};

const TeacherSurfaceRouter = () => {
  return (
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
  );
};

const AdminSurfaceRouter = () => {
  return (
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
