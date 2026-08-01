import { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { AdminLayout } from "../layouts/AdminLayout";
import { RouteLoadingFallback } from "@/shared/components/RouteLoadingFallback";
import { lazyRoute } from "@/shared/routing/lazyRoute";

const AdminHomePage = lazyRoute(
  () => import("../modules/dashboard/views/AdminHomePage"),
  "AdminHomePage",
);
const AdminCoursesPage = lazyRoute(
  () => import("../modules/courses/views/AdminCoursesPage"),
  "AdminCoursesPage",
);
const AdminCourseDetailsPage = lazyRoute(
  () => import("../modules/courses/views/AdminCourseDetailsPage"),
  "AdminCourseDetailsPage",
);
const AdminCourseCommunityPage = lazyRoute(
  () => import("../modules/courses/views/AdminCourseCommunityPage"),
  "AdminCourseCommunityPage",
);
const AdminLecturersPage = lazyRoute(
  () => import("../modules/lecturers/views/AdminLecturersPage"),
  "AdminLecturersPage",
);
const AdminLecturerProfilePage = lazyRoute(
  () => import("../modules/lecturers/views/AdminLecturerProfilePage"),
  "AdminLecturerProfilePage",
);
const AdminPlatformOverviewPage = lazyRoute(
  () => import("../modules/overview/views/AdminPlatformOverviewPage"),
  "AdminPlatformOverviewPage",
);
const AdminStudentsPage = lazyRoute(
  () => import("../modules/students/views/AdminStudentsPage"),
  "AdminStudentsPage",
);
const AdminStudentProfilePage = lazyRoute(
  () => import("../modules/students/views/AdminStudentProfilePage"),
  "AdminStudentProfilePage",
);
const AdminFinancialsPage = lazyRoute(
  () => import("../modules/financials/views/AdminFinancialsPage"),
  "AdminFinancialsPage",
);
const AdminCommunityPage = lazyRoute(
  () => import("../modules/community/views/AdminCommunityPage"),
  "AdminCommunityPage",
);
const AdminChatsPage = lazyRoute(
  () => import("../modules/chats/views/AdminChatsPage"),
  "AdminChatsPage",
);
const AccountSettingsPage = lazyRoute<{ title?: string; subtitle?: string }>(
  () => import("@/shared/modules/settings/AccountSettingsPage"),
  "AccountSettingsPage",
);

const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="rounded-3xl border border-[#e2e8f0] bg-white p-8 text-right shadow-sm" dir="rtl">
    <h2 className="text-2xl font-bold text-[#0f172a]">{title}</h2>
    <p className="mt-2 text-[#64748b]">هذه الصفحة قيد التطوير.</p>
  </div>
);

export const AdminRouter = () => {
  return (
    <Suspense fallback={<RouteLoadingFallback />}>
      <Routes>
        <Route element={<AdminLayout />}>
          <Route index element={<AdminHomePage />} />
          <Route path="courses" element={<AdminCoursesPage />} />
          <Route path="courses/:courseId" element={<AdminCourseDetailsPage />} />
          <Route
            path="courses/:courseId/community"
            element={<AdminCourseCommunityPage />}
          />
          <Route path="lecturers" element={<AdminLecturersPage />} />
          <Route path="lecturers/:lecturerId" element={<AdminLecturerProfilePage />} />
          <Route path="overview" element={<AdminPlatformOverviewPage />} />
          <Route path="students" element={<AdminStudentsPage />} />
          <Route path="students/:studentId" element={<AdminStudentProfilePage />} />
          <Route path="community" element={<AdminCommunityPage />} />
          <Route path="chats" element={<AdminChatsPage />} />
          <Route path="financials" element={<AdminFinancialsPage />} />
          <Route
            path="settings"
            element={<AccountSettingsPage title="إعدادات المدير" />}
          />
          <Route
            path="support"
            element={<PlaceholderPage title="الدعم الفني" />}
          />
          <Route
            path="*"
            element={
              <div className="text-[#64748b]" dir="rtl">
                صفحة غير موجودة
              </div>
            }
          />
        </Route>
      </Routes>
    </Suspense>
  );
};
