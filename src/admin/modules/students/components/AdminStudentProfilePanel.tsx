import { useState } from "react";
import { cn } from "@/shared/utils/cn";
import { AnimatedBar, CountUp } from "@/shared/motion";
import type { AdminStudent } from "../data/mockAdminStudents";
import { AdminIcon } from "../../dashboard/components/AdminIcon";

interface AdminStudentProfilePanelProps {
  student: AdminStudent;
  onAddMet?: (amount: number, description?: string) => void | Promise<unknown>;
  isAddingMet?: boolean;
  metError?: string;
  metSuccess?: string;
}

export const AdminStudentProfilePanel = ({
  student,
  onAddMet,
  isAddingMet = false,
  metError,
  metSuccess,
}: AdminStudentProfilePanelProps) => {
  const [amount, setAmount] = useState("100");
  const [description, setDescription] = useState("منحة تعليمية");
  return (
    <aside
      className="rounded-3xl border border-[#e2e8f0] bg-white p-5 shadow-sm sm:p-6"
      dir="rtl"
    >
      <div className="mb-5 flex flex-col items-center text-center">
        <img
          src={student.avatar}
          alt=""
          className="size-20 rounded-full border-4 border-[#fff7ed]"
          aria-hidden
        />
        <h3 className="mt-3 text-lg font-bold text-[#0f172a]">{student.name}</h3>
        <p className="mt-1 text-sm text-[#64748b]" dir="ltr">
          {student.email}
        </p>

        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          <span className="rounded-full bg-[#eff6ff] px-3 py-1 text-xs font-semibold text-[#3b82f6]">
            {student.degree}
          </span>
          <span className="rounded-full bg-[#f1f5f9] px-3 py-1 text-xs font-semibold text-[#64748b]">
            {student.yearTag}
          </span>
        </div>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3 rounded-2xl bg-[#f8fafc] p-4 text-center">
        <div>
          <p className="text-xs text-[#64748b]">المعدل الحالي</p>
          <CountUp
            value={student.gpa}
            className="mt-1 block text-[2rem] font-black leading-none text-[#0f172a] sm:text-[2.25rem]"
          />
        </div>
        <div className="border-r border-[#e2e8f0]">
          <p className="text-xs text-[#64748b]">نسبة الحضور</p>
          <CountUp
            value={student.attendance}
            className="mt-1 block text-[2rem] font-black leading-none text-[#0f172a] sm:text-[2.25rem]"
          />
        </div>
      </div>

      {student.enrolledCourses.length > 0 && (
        <div className="mb-5">
          <h4 className="mb-3 text-sm font-bold text-[#0f172a]">
            الدورات المسجّلة
          </h4>
          <ul className="space-y-3">
            {student.enrolledCourses.map((course) => (
              <li key={course.name}>
                <div className="mb-1.5 flex items-center justify-between gap-2 text-sm">
                  <span className="font-semibold text-[#0f172a]" dir="ltr">
                    {course.progress}%
                  </span>
                  <span className="text-[#475569]">{course.name}</span>
                </div>
                <AnimatedBar
                  value={course.progress}
                  className="h-2 bg-[#f1f5f9]"
                  barClassName={cn(
                    "rounded-full",
                    course.tone === "green" ? "bg-[#14b8a6]" : "bg-[#f5a524]",
                  )}
                />
              </li>
            ))}
          </ul>
        </div>
      )}

      {student.recentActivities.length > 0 && (
        <div>
          <h4 className="mb-3 text-sm font-bold text-[#0f172a]">آخر النشاطات</h4>
          <ul className="space-y-3">
            {student.recentActivities.map((activity) => (
              <li
                key={activity.id}
                className="flex items-start gap-3 rounded-xl bg-[#f8fafc] px-3 py-2.5"
              >
                <span
                  className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${activity.iconBg}`}
                >
                  <AdminIcon
                    src={activity.icon}
                    className={`size-4 ${activity.iconColor}`}
                  />
                </span>
                <div className="min-w-0 flex-1 text-right">
                  <p className="text-sm text-[#475569]">{activity.text}</p>
                  <p className="mt-0.5 text-xs text-[#94a3b8]">{activity.time}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {onAddMet ? (
        <form
          className="mt-5 space-y-3 rounded-2xl border border-[#fde8c8] bg-[#fff7ed]/40 p-4"
          onSubmit={async (event) => {
            event.preventDefault();
            const parsed = Number(amount);
            if (!parsed || parsed <= 0) return;
            await onAddMet(parsed, description.trim() || undefined);
          }}
        >
          <h4 className="text-sm font-bold text-[#0f172a]">إضافة نقاط MET</h4>
          <input
            type="number"
            min={1}
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            className="h-11 w-full rounded-2xl border border-[#e2e8f0] bg-white px-4 text-sm outline-none focus:border-[#f5a524]"
          />
          <input
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="الوصف"
            className="h-11 w-full rounded-2xl border border-[#e2e8f0] bg-white px-4 text-sm outline-none focus:border-[#f5a524]"
          />
          {metError ? <p className="text-xs text-red-500">{metError}</p> : null}
          {metSuccess ? <p className="text-xs text-[#14b8a6]">{metSuccess}</p> : null}
          <button
            type="submit"
            disabled={isAddingMet}
            className="w-full rounded-2xl bg-[#f5a524] py-2.5 text-sm font-bold text-white disabled:opacity-70"
          >
            {isAddingMet ? "جاري الإضافة..." : "إضافة النقاط"}
          </button>
        </form>
      ) : null}
    </aside>
  );
};
