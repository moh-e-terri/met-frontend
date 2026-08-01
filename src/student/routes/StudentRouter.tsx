import { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { StudentLayout } from "../layouts/StudentLayout";
import { RouteLoadingFallback } from "@/shared/components/RouteLoadingFallback";
import { lazyRoute } from "@/shared/routing/lazyRoute";

const StudentHomePage = lazyRoute(
  () => import("../modules/dashboard/views/StudentHomePage"),
  "StudentHomePage",
);
const StudentPaymentsPage = lazyRoute(
  () => import("../modules/payments/views/StudentPaymentsPage"),
  "StudentPaymentsPage",
);
const StudentCommunityPage = lazyRoute(
  () => import("../modules/community/views/StudentCommunityPage"),
  "StudentCommunityPage",
);
const StudentChatsPage = lazyRoute(
  () => import("../modules/chats/views/StudentChatsPage"),
  "StudentChatsPage",
);
const StudentCoursePage = lazyRoute(
  () => import("../modules/courses/views/StudentCoursePage"),
  "StudentCoursePage",
);
const StudentCourseCommunityPage = lazyRoute(
  () => import("../modules/courses/views/StudentCourseCommunityPage"),
  "StudentCourseCommunityPage",
);
const StudentCatalogPage = lazyRoute(
  () => import("../modules/catalog/views/StudentCatalogPage"),
  "StudentCatalogPage",
);
const StudentMyCoursesCatalogPage = lazyRoute(
  () => import("../modules/my-courses/views/StudentMyCoursesCatalogPage"),
  "StudentMyCoursesCatalogPage",
);
const StudentMyCourseDetailPage = lazyRoute(
  () => import("../modules/my-courses/views/StudentMyCourseDetailPage"),
  "StudentMyCourseDetailPage",
);
const StudentQuizzesPage = lazyRoute(
  () => import("../modules/quizzes/views/StudentQuizzesPage"),
  "StudentQuizzesPage",
);
const StudentQuizTakePage = lazyRoute(
  () => import("../modules/quizzes/views/StudentQuizTakePage"),
  "StudentQuizTakePage",
);
const StudentAssignmentsPage = lazyRoute(
  () => import("../modules/assignments/views/StudentAssignmentsPage"),
  "StudentAssignmentsPage",
);
const AccountSettingsPage = lazyRoute(
  () => import("@/shared/modules/settings/AccountSettingsPage"),
  "AccountSettingsPage",
);

export const StudentRouter = () => {
  return (
    <Suspense fallback={<RouteLoadingFallback />}>
      <Routes>
        <Route element={<StudentLayout />}>
          <Route index element={<StudentHomePage />} />
          <Route path="payments" element={<StudentPaymentsPage />} />
          <Route path="pay" element={<StudentPaymentsPage />} />
          <Route path="community" element={<StudentCommunityPage />} />
          <Route path="chats" element={<StudentChatsPage />} />
          <Route path="catalog" element={<StudentCatalogPage />} />
          <Route path="courses/:courseId" element={<StudentCoursePage />} />
          <Route
            path="courses/:courseId/community"
            element={<StudentCourseCommunityPage />}
          />
          <Route path="my-courses" element={<StudentMyCoursesCatalogPage />} />
          <Route
            path="my-courses/:courseId"
            element={<StudentMyCourseDetailPage />}
          />
          <Route
            path="my-courses/:courseId/quizzes"
            element={<StudentQuizzesPage />}
          />
          <Route
            path="my-courses/:courseId/quizzes/:examId"
            element={<StudentQuizTakePage />}
          />
          <Route
            path="my-courses/:courseId/assignments"
            element={<StudentAssignmentsPage />}
          />
          <Route path="settings" element={<AccountSettingsPage />} />
          <Route path="*" element={<div>صفحة غير موجودة</div>} />
        </Route>
      </Routes>
    </Suspense>
  );
};
