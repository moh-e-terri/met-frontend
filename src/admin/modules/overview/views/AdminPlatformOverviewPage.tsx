import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  adminQueryKeys,
  fetchAdminCourses,
  fetchAdminInstructors,
  fetchAdminStudents,
  fetchAdminUniversities,
} from "@/admin/api";
import {
  courseEnrolleeQueryKeys,
  fetchAdminCourseStudents,
  type CourseEnrollee,
} from "@/core/api/courseEnrollees";
import { getAdminBasePath } from "@/core/routing/appSurface";
import { PageMotion } from "@/shared/motion";
import { cn } from "@/shared/utils/cn";
import type { AdminCatalogCourse } from "@/admin/modules/courses/data/mockAdminCourses";
import type { AdminLecturer } from "@/admin/modules/lecturers/data/mockAdminLecturers";
import { AdminIcon } from "@/admin/modules/dashboard/components/AdminIcon";

function courseMatchesInstructor(course: AdminCatalogCourse, lecturer: AdminLecturer) {
  if (!course.instructorId) return false;
  return (
    course.instructorId === lecturer.id ||
    course.instructorId === lecturer.userId ||
    course.lecturer === lecturer.name
  );
}

function CourseStudentsPanel({
  courseId,
  enabled,
  basePath,
}: {
  courseId: string;
  enabled: boolean;
  basePath: string;
}) {
  const studentsQuery = useQuery({
    queryKey: courseEnrolleeQueryKeys.admin(courseId),
    queryFn: () => fetchAdminCourseStudents(courseId),
    enabled,
  });

  if (!enabled) return null;

  if (studentsQuery.isLoading) {
    return <div className="mt-3 h-20 animate-pulse rounded-2xl bg-[#f1f5f9]" />;
  }

  if (studentsQuery.isError) {
    return (
      <p className="mt-3 rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-right text-xs text-red-600">
        {studentsQuery.error instanceof Error
          ? studentsQuery.error.message
          : "تعذر تحميل طلاب المقرر"}
      </p>
    );
  }

  const students = studentsQuery.data ?? [];

  if (students.length === 0) {
    return (
      <p className="mt-3 rounded-2xl border border-dashed border-[#e2e8f0] bg-white px-3 py-4 text-center text-xs text-[#94a3b8]">
        لا يوجد طلاب مسجلون في هذا المقرر.
      </p>
    );
  }

  return (
    <ul className="mt-3 max-h-72 space-y-2 overflow-y-auto rounded-2xl border border-[#e2e8f0] bg-white p-2">
      {students.map((student: CourseEnrollee) => {
        const profileId = student.profileId || student.id;
        const profilePath = `${basePath}/students/${profileId}`;
        return (
          <li
            key={student.id}
            className="flex items-center gap-3 rounded-xl bg-[#f8fafc] px-3 py-2"
          >
            <Link to={profilePath} className="shrink-0">
              <img
                src={student.avatar}
                alt=""
                className="size-9 rounded-full object-cover transition-opacity hover:opacity-90"
                aria-hidden
              />
            </Link>
            <div className="min-w-0 flex-1 text-right">
              <Link
                to={profilePath}
                className="block truncate text-sm font-bold text-[#0f172a] transition-colors hover:text-[#f5a524]"
              >
                {student.name}
              </Link>
              <p className="truncate text-[11px] text-[#64748b]">
                {[student.email, student.university].filter(Boolean).join(" · ") || "—"}
              </p>
            </div>
            <span className="shrink-0 rounded-full bg-[#eff6ff] px-2 py-0.5 text-[10px] font-semibold text-[#3b82f6]">
              {student.progress}%
            </span>
          </li>
        );
      })}
    </ul>
  );
}

