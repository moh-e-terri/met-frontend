import { Link, useNavigate } from "react-router-dom";
import { CountUp } from "@/shared/motion";
import { StartChatButton } from "@/shared/modules/chats";
import { getAdminBasePath } from "@/core/routing/appSurface";
import type { AdminLecturer } from "../data/mockAdminLecturers";
import { AdminIcon } from "../../dashboard/components/AdminIcon";

interface AdminLecturerProfilePanelProps {
  lecturer: AdminLecturer;
}

export const AdminLecturerProfilePanel = ({
  lecturer,
}: AdminLecturerProfilePanelProps) => {
  const navigate = useNavigate();
  const basePath = getAdminBasePath();

  const profilePath = `${basePath}/lecturers/${lecturer.id}`;

  const openLecturerProfile = () => {
    navigate(profilePath);
  };

  const openFinanceForLecturer = () => {
    const params = new URLSearchParams();
    params.set("instructorId", lecturer.id);
    if (lecturer.userId && lecturer.userId !== lecturer.id) {
      params.set("userId", lecturer.userId);
    }
    if (lecturer.email) {
      params.set("email", lecturer.email);
    }
    if (lecturer.name) {
      params.set("name", lecturer.name);
    }
    navigate(`${basePath}/financials?${params.toString()}`);
  };

  return (
    <aside
      className="rounded-3xl border border-[#e2e8f0] bg-white p-5 shadow-sm sm:p-6"
      dir="rtl"
    >
      <div className="relative mb-5">
        <button
          type="button"
          onClick={openLecturerProfile}
          className="absolute left-0 top-0 flex size-9 items-center justify-center rounded-xl border border-[#e2e8f0] text-[#64748b] transition-colors hover:bg-[#f8fafc] hover:text-[#f5a524]"
          aria-label="تعديل"
        >
          <AdminIcon src="/images/teacher/icon-edit.svg" className="size-4" />
        </button>

        <div className="flex flex-col items-center text-center">
          <Link to={profilePath} className="group flex flex-col items-center">
            <img
              src={lecturer.avatar}
              alt=""
              className="size-20 rounded-full border-4 border-[#fff7ed] transition-opacity group-hover:opacity-90"
              aria-hidden
            />
            <h3 className="mt-3 text-lg font-bold text-[#0f172a] transition-colors group-hover:text-[#f5a524]">
              {lecturer.name}
            </h3>
          </Link>
          {lecturer.email ? (
            <p className="mt-1 text-sm text-[#64748b]" dir="ltr">
              {lecturer.email}
            </p>
          ) : null}
          <p className="mt-1 text-sm text-[#64748b]">{lecturer.title}</p>
          <div className="mt-3">
            <StartChatButton
              userId={lecturer.userId || lecturer.id}
              name={lecturer.name}
              chatsPath="/admin/chats"
              iconOnly={false}
              label="محادثة مع المدرّس"
            />
          </div>
        </div>
      </div>

      <div className="mb-5 grid grid-cols-3 gap-2 rounded-2xl bg-[#f8fafc] p-3 text-center text-xs">
        <div>
          <p className="text-[#64748b]">انضم منذ</p>
          <p className="mt-1 text-[11px] font-semibold leading-4 text-[#0f172a]">
            {lecturer.joinedDate}
          </p>
        </div>
        <div className="border-x border-[#e2e8f0]">
          <p className="text-[#64748b]">الدورات</p>
          <p className="mt-1 text-base font-bold text-[#0f172a]" dir="ltr">
            {lecturer.coursesCount}
          </p>
        </div>
        <div>
          <p className="text-[#64748b]">الطلاب</p>
          <p className="mt-1 text-base font-bold text-[#0f172a]" dir="ltr">
            {lecturer.studentsCount}
          </p>
        </div>
      </div>

      <div className="mb-5">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h4 className="text-sm font-bold text-[#0f172a]">الدورات المدارة</h4>
          <span className="rounded-full bg-[#fff7ed] px-2.5 py-0.5 text-[11px] font-semibold text-[#f5a524]">
            {lecturer.coursesCount} دورة
          </span>
        </div>
        {lecturer.managedCourses.length === 0 ? (
          <p className="rounded-xl border border-dashed border-[#e2e8f0] bg-[#f8fafc] px-3 py-4 text-center text-xs text-[#94a3b8]">
            لا توجد دورات مسندة لهذا المحاضر حالياً.
          </p>
        ) : (
          <ul className="space-y-2">
            {lecturer.managedCourses.map((course) => (
              <li
                key={course.id || course.name}
                className="rounded-xl bg-[#f8fafc] px-3 py-2.5 text-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="font-semibold text-[#0f172a]">{course.name}</span>
                  <span className="shrink-0 text-xs font-semibold text-[#64748b]" dir="ltr">
                    {course.enrolledCount != null
                      ? `${course.enrolledCount} طالب`
                      : course.revenue}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mb-5 rounded-2xl border border-[#f1f5f9] bg-[#f8fafc] p-4">
        <h4 className="mb-4 text-sm font-bold text-[#0f172a]">تفاصيل الأرباح</h4>

        <p className="text-right text-xs text-[#64748b]">إجمالي المكتسب</p>
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
            <span className="text-[#64748b]">المصروف (المحرَّر)</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <CountUp
              value={lecturer.pendingBalance}
              className="font-semibold text-[#f5a524]"
            />
            <span className="text-[#64748b]">المحجوز — قيد الانتظار</span>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={openFinanceForLecturer}
        className="w-full rounded-2xl bg-[#f5a524] py-3 text-sm font-bold text-white shadow-[0px_10px_15px_-3px_rgba(245,165,36,0.25)] transition-transform hover:scale-[1.01]"
      >
        معالجة الدفع
      </button>
    </aside>
  );
};
