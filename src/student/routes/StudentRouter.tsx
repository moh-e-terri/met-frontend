import { Routes, Route } from "react-router-dom";
import { StudentLayout } from "../layouts/StudentLayout";
import { StudentHomePage } from "../modules/dashboard";
import { StudentPaymentsPage } from "../modules/payments";
import { StudentCommunityPage } from "../modules/community";
import { StudentChatsPage } from "../modules/chats";
import { StudentCoursePage } from "../modules/courses";
import { StudentCatalogPage } from "../modules/catalog";
import {
  StudentMyCourseDetailPage,
  StudentMyCoursesCatalogPage,
} from "../modules/my-courses";
import { StudentQuizzesPage } from "../modules/quizzes";
import { StudentAssignmentsPage } from "../modules/assignments";
import { AccountSettingsPage } from "@/shared/modules/settings/AccountSettingsPage";

export const StudentRouter = () => {
  return (
    <Routes>
      <Route element={<StudentLayout />}>
        <Route index element={<StudentHomePage />} />
        <Route path="payments" element={<StudentPaymentsPage />} />
        <Route path="pay" element={<StudentPaymentsPage />} />
        <Route path="community" element={<StudentCommunityPage />} />
        <Route path="chats" element={<StudentChatsPage />} />
        <Route path="catalog" element={<StudentCatalogPage />} />
        <Route path="courses/:courseId" element={<StudentCoursePage />} />
        <Route path="my-courses" element={<StudentMyCoursesCatalogPage />} />
        <Route path="my-courses/:courseId" element={<StudentMyCourseDetailPage />} />
        <Route path="my-courses/:courseId/quizzes" element={<StudentQuizzesPage />} />
        <Route path="my-courses/:courseId/assignments" element={<StudentAssignmentsPage />} />
        <Route path="settings" element={<AccountSettingsPage />} />
        <Route path="*" element={<div>صفحة غير موجودة</div>} />
      </Route>
    </Routes>
  );
};
