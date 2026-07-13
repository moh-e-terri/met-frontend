import {
  courseStatusLabels,
  type AdminCourseSummary,
} from "../data/mockAdminDashboard";

interface AdminCoursesSummaryProps {
  courses: AdminCourseSummary[];
  isLoading?: boolean;
}

export const AdminCoursesSummary = ({
  courses,
  isLoading,
}: AdminCoursesSummaryProps) => {
  return (
    <section
      className="rounded-3xl border border-[#e2e8f0] bg-white p-5 shadow-sm sm:p-6"
      dir="rtl"
    >
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-[#0f172a]">ملخص المقررات</h2>
      </div>

      {isLoading ? (
        <div className="h-40 animate-pulse rounded-2xl bg-[#f8fafc]" />
      ) : courses.length === 0 ? (
        <p className="py-8 text-center text-sm text-[#64748b]">لا توجد مقررات بعد.</p>
      ) : (
        <>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[720px]">
              <thead>
                <tr className="border-b border-[#e2e8f0] text-right text-sm text-[#64748b]">
                  <th className="px-3 py-3 font-medium">اسم المقرر</th>
                  <th className="px-3 py-3 font-medium">المحاضر</th>
                  <th className="px-3 py-3 font-medium">الجامعة</th>
                  <th className="px-3 py-3 font-medium">الإيرادات</th>
                  <th className="px-3 py-3 font-medium">الحالة</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => {
                  const status = courseStatusLabels[course.status];

                  return (
                    <tr
                      key={course.id}
                      className="border-b border-[#f1f5f9] text-right text-sm last:border-0"
                    >
                      <td className="px-3 py-4">
                        <p className="font-bold text-[#0f172a]">{course.name}</p>
                        <p className="mt-0.5 text-xs text-[#94a3b8]">{course.students}</p>
                      </td>
                      <td className="px-3 py-4 text-[#475569]">{course.lecturer}</td>
                      <td className="px-3 py-4 text-[#475569]">{course.university}</td>
                      <td className="px-3 py-4 font-semibold text-[#0f172a]" dir="ltr">
                        {course.revenue}
                      </td>
                      <td className="px-3 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${status.className}`}
                        >
                          {status.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 md:hidden">
            {courses.map((course) => {
              const status = courseStatusLabels[course.status];
              return (
                <div
                  key={course.id}
                  className="rounded-2xl border border-[#f1f5f9] bg-[#f8fafc] p-4"
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${status.className}`}
                    >
                      {status.label}
                    </span>
                    <span className="text-sm font-bold text-[#0f172a]" dir="ltr">
                      {course.revenue}
                    </span>
                  </div>
                  <p className="font-bold text-[#0f172a]">{course.name}</p>
                  <p className="mt-1 text-xs text-[#64748b]">
                    {course.lecturer} · {course.university}
                  </p>
                </div>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
};
