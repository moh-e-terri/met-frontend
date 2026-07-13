import { Routes, Route } from "react-router-dom";
import { TeacherLayout } from "../layouts/TeacherLayout";
import { TeacherHomePage } from "../modules/dashboard";
import { TeacherCourseEditorPage } from "../modules/courses";
import { TeacherCommunityPage } from "../modules/community";
import { TeacherChatsPage } from "../modules/chats";
import { TeacherPaymentsPage } from "../modules/payments";
import { AccountSettingsPage } from "@/shared/modules/settings/AccountSettingsPage";

export const TeacherRouter = () => {
  return (
    <Routes>
      <Route element={<TeacherLayout />}>
        <Route index element={<TeacherHomePage />} />
        <Route path="courses/:courseId" element={<TeacherCourseEditorPage />} />
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
  );
};
