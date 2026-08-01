import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import type {
  AdminInstructorFinanceCourse,
  AdminInstructorFinanceRow,
} from "@/admin/api/adminFinance";
import { matchesFinanceInstructor } from "@/admin/api/adminFinance";
import type { PaginationMeta } from "@/core/api/pagination";
import { AppModal } from "@/shared/components/AppModal";
import { Pagination } from "@/shared/components/Pagination";
import { tableCellClass } from "@/shared/components/TablePersonCell";
import { cn } from "@/shared/utils/cn";

export interface FinanceInstructorFocus {
  instructorId?: string | null;
  userId?: string | null;
  email?: string | null;
  name?: string | null;
}

interface AdminInstructorsFinanceTableProps {
  instructors: AdminInstructorFinanceRow[];
  pagination?: PaginationMeta;
  isLoading?: boolean;
  isFetching?: boolean;
  busyInstructorId?: string | null;
  focusInstructor?: FinanceInstructorFocus | null;
  onPageChange?: (page: number) => void;
  onRelease: (
    instructorId: string,
    amount: number,
    note?: string,
    courseId?: string,
  ) => Promise<void>;
  onCancel: (
    instructorId: string,
    amount: number,
    note?: string,
    courseId?: string,
  ) => Promise<void>;
}

type ModalMode = "release" | "cancel" | null;

type FinanceModalTarget = {
  mode: ModalMode;
  instructor: AdminInstructorFinanceRow;
  course: AdminInstructorFinanceCourse;
};

/** المبلغ القابل للصرف/الإلغاء لدورة — محدود برصيد المحجوز الفعلي للمدرس من الـ API. */
export function actionableCourseReserved(
  course: AdminInstructorFinanceCourse,
  instructor: AdminInstructorFinanceRow,
): number {
  if (instructor.totalReservedMET <= 0 || course.reservedMET <= 0) return 0;
  const coursesSum = instructor.courses.reduce((sum, item) => sum + item.reservedMET, 0);
  if (coursesSum <= 0) return 0;
  if (coursesSum <= instructor.totalReservedMET) {
    return Math.min(course.reservedMET, instructor.totalReservedMET);
  }
  return Math.floor((course.reservedMET / coursesSum) * instructor.totalReservedMET);
}

