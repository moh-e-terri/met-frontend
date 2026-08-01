import { Link } from "react-router-dom";
import { getTeacherBasePath } from "@/core/routing/appSurface";
import type { TeacherCourseItem } from "@/teacher/api/types";
import { TeacherIcon } from "../../dashboard/components/TeacherIcon";

const STEPS = [
  {
    title: "الإدارة تنشئ المقرر",
    description: "يُنشأ المقرر ويُسند إليك من لوحة الإدارة مع الجامعة والتسعير.",
  },
  {
    title: "تختار المقرر من قائمتك",
    description: "بعد الإسناد يظهر المقرر هنا وفي لوحة التحكم مباشرة.",
  },
  {
    title: "ترفع المحتوى التعليمي",
    description: "أضف الدروس والفيديوهات والواجبات والاختبارات ثم انشر للطلاب.",
  },
];

interface TeacherNewCoursePanelProps {
  courses: TeacherCourseItem[];
  isLoading?: boolean;
}

export const TeacherNewCoursePanel = ({
  courses,
  isLoading = false,
}: TeacherNewCoursePanelProps) => {
  const basePath = getTeacherBasePath();

  return (
    <div className="space-y-6" dir="rtl">
      <section className="overflow-hidden rounded-3xl border border-[#fde8c8] bg-gradient-to-bl from-[#fff7ed] via-white to-[#f8fafc] p-6 shadow-sm sm:p-8">
        <p className="text-xs font-semibold text-[#f5a524]">رفع محتوى جديد</p>
        <h1 className="mt-2 text-2xl font-black text-[#0f172a] sm:text-3xl">
          ابدأ بإضافة محتوى لمقرر مسند إليك
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-[#64748b] sm:text-base">
          إنشاء المقررات يتم من لوحة الإدارة. دورك كمدرّس هو فتح المقرر المسند ورفع الدروس
          والواجبات والاختبارات ليظهر المحتوى للطلاب.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/teacher"
            className="inline-flex rounded-2xl bg-[#f5a524] px-5 py-2.5 text-sm font-bold text-white"
          >
            العودة للوحة التحكم
          </Link>
          {courses[0] ? (
            <Link
              to={`${basePath}/courses/${courses[0].id}`}
              className="inline-flex rounded-2xl border border-[#e2e8f0] bg-white px-5 py-2.5 text-sm font-bold text-[#0f172a]"
            >
              فتح آخر مقرر مسند
            </Link>
          ) : null}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {STEPS.map((step, index) => (
          <article
            key={step.title}
            className="rounded-3xl border border-[#e2e8f0] bg-white p-5 shadow-sm"
          >
            <span className="flex size-9 items-center justify-center rounded-2xl bg-[#fff7ed] text-sm font-black text-[#f5a524]">
              {index + 1}
            </span>
            <h2 className="mt-4 text-base font-bold text-[#0f172a]">{step.title}</h2>
            <p className="mt-2 text-sm leading-6 text-[#64748b]">{step.description}</p>
          </article>
        ))}
      </section>

      <section className="rounded-3xl border border-[#e2e8f0] bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-black text-[#0f172a]">مقررات جاهزة لرفع المحتوى</h2>
            <p className="mt-1 text-sm text-[#64748b]">
              اختر مقرراً لفتح محرّر الدروس والواجبات والاختبارات.
            </p>
          </div>
          <TeacherIcon
            src="/images/student/icon-book.svg"
            className="size-6 text-[#f5a524]"
          />
        </div>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 2 }).map((_, index) => (
              <div key={index} className="h-28 animate-pulse rounded-2xl bg-[#f1f5f9]" />
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#e2e8f0] bg-[#f8fafc] px-5 py-10 text-center">
            <p className="text-sm font-semibold text-[#0f172a]">لا يوجد مقرر مسند بعد</p>
            <p className="mt-2 text-sm text-[#64748b]">
              تواصل مع الإدارة لإسناد مقرر، ثم عد إلى هذه الصفحة لرفع المحتوى.
            </p>
            <Link
              to={`${basePath}/settings`}
              className="mt-4 inline-flex rounded-2xl border border-[#e2e8f0] bg-white px-4 py-2.5 text-sm font-bold text-[#475569]"
            >
              إعدادات الحساب
            </Link>
          </div>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2">
            {courses.map((course) => (
              <li key={course.id}>
                <Link
                  to={`${basePath}/courses/${course.id}`}
                  className="flex h-full items-center gap-3 rounded-2xl border border-[#f1f5f9] bg-[#f8fafc] p-4 transition hover:border-[#f5a524]/40 hover:bg-[#fff7ed]"
                >
                  <img
                    src={course.image}
                    alt=""
                    className="size-16 shrink-0 rounded-2xl object-cover"
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
                    <span className="mt-2 inline-flex text-xs font-bold text-[#0f172a]">
                      فتح ورفع المحتوى ←
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};
