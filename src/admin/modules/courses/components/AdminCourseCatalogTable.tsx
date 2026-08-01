import { cn } from "@/shared/utils/cn";
import { Pagination } from "@/shared/components/Pagination";
import { useClientPagination } from "@/shared/hooks/useClientPagination";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  courseStatusLabels,
  type AdminCatalogCourse,
  type AdminCourseStatus,
} from "../data/mockAdminCourses";
import { AdminIcon } from "../../dashboard/components/AdminIcon";

type FilterTab = "all" | AdminCourseStatus;

interface AdminCourseCatalogTableProps {
  courses: AdminCatalogCourse[];
  isLoading?: boolean;
  onEdit?: (course: AdminCatalogCourse) => void;
  onDelete?: (course: AdminCatalogCourse) => void;
  deletingId?: string | null;
}

export const AdminCourseCatalogTable = ({
  courses,
  isLoading,
  onEdit,
  onDelete,
  deletingId = null,
}: AdminCourseCatalogTableProps) => {
  const [filter, setFilter] = useState<FilterTab>("all");

  const filteredCourses = useMemo(() => {
    if (filter === "all") return courses;
    return courses.filter((course) => course.status === filter);
  }, [courses, filter]);

  const {
    items: pagedCourses,
    pagination,
    setPage,
  } = useClientPagination(filteredCourses, 10);

  const tabs: { id: FilterTab; label: string }[] = [
    { id: "all", label: "الكل" },
    { id: "published", label: "منشور" },
    { id: "draft", label: "مسودة" },
  ];

  const actionButtons = (course: AdminCatalogCourse) => (
    <div className="inline-flex items-center gap-1">
      <button
        type="button"
        onClick={() => onEdit?.(course)}
        className="flex size-8 items-center justify-center rounded-lg border border-[#e2e8f0] text-[#64748b] transition-colors hover:bg-[#f8fafc] hover:text-[#f5a524]"
        aria-label="تعديل"
      >
        <AdminIcon src="/images/teacher/icon-edit.svg" className="size-4" />
      </button>
      <Link
        to={`/admin/courses/${course.id}`}
        className="flex size-8 items-center justify-center rounded-lg border border-[#e2e8f0] text-[#64748b] transition-colors hover:bg-[#f8fafc] hover:text-[#3b82f6]"
        aria-label="عرض تفاصيل المقرر"
      >
        <AdminIcon src="/images/student/icon-eye.svg" className="size-4" />
      </Link>
      <button
        type="button"
        onClick={() => onDelete?.(course)}
        disabled={deletingId === course.id}
        className="flex size-8 items-center justify-center rounded-lg border border-[#e2e8f0] text-[#64748b] transition-colors hover:bg-[#fef2f2] hover:text-[#ef4444] disabled:opacity-50"
        aria-label="حذف"
      >
        <AdminIcon src="/images/admin/icon-trash.svg" className="size-4" />
      </button>
    </div>
  );

  return (
    <section
      className="rounded-3xl border border-[#e2e8f0] bg-white p-5 shadow-sm sm:p-6"
      dir="rtl"
    >
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="text-right">
          <h2 className="text-lg font-bold text-[#0f172a]">كتالوج الدورات</h2>
          <p className="mt-1 text-sm text-[#64748b]">
            {courses.length} دورة في الكتالوج
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 lg:justify-end">
          <div className="flex rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] p-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilter(tab.id)}
                className={cn(
                  "rounded-xl px-4 py-2 text-sm font-semibold transition-colors",
                  filter === tab.id
                    ? "bg-white text-[#0f172a] shadow-sm"
                    : "text-[#64748b]",
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="h-48 animate-pulse rounded-2xl bg-[#f8fafc]" />
      ) : filteredCourses.length === 0 ? (
        <p className="py-10 text-center text-sm text-[#64748b]">لا توجد دورات مطابقة.</p>
      ) : (
        <>
          <div className="hidden overflow-x-auto xl:block">
            <table className="w-full min-w-[960px] table-fixed">
              <colgroup>
                <col className="w-[28%]" />
                <col className="w-[18%]" />
                <col className="w-[18%]" />
                <col className="w-[14%]" />
                <col className="w-[10%]" />
                <col className="w-[12%]" />
              </colgroup>
              <thead>
                <tr className="border-b border-[#e2e8f0] text-sm text-[#64748b]">
                  <th className="px-3 py-3 text-right font-medium">العنوان والفئة</th>
                  <th className="px-3 py-3 text-right font-medium">المحاضر</th>
                  <th className="px-3 py-3 text-right font-medium">الجامعة</th>
                  <th className="px-3 py-3 text-right font-medium">الإيرادات</th>
                  <th className="px-3 py-3 text-right font-medium">الحالة</th>
                  <th className="px-3 py-3 text-right font-medium">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {pagedCourses.map((course) => {
                  const status = courseStatusLabels[course.status];

                  return (
                    <tr
                      key={course.id}
                      className="border-b border-[#f1f5f9] text-sm last:border-0"
                    >
                      <td className="px-3 py-4 text-right align-middle">
                        <div className="flex items-center gap-3">
                          <img
                            src={course.image}
                            alt=""
                            className="size-12 shrink-0 rounded-xl object-cover"
                            aria-hidden
                          />
                          <div className="min-w-0 text-right">
                            <Link
                              to={`/admin/courses/${course.id}`}
                              className="block truncate font-bold text-[#0f172a] hover:text-[#f5a524]"
                            >
                              {course.title}
                            </Link>
                            {course.university && course.university !== "—" ? (
                              <p className="mt-0.5 truncate text-xs font-semibold text-[#f5a524]">
                                {course.university}
                              </p>
                            ) : null}
                            <p className="mt-0.5 text-xs text-[#94a3b8]">
                              {course.category}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-4 text-right align-middle">
                        <div className="flex items-center gap-2">
                          <img
                            src={course.lecturerAvatar}
                            alt=""
                            className="size-8 shrink-0 rounded-full object-cover"
                            aria-hidden
                          />
                          <span className="truncate text-[#475569]">
                            {course.lecturer}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-4 text-right align-middle text-[#475569]">
                        {course.university}
                      </td>
                      <td className="px-3 py-4 text-right align-middle">
                        <p className="font-bold text-[#0f172a]" dir="ltr">
                          {course.revenue}
                        </p>
                        <p className="mt-0.5 text-xs font-medium text-[#14b8a6]">
                          {course.students}
                        </p>
                      </td>
                      <td className="px-3 py-4 text-right align-middle">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${status.className}`}
                        >
                          {status.label}
                        </span>
                      </td>
                      <td className="px-3 py-4 text-right align-middle">
                        {actionButtons(course)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="space-y-4 xl:hidden">
            {pagedCourses.map((course) => {
              const status = courseStatusLabels[course.status];

              return (
                <article
                  key={course.id}
                  className="rounded-2xl border border-[#f1f5f9] bg-[#f8fafc] p-4"
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={course.image}
                      alt=""
                      className="size-14 shrink-0 rounded-xl object-cover"
                      aria-hidden
                    />
                    <div className="min-w-0 flex-1 text-right">
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${status.className}`}
                        >
                          {status.label}
                        </span>
                        <p className="font-bold text-[#0f172a]" dir="ltr">
                          {course.revenue}
                        </p>
                      </div>
                      <Link
                        to={`/admin/courses/${course.id}`}
                        className="font-bold text-[#0f172a] hover:text-[#f5a524]"
                      >
                        {course.title}
                      </Link>
                      {course.university && course.university !== "—" ? (
                        <p className="mt-1 text-sm font-semibold text-[#f5a524]">
                          {course.university}
                        </p>
                      ) : null}
                      <p className="mt-1 text-xs text-[#94a3b8]">{course.category}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <img
                          src={course.lecturerAvatar}
                          alt=""
                          className="size-7 shrink-0 rounded-full object-cover"
                          aria-hidden
                        />
                        <span className="text-sm text-[#64748b]">{course.lecturer}</span>
                      </div>
                      <p className="mt-1 text-xs font-medium text-[#14b8a6]">
                        {course.students}
                      </p>
                      <div className="mt-3 flex justify-start">
                        {actionButtons(course)}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <Pagination
            pagination={pagination}
            onPageChange={setPage}
            summary={
              <>
                عرض {pagedCourses.length} من أصل {filteredCourses.length} دورة
              </>
            }
          />
        </>
      )}
    </section>
  );
};