export const AdminInstructorsFinanceTable = ({
  instructors,
  pagination,
  isLoading,
  isFetching,
  busyInstructorId,
  focusInstructor,
  onPageChange,
  onRelease,
  onCancel,
}: AdminInstructorsFinanceTableProps) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [modal, setModal] = useState<FinanceModalTarget | null>(null);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const focusedRowRef = useRef<HTMLTableRowElement | HTMLElement | null>(null);
  const appliedFocusKeyRef = useRef<string | null>(null);

  const focusKey = [
    focusInstructor?.instructorId,
    focusInstructor?.userId,
    focusInstructor?.email,
    focusInstructor?.name,
  ]
    .filter(Boolean)
    .join("|");

  useEffect(() => {
    if (!focusKey || instructors.length === 0) return;

    const target = instructors.find((row) =>
      matchesFinanceInstructor(row, focusInstructor ?? {}),
    );
    if (!target) return;
    if (appliedFocusKeyRef.current === `${focusKey}@${target.instructorId}`) return;

    appliedFocusKeyRef.current = `${focusKey}@${target.instructorId}`;
    setExpandedId(target.instructorId);
    setHighlightedId(target.instructorId);
  }, [focusKey, focusInstructor, instructors]);

  useEffect(() => {
    if (!highlightedId) return;
    const frame = window.requestAnimationFrame(() => {
      focusedRowRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [highlightedId, expandedId, pagination?.page, instructors]);

  const maxAmount = modal ? actionableCourseReserved(modal.course, modal.instructor) : 0;
  const amountNumber = Number(amount);

  const openModal = (
    mode: Exclude<ModalMode, null>,
    instructor: AdminInstructorFinanceRow,
    course: AdminInstructorFinanceCourse,
  ) => {
    const available = actionableCourseReserved(course, instructor);
    setLocalError(null);
    setModal({ mode, instructor, course });
    setAmount(available > 0 ? String(available) : "");
    setNote(
      mode === "release"
        ? `دفعة مستحقات — ${course.title}`
        : `إلغاء استحقاق — ${course.title}`,
    );
  };

  const closeModal = () => {
    if (busyInstructorId) return;
    setModal(null);
    setLocalError(null);
  };

  const submit = async () => {
    if (!modal) return;
    if (!Number.isFinite(amountNumber) || amountNumber <= 0) {
      setLocalError("أدخل مبلغاً صالحاً أكبر من صفر.");
      return;
    }
    if (amountNumber > maxAmount) {
      setLocalError(
        `لا يمكن ${modal.mode === "release" ? "صرف" : "إلغاء"} ${amountNumber.toLocaleString("en-US")} MET. الحد الأقصى لهذه الدورة هو ${maxAmount.toLocaleString("en-US")} MET.`,
      );
      return;
    }

    setLocalError(null);
    try {
      if (modal.mode === "release") {
        await onRelease(
          modal.instructor.instructorId,
          amountNumber,
          note.trim() || undefined,
          modal.course.courseId,
        );
      } else {
        await onCancel(
          modal.instructor.instructorId,
          amountNumber,
          note.trim() || undefined,
          modal.course.courseId,
        );
      }
      closeModal();
    } catch (error) {
      setLocalError(error instanceof Error ? error.message : "تعذر تنفيذ العملية");
    }
  };

  const modalTitle = useMemo(() => {
    if (modal?.mode === "release") return "صرف محجوز الدورة";
    if (modal?.mode === "cancel") return "إلغاء محجوز الدورة";
    return "";
  }, [modal?.mode]);

  return (
    <>
      <section
        className="rounded-3xl border border-[#e2e8f0] bg-white p-5 shadow-sm sm:p-6"
        dir="rtl"
      >
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-[#0f172a]">مستحقات المدرسين</h2>
          <span className="rounded-full bg-[#f8fafc] px-3 py-1 text-xs font-semibold text-[#64748b]">
            {pagination?.total ?? instructors.length} مدرّس
          </span>
        </div>

        {isLoading ? (
          <div className="h-48 animate-pulse rounded-2xl bg-[#f8fafc]" />
        ) : instructors.length === 0 ? (
          <p className="py-10 text-center text-sm text-[#64748b]">لا توجد مستحقات حالياً.</p>
        ) : (
          <>
            <div className="hidden overflow-x-auto xl:block">
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="border-b border-[#e2e8f0] text-sm text-[#64748b]">
                    <th className={tableCellClass.th}>المدرس</th>
                    <th className={tableCellClass.th}>الكورسات</th>
                    <th className={tableCellClass.th}>المكتسب</th>
                    <th className={tableCellClass.th}>المحجوز</th>
                    <th className={tableCellClass.th}>المصروف</th>
                    <th className={tableCellClass.th}>التفاصيل</th>
                  </tr>
                </thead>
                <tbody>
                  {instructors.map((row) => {
                    const expanded = expandedId === row.instructorId;
                    const highlighted = highlightedId === row.instructorId;
                    return (
                      <Fragment key={row.instructorId}>
                        <tr
                          ref={highlighted ? focusedRowRef : undefined}
                          className={cn(
                            "border-b border-[#f1f5f9] text-sm last:border-0",
                            highlighted ? "bg-[#fff7ed]/80" : "",
                          )}
                        >
                          <td className={tableCellClass.td}>
                            <p className="font-bold text-[#0f172a]">{row.name}</p>
                            {row.email ? (
                              <p className="mt-0.5 text-xs text-[#94a3b8]" dir="ltr">
                                {row.email}
                              </p>
                            ) : null}
                          </td>
                          <td className={tableCellClass.tdMuted}>
                            <span dir="ltr">{row.coursesCount}</span>
                          </td>
                          <td className={tableCellClass.tdStrong}>
                            <span dir="ltr">
                              {row.totalEarnedMET.toLocaleString("en-US")} MET
                            </span>
                          </td>
                          <td className={`${tableCellClass.td} font-semibold text-[#f59e0b]`}>
                            <span dir="ltr">
                              {row.totalReservedMET.toLocaleString("en-US")} MET
                            </span>
                          </td>
                          <td className={`${tableCellClass.td} font-semibold text-[#14b8a6]`}>
                            <span dir="ltr">
                              {row.totalReleasedMET.toLocaleString("en-US")} MET
                            </span>
                          </td>
                          <td className={tableCellClass.td}>
                            <button
                              type="button"
                              onClick={() =>
                                setExpandedId(expanded ? null : row.instructorId)
                              }
                              className="rounded-xl border border-[#e2e8f0] px-3 py-1.5 text-xs font-bold text-[#0f172a] hover:bg-[#f8fafc]"
                            >
                              {expanded ? "إخفاء" : "تفاصيل"}
                            </button>
                          </td>
                        </tr>
                        {expanded ? (
                          <tr className="bg-[#f8fafc]">
                            <td colSpan={6} className="px-4 py-4">
                              <InstructorExpandedPanel
                                row={row}
                                busy={busyInstructorId === row.instructorId}
                                onRelease={(course) => openModal("release", row, course)}
                                onCancel={(course) => openModal("cancel", row, course)}
                              />
                            </td>
                          </tr>
                        ) : null}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="space-y-3 xl:hidden">
              {instructors.map((row) => {
                const expanded = expandedId === row.instructorId;
                const highlighted = highlightedId === row.instructorId;
                return (
                  <article
                    key={row.instructorId}
                    ref={highlighted ? focusedRowRef : undefined}
                    className={cn(
                      "rounded-2xl border p-4",
                      highlighted
                        ? "border-[#f5a524]/40 bg-[#fff7ed]/70"
                        : "border-[#f1f5f9] bg-[#f8fafc]",
                    )}
                  >
                    <button
                      type="button"
                      className="flex w-full items-start justify-between gap-3 text-right"
                      onClick={() => setExpandedId(expanded ? null : row.instructorId)}
                    >
                      <div>
                        <p className="font-bold text-[#0f172a]">{row.name}</p>
                        <p className="mt-1 text-xs text-[#94a3b8]">
                          {row.coursesCount} كورسات · محجوز{" "}
                          <span dir="ltr">{row.totalReservedMET} MET</span>
                        </p>
                      </div>
                      <span className="text-xs font-bold text-[#f5a524]">
                        {expanded ? "▲" : "▼"}
                      </span>
                    </button>
                    {expanded ? (
                      <div className="mt-4">
                        <InstructorExpandedPanel
                          row={row}
                          busy={busyInstructorId === row.instructorId}
                          onRelease={(course) => openModal("release", row, course)}
                          onCancel={(course) => openModal("cancel", row, course)}
                        />
                      </div>
                    ) : null}
                  </article>
                );
              })}
            </div>

            <Pagination
              pagination={
                pagination ?? {
                  page: 1,
                  totalPages: 1,
                  total: instructors.length,
                  limit: instructors.length || 10,
                  hasNextPage: false,
                  hasPrevPage: false,
                }
              }
              onPageChange={onPageChange ?? (() => undefined)}
              disabled={isFetching}
              summary={
                <>
                  عرض {instructors.length} من أصل {pagination?.total ?? instructors.length} مدرّس
                </>
              }
            />
          </>
        )}
      </section>

      <AppModal
        open={Boolean(modal)}
        onClose={closeModal}
        title={modalTitle}
        size="sm"
        footer={
          <div className="flex flex-wrap justify-end gap-3">
            <button
              type="button"
              onClick={closeModal}
              disabled={Boolean(busyInstructorId)}
              className="rounded-2xl border border-[#e2e8f0] px-4 py-2.5 text-sm font-bold text-[#64748b]"
            >
              {modal?.mode === "release" ? "إلغاء" : "رجوع"}
            </button>
            <button
              type="button"
              disabled={Boolean(busyInstructorId) || maxAmount <= 0}
              onClick={() => void submit()}
              className={cn(
                "rounded-2xl px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60",
                modal?.mode === "release" ? "bg-[#f5a524]" : "bg-[#ef4444]",
              )}
            >
              {busyInstructorId
                ? "جاري التنفيذ..."
                : modal?.mode === "release"
                  ? "تأكيد الصرف"
                  : "تأكيد الإلغاء"}
            </button>
          </div>
        }
      >
        {modal ? (
          <>
            <p className="text-sm text-[#64748b]">
              المدرس:{" "}
              <span className="font-bold text-[#0f172a]">{modal.instructor.name}</span>
            </p>
            <p className="mt-1 text-sm text-[#64748b]">
              الدورة:{" "}
              <span className="font-bold text-[#0f172a]">{modal.course.title}</span>
            </p>
            <p className="mt-1 text-sm text-[#64748b]">
              المحجوز القابل للتصرف لهذه الدورة:{" "}
              <span className="font-bold text-[#f59e0b]" dir="ltr">
                {maxAmount.toLocaleString("en-US")} MET
              </span>
            </p>
            {modal.course.reservedMET > maxAmount ? (
              <p className="mt-2 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800">
                يظهر في بيانات الدورة{" "}
                <span dir="ltr">{modal.course.reservedMET} MET</span> محجوز، لكن رصيد المحجوز
                الفعلي للمدرس هو{" "}
                <span dir="ltr">{modal.instructor.totalReservedMET} MET</span> — الصرف يعتمد
                على الرصيد الفعلي فقط.
              </p>
            ) : null}

            <label className="mt-5 block text-right text-sm font-semibold text-[#0f172a]">
              {modal.mode === "release" ? "المبلغ المراد صرفه" : "المبلغ المراد إلغاؤه"}
              <input
                type="number"
                min={0}
                max={maxAmount}
                step={1}
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                className="mt-2 h-11 w-full rounded-2xl border border-[#e2e8f0] px-3 text-sm outline-none focus:border-[#f5a524]"
                dir="ltr"
              />
            </label>

            <label className="mt-4 block text-right text-sm font-semibold text-[#0f172a]">
              {modal.mode === "release" ? "ملاحظة" : "سبب الإلغاء"}
              <textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                rows={3}
                className="mt-2 w-full rounded-2xl border border-[#e2e8f0] px-3 py-2 text-sm outline-none focus:border-[#f5a524]"
                placeholder={
                  modal.mode === "release" ? "دفعة شهر يوليو" : "استرداد رسوم الطلاب"
                }
              />
            </label>

            {localError ? (
              <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-600">
                {localError}
              </p>
            ) : null}
          </>
        ) : null}
      </AppModal>
    </>
  );
};

function InstructorExpandedPanel({
  row,
  busy,
  onRelease,
  onCancel,
}: {
  row: AdminInstructorFinanceRow;
  busy?: boolean;
  onRelease: (course: AdminInstructorFinanceCourse) => void;
  onCancel: (course: AdminInstructorFinanceCourse) => void;
}) {
  return (
    <div className="space-y-3 text-right">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-bold text-[#0f172a]">الكورسات</p>
        <p className="text-xs text-[#64748b]">
          محجوز المدرس الكلي:{" "}
          <span className="font-semibold text-[#f59e0b]" dir="ltr">
            {row.totalReservedMET.toLocaleString("en-US")} MET
          </span>
        </p>
      </div>

      {row.courses.length === 0 ? (
        <p className="text-sm text-[#94a3b8]">لا توجد كورسات مرتبطة.</p>
      ) : (
        <ul className="space-y-2">
          {row.courses.map((course) => {
            const available = actionableCourseReserved(course, row);
            const canAct = available > 0 && !busy;
            return (
              <li
                key={course.courseId}
                className="rounded-xl border border-[#e2e8f0] bg-white px-3 py-3 text-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-[#0f172a]">{course.title}</p>
                    <p className="mt-1 text-xs text-[#64748b]">
                      <span dir="ltr">{course.enrolledCount}</span> طالب
                      <span className="mx-1.5 text-[#cbd5e1]">·</span>
                      محجوز الدورة{" "}
                      <span className="font-semibold text-[#f59e0b]" dir="ltr">
                        {course.reservedMET.toLocaleString("en-US")} MET
                      </span>
                      {available !== course.reservedMET ? (
                        <>
                          <span className="mx-1.5 text-[#cbd5e1]">·</span>
                          قابل للتصرف{" "}
                          <span className="font-semibold text-[#0f172a]" dir="ltr">
                            {available.toLocaleString("en-US")} MET
                          </span>
                        </>
                      ) : null}
                    </p>
                    {course.reservedMET > 0 && available <= 0 ? (
                      <p className="mt-1.5 text-[11px] text-amber-700">
                        لا يوجد رصيد محجوز فعلي للمدرس حالياً، لذلك لا يمكن الصرف أو الإلغاء.
                      </p>
                    ) : null}
                    {course.reservedMET <= 0 ? (
                      <p className="mt-1.5 text-[11px] text-[#94a3b8]">
                        لا يوجد مبلغ محجوز لهذه الدورة.
                      </p>
                    ) : null}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={!canAct}
                      onClick={() => onRelease(course)}
                      className="rounded-2xl bg-[#f5a524] px-3 py-1.5 text-xs font-bold text-white disabled:opacity-45"
                    >
                      صرف المحجوز
                    </button>
                    <button
                      type="button"
                      disabled={!canAct}
                      onClick={() => onCancel(course)}
                      className="rounded-2xl border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600 disabled:opacity-45"
                    >
                      إلغاء المحجوز
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
