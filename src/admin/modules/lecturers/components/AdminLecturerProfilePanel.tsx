import { CountUp } from "@/shared/motion";
import type { AdminLecturer } from "../data/mockAdminLecturers";
import { AdminIcon } from "../../dashboard/components/AdminIcon";

interface AdminLecturerProfilePanelProps {
  lecturer: AdminLecturer;
}

export const AdminLecturerProfilePanel = ({
  lecturer,
}: AdminLecturerProfilePanelProps) => {
  return (
    <aside
      className="rounded-3xl border border-[#e2e8f0] bg-white p-5 shadow-sm sm:p-6"
      dir="rtl"
    >
      <div className="relative mb-5">
        <button
          type="button"
          className="absolute left-0 top-0 flex size-9 items-center justify-center rounded-xl border border-[#e2e8f0] text-[#64748b] transition-colors hover:bg-[#f8fafc] hover:text-[#f5a524]"
          aria-label="تعديل"
        >
          <AdminIcon src="/images/teacher/icon-edit.svg" className="size-4" />
        </button>

        <div className="flex flex-col items-center text-center">
          <img
            src={lecturer.avatar}
            alt=""
            className="size-20 rounded-full border-4 border-[#fff7ed]"
            aria-hidden
          />
          <h3 className="mt-3 text-lg font-bold text-[#0f172a]">
            {lecturer.name}
          </h3>
          <p className="mt-1 text-sm text-[#64748b]">{lecturer.title}</p>
        </div>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3 rounded-2xl bg-[#f8fafc] p-3 text-center text-xs">
        <div>
          <p className="text-[#64748b]">انضم منذ</p>
          <p className="mt-1 font-semibold text-[#0f172a]">
            {lecturer.joinedDate}
          </p>
        </div>
        <div className="border-r border-[#e2e8f0]">
          <p className="text-[#64748b]">الطلاب</p>
          <p className="mt-1 font-semibold text-[#0f172a]" dir="ltr">
            {lecturer.studentsCount}
          </p>
        </div>
      </div>

      <div className="mb-5">
        <h4 className="mb-3 text-sm font-bold text-[#0f172a]">الدورات المدارة</h4>
        <ul className="space-y-2">
          {lecturer.managedCourses.map((course) => (
            <li
              key={course.name}
              className="flex items-center justify-between gap-3 rounded-xl bg-[#f8fafc] px-3 py-2.5 text-sm"
            >
              <span className="font-semibold text-[#0f172a]" dir="ltr">
                {course.revenue}
              </span>
              <span className="text-[#475569]">{course.name}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mb-5 rounded-2xl border border-[#f1f5f9] bg-[#f8fafc] p-4">
        <h4 className="mb-4 text-sm font-bold text-[#0f172a]">تفاصيل الأرباح</h4>

        <p className="text-right text-xs text-[#64748b]">إجمالي الربح</p>
        <CountUp
          value={lecturer.totalProfit}
          className="mt-1 block text-[2rem] font-black leading-none text-[#0f172a] sm:text-[2.25rem]"
        />

        <div className="mt-4 space-y-2 text-sm">
          <div className="flex items-center justify-between gap-3">
            <CountUp
              value={lecturer.availableBalance}
              className="font-semibold text-[#14b8a6]"
            />
            <span className="text-[#64748b]">الرصيد المتاح</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <CountUp
              value={lecturer.pendingBalance}
              className="font-semibold text-[#f5a524]"
            />
            <span className="text-[#64748b]">معلق — قيد الانتظار</span>
          </div>
        </div>
      </div>

      <button
        type="button"
        className="w-full rounded-2xl bg-[#f5a524] py-3 text-sm font-bold text-white shadow-[0px_10px_15px_-3px_rgba(245,165,36,0.25)] transition-transform hover:scale-[1.01]"
      >
        معالجة الدفع
      </button>
    </aside>
  );
};
