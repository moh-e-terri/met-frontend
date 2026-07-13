import { Routes, Route } from "react-router-dom";
import { AdminLayout } from "../layouts/AdminLayout";
import { AdminHomePage } from "../modules/dashboard";
import { AdminCoursesPage } from "../modules/courses";
import { AdminLecturersPage } from "../modules/lecturers";
import { AdminStudentsPage } from "../modules/students";
import { AdminFinancialsPage } from "../modules/financials";
import { AccountSettingsPage } from "@/shared/modules/settings/AccountSettingsPage";

const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="rounded-3xl border border-[#e2e8f0] bg-white p-8 text-right shadow-sm" dir="rtl">
    <h2 className="text-2xl font-bold text-[#0f172a]">{title}</h2>
    <p className="mt-2 text-[#64748b]">هذه الصفحة قيد التطوير.</p>
  </div>
);

export const AdminRouter = () => {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<AdminHomePage />} />
        <Route path="courses" element={<AdminCoursesPage />} />
        <Route path="lecturers" element={<AdminLecturersPage />} />
        <Route path="students" element={<AdminStudentsPage />} />
        <Route path="financials" element={<AdminFinancialsPage />} />
        <Route path="settings" element={<AccountSettingsPage title="إعدادات المدير" />} />
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
  );
};
