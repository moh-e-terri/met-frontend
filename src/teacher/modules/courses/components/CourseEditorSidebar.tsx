import { Link } from "react-router-dom";
import { getTeacherBasePath } from "@/core/routing/appSurface";
import { TeacherIcon } from "../../dashboard/components/TeacherIcon";
import type { TeacherCourseItem } from "@/teacher/api/types";

const PROFESSIONAL_TIPS = [
  "قسّم المحتوى إلى دروس قصيرة وواضحة.",
  "أضف واجبات عملية بعد كل وحدة تعليمية.",
  "انشر المقرر فقط بعد مراجعة جميع الدروس.",
];

interface CourseEditorSidebarProps {
  courses?: TeacherCourseItem[];
  communityTo?: string | null;
  communityTitle?: string;
  /** Hide the courses list when the main column already shows them. */
  hideCourses?: boolean;
}

export const CourseEditorSidebar = ({
  courses = [],
  communityTo = null,
  communityTitle = "المقرر",
  hideCourses = false,
}: CourseEditorSidebarProps) => {
  const basePath = getTeacherBasePath();

  return (
    <div className="space-y-5" dir="rtl">
      <section className="rounded-3xl border border-[#bfdbfe] bg-[#eff6ff] p-5 shadow-sm">
        <h3 className="mb-4 flex items-center justify-start gap-2 text-base font-bold text-[#0f172a]">
          <TeacherIcon
            src="/images/teacher/icon-lightbulb.svg"
            className="size-5 text-[#3b82f6]"
          />
          <span>نصائح احترافية</span>
        </h3>

        <ul className="space-y-3">
          {PROFESSIONAL_TIPS.map((tip) => (
            <li
              key={tip}
              className="flex items-start gap-2 text-right text-sm leading-6 text-[#475569]"
            >
              <TeacherIcon
                src="/images/student/icon-check.svg"
                className="mt-1 size-4 shrink-0 text-[#3b82f6]"
              />
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </section>

      {!hideCourses ? (
        <section className="rounded-3xl border border-[#e2e8f0] bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-right text-base font-bold text-[#0f172a]">مقرراتي</h3>

          {courses.length === 0 ? (
            <p className="text-right text-sm text-[#64748b]">
              لا توجد مقررات مسندة إليك حالياً. تواصل مع الإدارة لإسناد مقرر.
            </p>
          ) : (
            <ul className="space-y-4">
              {courses.map((course) => (
                <li key={course.id}>
                  <Link
                    to={`${basePath}/courses/${course.id}`}
                    className="flex items-center gap-3 rounded-2xl border border-[#f1f5f9] bg-[#f8fafc] p-3 transition-colors hover:border-[#f5a524]/30"
                  >
                    <img
                      src={course.image}
                      alt=""
                      className="size-14 shrink-0 rounded-xl object-cover"
                      aria-hidden
                    />
                    <div className="min-w-0 flex-1 text-right">
                      <p className="truncate text-sm font-bold text-[#0f172a]">{course.title}</p>
                      {course.university ? (
                        <p className="mt-0.5 truncate text-xs font-medium text-[#f5a524]">
                          {course.university}
                        </p>
                      ) : null}
                      <p className="mt-1 text-xs text-[#64748b]">
                        {course.students} طالب · {course.lessons} درس
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}

      {communityTo ? (
        <section className="overflow-hidden rounded-3xl border border-[#e2e8f0] bg-[#0f172a] p-4 text-white shadow-sm">
          <p className="text-[11px] font-semibold text-[#f5a524]">مجتمع المقرر</p>
          <h3 className="mt-1 text-sm font-bold leading-6">نقاش «{communityTitle}»</h3>
          <p className="mt-2 text-[11px] leading-5 text-white/65">
            منشورات وأسئلة هذا المقرر فقط.
          </p>
          <Link
            to={communityTo}
            className="mt-3 inline-flex w-full items-center justify-center rounded-2xl bg-[#f5a524] py-2.5 text-xs font-bold text-white"
          >
            الدخول إلى المجتمع
          </Link>
        </section>
      ) : null}

      <section className="rounded-3xl bg-[#f5a524] p-5 text-center shadow-sm">
        <h3 className="text-base font-bold text-white">هل تحتاج إلى مساعدة؟</h3>
        <Link
          to={`${basePath}/settings`}
          className="mt-4 inline-flex w-full items-center justify-center rounded-2xl bg-white py-3 text-sm font-bold text-[#f5a524] transition-transform hover:scale-[1.01]"
        >
          إعدادات الحساب
        </Link>
      </section>
    </div>
  );
};
