import { Link } from "react-router-dom";
import { getAdminBasePath } from "@/core/routing/appSurface";
import { cn } from "@/shared/utils/cn";
import { Pagination } from "@/shared/components/Pagination";
import { useClientPagination } from "@/shared/hooks/useClientPagination";
import { StartChatButton } from "@/shared/modules/chats";
import { TablePersonCell, tableCellClass } from "@/shared/components/TablePersonCell";
import { useEffect, useMemo, useState } from "react";
import {
  filterStudentsByTab,
  paymentNoteToneClass,
  paymentStatusLabels,
  studentTabLabels,
  type AdminStudent,
  type StudentTab,
} from "../data/mockAdminStudents";
import { AdminIcon } from "../../dashboard/components/AdminIcon";

interface AdminStudentsTableProps {
  students: AdminStudent[];
  selectedId: string;
  onSelect: (student: AdminStudent) => void;
  isLoading?: boolean;
}

export const AdminStudentsTable = ({
  students,
  selectedId,
  onSelect,
  isLoading,
}: AdminStudentsTableProps) => {
  const basePath = getAdminBasePath();
  const [activeTab, setActiveTab] = useState<StudentTab>("active");

  const filteredStudents = useMemo(
    () => filterStudentsByTab(students, activeTab),
    [students, activeTab],
  );

  const {
    items: pagedStudents,
    pagination,
    setPage,
  } = useClientPagination(filteredStudents, 10);

  useEffect(() => {
    if (
      pagedStudents.length > 0 &&
      !pagedStudents.some((student) => student.id === selectedId)
    ) {
      onSelect(pagedStudents[0]);
    }
  }, [activeTab, pagedStudents, onSelect, selectedId]);

  const tabs = Object.entries(studentTabLabels) as [StudentTab, string][];

  return (
    <section
      className="rounded-3xl border border-[#e2e8f0] bg-white p-5 shadow-sm sm:p-6"
      dir="rtl"
    >
      <div className="mb-5 flex flex-wrap gap-6 border-b border-[#f1f5f9]">
        {tabs.map(([tabId, label]) => (
          <button
            key={tabId}
            type="button"
            onClick={() => setActiveTab(tabId)}
            className={cn(
              "pb-3 text-sm font-semibold transition-colors",
              activeTab === tabId
                ? "border-b-2 border-[#f5a524] text-[#f5a524]"
                : "text-[#64748b] hover:text-[#0f172a]",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="h-48 animate-pulse rounded-2xl bg-[#f8fafc]" />
      ) : filteredStudents.length === 0 ? (
        <p className="py-10 text-center text-sm text-[#64748b]">لا يوجد طلاب مطابقون.</p>
      ) : (
        <>
          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full min-w-[720px]">
              <thead>
                <tr className="border-b border-[#e2e8f0] text-sm text-[#64748b]">
                  <th className={tableCellClass.th}>الطالب</th>
                  <th className={tableCellClass.th}>الدورات</th>
                  <th className={tableCellClass.th}>إجمالي المدفوع</th>
                  <th className={tableCellClass.th}>الحالة</th>
                  <th className={tableCellClass.th}>إجراء</th>
                </tr>
              </thead>
              <tbody>
                {pagedStudents.map((student) => {
                  const status = paymentStatusLabels[student.paymentStatus];
                  const isSelected = student.id === selectedId;

                  return (
                    <tr
                      key={student.id}
                      onClick={() => onSelect(student)}
                      className={cn(
                        "cursor-pointer border-b border-[#f1f5f9] text-sm transition-colors last:border-0",
                        isSelected ? "bg-[#fff7ed]/60" : "hover:bg-[#f8fafc]",
                      )}
                    >
                      <td className={tableCellClass.td}>
                        <Link
                          to={`${basePath}/students/${student.id}`}
                          onClick={(event) => event.stopPropagation()}
                          className="block"
                        >
                          <TablePersonCell
                            name={student.name}
                            avatar={student.avatar}
                            avatarClassName="size-10"
                            subtitle={
                              <p className="truncate text-xs text-[#94a3b8]" dir="ltr">
                                {student.email}
                              </p>
                            }
                          />
                        </Link>
                      </td>
                      <td className={tableCellClass.td}>
                        <span className="inline-flex size-8 items-center justify-center rounded-lg bg-[#eff6ff] text-sm font-bold text-[#3b82f6]">
                          {student.coursesCount}
                        </span>
                      </td>
                      <td className={tableCellClass.td}>
                        <p className="font-bold text-[#0f172a]" dir="ltr">
                          {student.totalPaid}
                        </p>
                        <p
                          className={`mt-0.5 text-xs font-medium ${paymentNoteToneClass[student.paymentNoteTone]}`}
                        >
                          {student.paymentNote}
                        </p>
                      </td>
                      <td className={tableCellClass.td}>
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${status.className}`}
                        >
                          {status.label}
                        </span>
                      </td>
                      <td className={tableCellClass.td}>
                        <div className="flex items-center gap-2">
                          <StartChatButton
                            userId={student.userId || student.id}
                            name={student.name}
                            chatsPath="/admin/chats"
                          />
                          <button
                            type="button"
                            className="flex size-8 items-center justify-center rounded-lg border border-[#e2e8f0] text-[#64748b] transition-colors hover:bg-[#f8fafc] hover:text-[#3b82f6]"
                            aria-label="عرض الملف"
                            onClick={(event) => {
                              event.stopPropagation();
                              onSelect(student);
                            }}
                          >
                            <AdminIcon
                              src="/images/student/icon-eye.svg"
                              className="size-4"
                            />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 lg:hidden">
            {pagedStudents.map((student) => {
              const status = paymentStatusLabels[student.paymentStatus];
              const isSelected = student.id === selectedId;

              return (
                <button
                  key={student.id}
                  type="button"
                  onClick={() => onSelect(student)}
                  className={cn(
                    "w-full rounded-2xl border p-4 text-right transition-colors",
                    isSelected
                      ? "border-[#f5a524]/30 bg-[#fff7ed]/60"
                      : "border-[#f1f5f9] bg-[#f8fafc] hover:bg-white",
                  )}
                >
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${status.className}`}
                    >
                      {status.label}
                    </span>
                    <span className="font-bold text-[#0f172a]" dir="ltr">
                      {student.totalPaid}
                    </span>
                  </div>
                  <Link
                    to={`${basePath}/students/${student.id}`}
                    onClick={(event) => event.stopPropagation()}
                    className="block"
                  >
                    <TablePersonCell
                      name={student.name}
                      avatar={student.avatar}
                      avatarClassName="size-10"
                      subtitle={
                        <p className="truncate text-xs text-[#94a3b8]" dir="ltr">
                          {student.email}
                        </p>
                      }
                    />
                  </Link>
                  <div className="mt-3 flex justify-start">
                    <StartChatButton
                      userId={student.userId || student.id}
                      name={student.name}
                      chatsPath="/admin/chats"
                      iconOnly={false}
                    />
                  </div>
                </button>
              );
            })}
          </div>

          <Pagination
            pagination={pagination}
            onPageChange={setPage}
            summary={
              <>
                عرض {pagedStudents.length} من أصل {filteredStudents.length} طالب
              </>
            }
          />
        </>
      )}
    </section>
  );
};
