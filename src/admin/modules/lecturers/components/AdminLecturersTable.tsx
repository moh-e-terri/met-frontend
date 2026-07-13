import { cn } from "@/shared/utils/cn";
import { Pagination } from "@/shared/components/Pagination";
import type { PaginationMeta } from "@/core/api/pagination";
import { useState } from "react";
import {
  lecturerStatusLabels,
  type AdminLecturer,
} from "../data/mockAdminLecturers";
import { AdminIcon } from "../../dashboard/components/AdminIcon";

interface AdminLecturersTableProps {
  lecturers: AdminLecturer[];
  selectedId: string;
  onSelect: (lecturer: AdminLecturer) => void;
  isLoading?: boolean;
  pagination?: PaginationMeta;
  onPageChange?: (page: number) => void;
  isFetching?: boolean;
}

export const AdminLecturersTable = ({
  lecturers,
  selectedId,
  onSelect,
  pagination,
  onPageChange,
  isFetching,
}: AdminLecturersTableProps) => {
  const [sortBy, setSortBy] = useState("recent");

  return (
    <section
      className="rounded-3xl border border-[#e2e8f0] bg-white p-5 shadow-sm sm:p-6"
      dir="rtl"
    >
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-bold text-[#0f172a]">المعلمون النشطون</h2>

        <div className="flex items-center gap-2">
          <span className="text-sm text-[#64748b]">ترتيب حسب</span>
          <div className="relative">
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              className="appearance-none rounded-xl border border-[#e2e8f0] bg-[#f8fafc] py-2 pl-9 pr-3 text-sm font-semibold text-[#0f172a] outline-none focus:border-[#f5a524]/30"
            >
              <option value="recent">الأحدث نشاطاً</option>
              <option value="earnings">الأعلى أرباحاً</option>
              <option value="courses">الأكثر دورات</option>
            </select>
            <AdminIcon
              src="/images/student/icon-chevron-down.svg"
              className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-[#94a3b8]"
            />
          </div>
        </div>
      </div>

      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full min-w-[640px]">
          <thead>
            <tr className="border-b border-[#e2e8f0] text-right text-sm text-[#64748b]">
              <th className="px-3 py-3 font-medium">اسم المعلم</th>
              <th className="px-3 py-3 font-medium">التخصص</th>
              <th className="px-3 py-3 font-medium">الدورات</th>
              <th className="px-3 py-3 font-medium">الأرباح</th>
              <th className="px-3 py-3 font-medium">الحالة</th>
            </tr>
          </thead>
          <tbody>
            {lecturers.map((lecturer) => {
              const status = lecturerStatusLabels[lecturer.status];
              const isSelected = lecturer.id === selectedId;

              return (
                <tr
                  key={lecturer.id}
                  onClick={() => onSelect(lecturer)}
                  className={cn(
                    "cursor-pointer border-b border-[#f1f5f9] text-sm transition-colors last:border-0",
                    isSelected ? "bg-[#fff7ed]/60" : "hover:bg-[#f8fafc]",
                  )}
                >
                  <td className="px-3 py-4">
                    <div className="flex items-center justify-end gap-3">
                      <span className="font-bold text-[#0f172a]">
                        {lecturer.name}
                      </span>
                      <img
                        src={lecturer.avatar}
                        alt=""
                        className="size-9 rounded-full"
                        aria-hidden
                      />
                    </div>
                  </td>
                  <td className="px-3 py-4 text-[#475569]">
                    {lecturer.specialization}
                  </td>
                  <td className="px-3 py-4 font-semibold text-[#0f172a]" dir="ltr">
                    {lecturer.coursesCount}
                  </td>
                  <td className="px-3 py-4 font-bold text-[#0f172a]" dir="ltr">
                    {lecturer.earnings}
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

      <div className="space-y-3 lg:hidden">
        {lecturers.map((lecturer) => {
          const status = lecturerStatusLabels[lecturer.status];
          const isSelected = lecturer.id === selectedId;

          return (
            <button
              key={lecturer.id}
              type="button"
              onClick={() => onSelect(lecturer)}
              className={cn(
                "w-full rounded-2xl border p-4 text-right transition-colors",
                isSelected
                  ? "border-[#f5a524]/30 bg-[#fff7ed]/60"
                  : "border-[#f1f5f9] bg-[#f8fafc] hover:bg-white",
              )}
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${status.className}`}
                >
                  {status.label}
                </span>
                <span className="font-bold text-[#0f172a]" dir="ltr">
                  {lecturer.earnings}
                </span>
              </div>
              <div className="flex items-center justify-end gap-3">
                <div>
                  <p className="font-bold text-[#0f172a]">{lecturer.name}</p>
                  <p className="mt-1 text-xs text-[#64748b]">
                    {lecturer.specialization}
                  </p>
                </div>
                <img
                  src={lecturer.avatar}
                  alt=""
                  className="size-10 rounded-full"
                  aria-hidden
                />
              </div>
            </button>
          );
        })}
      </div>

      <Pagination
        pagination={
          pagination ?? {
            page: 1,
            totalPages: 1,
            total: lecturers.length,
            limit: lecturers.length || 10,
            hasNextPage: false,
            hasPrevPage: false,
          }
        }
        onPageChange={onPageChange ?? (() => undefined)}
        disabled={isFetching}
        summary={
          <>
            عرض {lecturers.length} من أصل {pagination?.total ?? lecturers.length} معلماً
          </>
        }
      />
    </section>
  );
};