export const AdminPlatformOverviewPage = () => {
  const basePath = getAdminBasePath();
  const [search, setSearch] = useState("");
  const [expandedLecturerId, setExpandedLecturerId] = useState<string | null>(null);
  const [expandedCourseId, setExpandedCourseId] = useState<string | null>(null);
  const [showAllStudents, setShowAllStudents] = useState(false);

  const instructorsQuery = useQuery({
    queryKey: adminQueryKeys.instructors({ page: 1, limit: 100 }),
    queryFn: () => fetchAdminInstructors({ page: 1, limit: 100 }),
  });

  const coursesQuery = useQuery({
    queryKey: adminQueryKeys.courses({ page: 1, limit: 100 }),
    queryFn: () => fetchAdminCourses({ page: 1, limit: 100 }),
  });

  const universitiesQuery = useQuery({
    queryKey: adminQueryKeys.universities(),
    queryFn: () => fetchAdminUniversities(),
  });

  const studentsQuery = useQuery({
    queryKey: adminQueryKeys.students({ page: 1, limit: 100 }),
    queryFn: () => fetchAdminStudents({ page: 1, limit: 100 }),
    enabled: showAllStudents,
  });

  const lecturers = instructorsQuery.data?.items ?? [];
  const courses = coursesQuery.data?.items ?? [];
  const universities = universitiesQuery.data ?? [];

  const universityNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const university of universities) {
      map.set(university.id, university.name);
    }
    return map;
  }, [universities]);

  const resolveUniversity = (course: AdminCatalogCourse) => {
    if (course.university && course.university !== "—") return course.university;
    const id = course.universityIds?.[0];
    if (id && universityNameById.has(id)) return universityNameById.get(id)!;
    return "بدون جامعة";
  };

  const coursesByLecturerId = useMemo(() => {
    const map = new Map<string, AdminCatalogCourse[]>();
    for (const lecturer of lecturers) {
      map.set(
        lecturer.id,
        courses.filter((course) => courseMatchesInstructor(course, lecturer)),
      );
    }
    return map;
  }, [lecturers, courses]);

  const unassignedCourses = useMemo(
    () =>
      courses.filter(
        (course) => !lecturers.some((lecturer) => courseMatchesInstructor(course, lecturer)),
      ),
    [courses, lecturers],
  );

  const filteredLecturers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return lecturers;
    return lecturers.filter((lecturer) => {
      const lecturerCourses = coursesByLecturerId.get(lecturer.id) ?? [];
      const haystack = [
        lecturer.name,
        lecturer.email,
        lecturer.specialization,
        lecturer.title,
        ...lecturerCourses.map((course) => course.title),
        ...lecturerCourses.map((course) => resolveUniversity(course)),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [lecturers, coursesByLecturerId, search, universityNameById]);

  const isLoading =
    instructorsQuery.isLoading || coursesQuery.isLoading || universitiesQuery.isLoading;
  const hasError =
    instructorsQuery.isError || coursesQuery.isError || universitiesQuery.isError;

  const totalStudentsOnCourses = courses.reduce(
    (sum, course) => sum + (course.enrolledCount ?? 0),
    0,
  );

  return (
    <PageMotion className="mx-auto w-full max-w-[1280px] space-y-6">
      <header
        className="rounded-3xl border border-[#fde8c8] bg-gradient-to-l from-[#fff7ed] via-white to-[#eff6ff] p-5 shadow-sm sm:p-6"
        dir="rtl"
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-[#f5a524]">لوحة اختبار المنصة</p>
            <h1 className="mt-1 text-2xl font-black text-[#0f172a]">بيانات المنصة</h1>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-[#64748b]">
              نظرة شاملة على المحاضرين، مقرراتهم، الجامعة التابعة لكل مقرر، وطلاب كل كورس
              للتحقق من سلامة البيانات.
            </p>
          </div>
          <Link
            to={`${basePath}/courses`}
            className="rounded-2xl border border-[#e2e8f0] bg-white px-4 py-2.5 text-sm font-bold text-[#475569]"
          >
            إدارة المقررات
          </Link>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "المحاضرون", value: lecturers.length, color: "text-[#3b82f6]" },
            { label: "المقررات", value: courses.length, color: "text-[#f5a524]" },
            { label: "الجامعات", value: universities.length, color: "text-[#14b8a6]" },
            {
              label: "تسجيلات الطلاب",
              value: totalStudentsOnCourses,
              color: "text-[#8b5cf6]",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-white/80 bg-white/80 px-4 py-3 shadow-sm"
            >
              <p className="text-[11px] text-[#94a3b8]">{stat.label}</p>
              <p className={cn("mt-1 text-2xl font-black", stat.color)}>{stat.value}</p>
            </div>
          ))}
        </div>
      </header>

      <div className="flex flex-wrap items-center gap-3" dir="rtl">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="ابحث عن محاضر أو مقرر أو جامعة..."
          className="h-11 min-w-[240px] flex-1 rounded-2xl border border-[#e2e8f0] bg-white px-4 text-sm outline-none focus:border-[#f5a524]"
        />
        <button
          type="button"
          onClick={() => setShowAllStudents((open) => !open)}
          className="rounded-2xl bg-[#0f172a] px-4 py-2.5 text-sm font-bold text-white"
        >
          {showAllStudents ? "إخفاء كل الطلاب" : "عرض كل طلاب المنصة"}
        </button>
      </div>

      {hasError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-right text-sm text-red-600">
          تعذر تحميل بعض بيانات المنصة. تأكد من صلاحيات الأدمن والاتصال بالخادم.
        </div>
      ) : null}

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-24 animate-pulse rounded-3xl bg-[#e2e8f0]" />
          ))}
        </div>
      ) : (
        <section className="space-y-4" dir="rtl">
          {filteredLecturers.map((lecturer) => {
            const lecturerCourses = coursesByLecturerId.get(lecturer.id) ?? [];
            const expanded = expandedLecturerId === lecturer.id;

            return (
              <article
                key={lecturer.id}
                className="overflow-hidden rounded-3xl border border-[#e2e8f0] bg-white shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => {
                    setExpandedLecturerId(expanded ? null : lecturer.id);
                    setExpandedCourseId(null);
                  }}
                  className="flex w-full items-center gap-4 px-4 py-4 text-right transition-colors hover:bg-[#f8fafc] sm:px-5"
                >
                  <img
                    src={lecturer.avatar}
                    alt=""
                    className="size-14 shrink-0 rounded-2xl object-cover"
                    aria-hidden
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-base font-black text-[#0f172a]">{lecturer.name}</h2>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                          lecturer.status === "active"
                            ? "bg-[#ecfdf5] text-[#14b8a6]"
                            : "bg-[#f1f5f9] text-[#64748b]",
                        )}
                      >
                        {lecturer.status === "active" ? "نشط" : lecturer.status}
                      </span>
                    </div>
                    {lecturer.email ? (
                      <p className="mt-1 text-xs text-[#64748b]" dir="ltr">
                        {lecturer.email}
                      </p>
                    ) : null}
                    <p className="mt-1 text-xs text-[#64748b]">
                      {lecturer.specialization || lecturer.title || "محاضر"} ·{" "}
                      {lecturerCourses.length} مقرر · {lecturer.studentsCount} طالب
                    </p>
                  </div>
                  <span className="text-sm font-bold text-[#f5a524]">
                    {expanded ? "إخفاء" : "عرض المقررات"}
                  </span>
                </button>

                {expanded ? (
                  <div className="space-y-3 border-t border-[#f1f5f9] bg-[#fafafa] px-4 py-4 sm:px-5">
                    {lecturerCourses.length === 0 ? (
                      <p className="py-4 text-center text-sm text-[#94a3b8]">
                        لا توجد مقررات مسندة لهذا المحاضر.
                      </p>
                    ) : (
                      lecturerCourses.map((course) => {
                        const courseOpen = expandedCourseId === course.id;
                        const university = resolveUniversity(course);

                        return (
                          <div
                            key={course.id}
                            className="rounded-2xl border border-[#e2e8f0] bg-white p-4"
                          >
                            <div className="flex flex-wrap items-start gap-3">
                              <img
                                src={course.image}
                                alt=""
                                className="h-16 w-24 shrink-0 rounded-xl object-cover"
                                aria-hidden
                              />
                              <div className="min-w-0 flex-1 text-right">
                                <h3 className="font-bold text-[#0f172a]">{course.title}</h3>
                                <p className="mt-1 text-xs font-semibold text-[#f5a524]">
                                  {university}
                                </p>
                                <p className="mt-1 text-xs text-[#64748b]">
                                  {course.enrolledCount ?? 0} طالب ·{" "}
                                  {course.status === "published" ? "منشور" : "مسودة"}
                                  {course.metCost != null ? ` · ${course.metCost} MET` : ""}
                                </p>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                <Link
                                  to={`${basePath}/courses/${course.id}`}
                                  className="rounded-xl border border-[#e2e8f0] px-3 py-2 text-xs font-semibold text-[#475569]"
                                >
                                  فتح المقرر
                                </Link>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setExpandedCourseId(courseOpen ? null : course.id)
                                  }
                                  className="rounded-xl bg-[#eff6ff] px-3 py-2 text-xs font-semibold text-[#3b82f6]"
                                >
                                  {courseOpen ? "إخفاء الطلاب" : "عرض الطلاب"}
                                </button>
                              </div>
                            </div>

                            <CourseStudentsPanel
                              courseId={course.id}
                              enabled={courseOpen}
                              basePath={basePath}
                            />
                          </div>
                        );
                      })
                    )}
                  </div>
                ) : null}
              </article>
            );
          })}

          {unassignedCourses.length > 0 && !search.trim() ? (
            <article className="overflow-hidden rounded-3xl border border-dashed border-[#fde68a] bg-[#fffbeb] shadow-sm">
              <div className="px-5 py-4 text-right">
                <h2 className="font-black text-[#0f172a]">مقررات بدون محاضر مسند</h2>
                <p className="mt-1 text-xs text-[#64748b]">
                  {unassignedCourses.length} مقرر بحاجة لمراجعة الإسناد
                </p>
              </div>
              <ul className="space-y-2 border-t border-[#fde8c8] px-4 py-4 sm:px-5">
                {unassignedCourses.map((course) => (
                  <li
                    key={course.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3"
                  >
                    <div className="text-right">
                      <p className="text-sm font-bold text-[#0f172a]">{course.title}</p>
                      <p className="text-xs font-semibold text-[#f5a524]">
                        {resolveUniversity(course)}
                      </p>
                    </div>
                    <Link
                      to={`${basePath}/courses/${course.id}`}
                      className="text-xs font-semibold text-[#3b82f6]"
                    >
                      فتح
                    </Link>
                  </li>
                ))}
              </ul>
            </article>
          ) : null}

          {filteredLecturers.length === 0 ? (
            <p className="rounded-3xl border border-dashed border-[#e2e8f0] bg-white py-12 text-center text-sm text-[#64748b]">
              لا توجد نتائج مطابقة للبحث.
            </p>
          ) : null}
        </section>
      )}

      {showAllStudents ? (
        <section
          className="rounded-3xl border border-[#e2e8f0] bg-white p-5 shadow-sm sm:p-6"
          dir="rtl"
        >
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-lg font-black text-[#0f172a]">
              <AdminIcon
                src="/images/student/icon-groups.svg"
                className="size-5 text-[#3b82f6]"
              />
              <span>كل طلاب المنصة</span>
            </h2>
            <span className="text-sm text-[#64748b]">
              {studentsQuery.data?.pagination.total ?? studentsQuery.data?.items.length ?? 0}{" "}
              طالب
            </span>
          </div>

          {studentsQuery.isLoading ? (
            <div className="h-40 animate-pulse rounded-2xl bg-[#f1f5f9]" />
          ) : studentsQuery.isError ? (
            <p className="text-sm text-red-600">
              {studentsQuery.error instanceof Error
                ? studentsQuery.error.message
                : "تعذر تحميل الطلاب"}
            </p>
          ) : (
            <div className="max-h-[480px] overflow-auto rounded-2xl border border-[#f1f5f9]">
              <table className="w-full min-w-[640px] text-right text-sm">
                <thead className="sticky top-0 bg-[#f8fafc] text-xs text-[#64748b]">
                  <tr>
                    <th className="px-4 py-3 font-semibold">الطالب</th>
                    <th className="px-4 py-3 font-semibold">البريد</th>
                    <th className="px-4 py-3 font-semibold">الجامعة / التخصص</th>
                    <th className="px-4 py-3 font-semibold">المقررات</th>
                    <th className="px-4 py-3 font-semibold">MET</th>
                  </tr>
                </thead>
                <tbody>
                  {(studentsQuery.data?.items ?? []).map((student) => (
                    <tr key={student.id} className="border-t border-[#f1f5f9]">
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <span className="font-bold text-[#0f172a]">{student.name}</span>
                          <img
                            src={student.avatar}
                            alt=""
                            className="size-8 rounded-full object-cover"
                            aria-hidden
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[#64748b]" dir="ltr">
                        {student.email || "—"}
                      </td>
                      <td className="px-4 py-3 text-[#64748b]">{student.degree || "—"}</td>
                      <td className="px-4 py-3 text-[#64748b]">{student.coursesCount}</td>
                      <td className="px-4 py-3 font-semibold text-[#f5a524]" dir="ltr">
                        {student.totalPaid}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      ) : null}
    </PageMotion>
  );
};
