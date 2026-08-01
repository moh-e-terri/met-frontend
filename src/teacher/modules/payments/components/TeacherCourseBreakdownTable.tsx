import type { TeacherCourseBreakdownItem } from "@/teacher/api";

interface TeacherCourseBreakdownTableProps {
  courses?: TeacherCourseBreakdownItem[];
  isLoading?: boolean;
}

export const TeacherCourseBreakdownTable = ({
  courses = [],
  isLoading,
}: TeacherCourseBreakdownTableProps) => {
  return (
    <section
      className="rounded-3xl border border-[#e2e8f0] bg-white p-5 shadow-sm sm:p-6"
      dir="rtl"
    >
      <h2 className="mb-5 text-lg font-bold text-[#0f172a]">دخل كل كورس</h2>

      {isLoading ? (
        <div className="h-40 animate-pulse rounded-2xl bg-[#e2e8f0]" />
      ) : courses.length === 0 ? (
        <p className="py-8 text-center text-sm text-[#64748b]">لا توجد كورسات بعد.</p>
      ) : (
        <>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[720px]">
              <thead>
                <tr className="border-b border-[#e2e8f0] text-sm text-[#64748b]">
                  <th className="px-3 py-3 text-right font-medium">الكورس</th>
                  <th className="px-3 py-3 text-right font-medium">الطلاب</th>
                  <th className="px-3 py-3 text-right font-medium">المكتسب</th>
                  <th className="px-3 py-3 text-right font-medium">المحجوز</th>
                  <th className="px-3 py-3 text-right font-medium">المصروف</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => (
                  <tr
                    key={course.courseId}
                    className="border-b border-[#f1f5f9] text-sm last:border-0"
                  >
                    <td className="px-3 py-4 text-right font-bold text-[#0f172a]">
                      {course.title}
                    </td>
                    <td className="px-3 py-4 text-right text-[#475569]">
                      <span dir="ltr">{course.enrolledCount}</span>
                    </td>
                    <td className="px-3 py-4 text-right font-semibold text-[#0f172a]">
                      <span dir="ltr">
                        {course.earnedMET.toLocaleString("en-US")} MET
                      </span>
                    </td>
                    <td className="px-3 py-4 text-right font-semibold text-[#f59e0b]">
                      <span dir="ltr">
                        {course.reservedMET.toLocaleString("en-US")} MET
                      </span>
                    </td>
                    <td className="px-3 py-4 text-right font-semibold text-[#14b8a6]">
                      <span dir="ltr">
                        {course.releasedMET.toLocaleString("en-US")} MET
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 md:hidden">
            {courses.map((course) => (
              <article
                key={course.courseId}
                className="rounded-2xl border border-[#f1f5f9] bg-[#f8fafc] p-4"
              >
                <p className="font-bold text-[#0f172a]">{course.title}</p>
                <p className="mt-1 text-xs text-[#94a3b8]">{course.enrolledCount} طالب</p>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="rounded-xl bg-white px-2 py-2">
                    <p className="text-[#94a3b8]">الدخل</p>
                    <p className="mt-1 font-bold text-[#0f172a]" dir="ltr">
                      {course.totalIncomeMET}
                    </p>
                  </div>
                  <div className="rounded-xl bg-white px-2 py-2">
                    <p className="text-[#94a3b8]">محجوز</p>
                    <p className="mt-1 font-bold text-[#f59e0b]" dir="ltr">
                      {course.reservedMET}
                    </p>
                  </div>
                  <div className="rounded-xl bg-white px-2 py-2">
                    <p className="text-[#94a3b8]">مصروف</p>
                    <p className="mt-1 font-bold text-[#14b8a6]" dir="ltr">
                      {course.releasedMET}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </section>
  );
};
