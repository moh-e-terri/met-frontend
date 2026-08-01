import { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { TeacherLayout } from "../layouts/TeacherLayout";
import { RouteLoadingFallback } from "@/shared/components/RouteLoadingFallback";
import { lazyRoute } from "@/shared/routing/lazyRoute";

const TeacherHomePage = lazyRoute(
  () => import("../modules/dashboard/views/TeacherHomePage"),
  "TeacherHomePage",
);
const TeacherCourseEditorPage = lazyRoute(
  () => import("../modules/courses/views/TeacherCourseEditorPage"),
  "TeacherCourseEditorPage",
);
const TeacherCourseCommunityPage = lazyRoute(
  () => import("../modules/courses/views/TeacherCourseCommunityPage"),
  "TeacherCourseCommunityPage",
);
const TeacherCommunityPage = lazyRoute(
  () => import("../modules/community/views/TeacherCommunityPage"),
  "TeacherCommunityPage",
);
const TeacherChatsPage = lazyRoute(
  () => import("../modules/chats/views/TeacherChatsPage"),
  "TeacherChatsPage",
);
const TeacherPaymentsPage = lazyRoute(
  () => import("../modules/payments/views/TeacherPaymentsPage"),
  "TeacherPaymentsPage",
);
const AccountSettingsPage = lazyRoute(
  () => import("@/shared/modules/settings/AccountSettingsPage"),
  "AccountSettingsPage",
);
const TeacherStudentProfilePage = lazyRoute(
  () => import("../modules/students/views/TeacherStudentProfilePage"),
  "TeacherStudentProfilePage",
);

export const TeacherRouter = () => {
  return (
    <Suspense fallback={<RouteLoadingFallback />}>
      <Routes>
        <Route element={<TeacherLayout />}>
          <Route index element={<TeacherHomePage />} />
          <Route path="courses/:courseId" element={<TeacherCourseEditorPage />} />
          <Route
            path="courses/:courseId/community"
            element={<TeacherCourseCommunityPage />}
          />
          <Route path="students/:studentUserId" element={<TeacherStudentProfilePage />} />
          <Route path="payments" element={<TeacherPaymentsPage />} />
          <Route path="community" element={<TeacherCommunityPage />} />
          <Route path="chats" element={<TeacherChatsPage />} />
          <Route path="settings" element={<AccountSettingsPage />} />
          <Route
            path="*"
            element={<div className="text-[#64748b]">صفحة غير موجودة</div>}
          />
        </Route>
      </Routes>
    </Suspense>
  );
};
