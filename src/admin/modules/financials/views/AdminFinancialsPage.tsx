import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PageMotion } from "@/shared/motion";
import {
  adminQueryKeys,
  cancelInstructorPayment,
  FINANCE_INSTRUCTORS_PAGE_SIZE,
  fetchAdminInstructorFinance,
  fetchAdminStatsRaw,
  locateAdminInstructorFinancePage,
  mapFinancialSummaryCards,
  matchesFinanceInstructor,
  releaseInstructorPayment,
} from "@/admin/api";
import { AdminFinancialsPageHeader } from "../components/AdminFinancialsPageHeader";
import { AdminFinancialSummaryCards } from "../components/AdminFinancialSummaryCards";
import {
  AdminInstructorsFinanceTable,
  type FinanceInstructorFocus,
} from "../components/AdminInstructorsFinanceTable";

export const AdminFinancialsPage = () => {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const [busyInstructorId, setBusyInstructorId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [focusMessage, setFocusMessage] = useState<string | null>(null);
  const locatedFocusKeyRef = useRef<string | null>(null);

  const focusInstructor = useMemo<FinanceInstructorFocus | null>(() => {
    const instructorId = searchParams.get("instructorId");
    const userId = searchParams.get("userId");
    const email = searchParams.get("email");
    const name = searchParams.get("name");
    if (!instructorId && !userId && !email && !name) return null;
    return { instructorId, userId, email, name };
  }, [searchParams]);

  const focusKey = [
    focusInstructor?.instructorId,
    focusInstructor?.userId,
    focusInstructor?.email,
    focusInstructor?.name,
  ]
    .filter(Boolean)
    .join("|");

  const instructorsQuery = useQuery({
    queryKey: adminQueryKeys.financePayments({
      page,
      limit: FINANCE_INSTRUCTORS_PAGE_SIZE,
    }),
    queryFn: () =>
      fetchAdminInstructorFinance({
        page,
        limit: FINANCE_INSTRUCTORS_PAGE_SIZE,
      }),
  });

  const statsRawQuery = useQuery({
    queryKey: [...adminQueryKeys.stats, "raw"],
    queryFn: fetchAdminStatsRaw,
  });

  // When arriving via «معالجة الدفع», jump to the page that contains that instructor.
  useEffect(() => {
    if (!focusInstructor || !focusKey) {
      locatedFocusKeyRef.current = null;
      return;
    }
    if (locatedFocusKeyRef.current === focusKey) return;

    const currentItems = instructorsQuery.data?.items ?? [];
    const onCurrentPage = currentItems.some((row) =>
      matchesFinanceInstructor(row, focusInstructor),
    );
    if (onCurrentPage) {
      locatedFocusKeyRef.current = focusKey;
      setFocusMessage(
        focusInstructor.name || focusInstructor.email || "المدرّس المحدد",
      );
      return;
    }

    if (instructorsQuery.isLoading) return;

    let cancelled = false;
    void (async () => {
      const located = await locateAdminInstructorFinancePage(
        focusInstructor,
        FINANCE_INSTRUCTORS_PAGE_SIZE,
      );
      if (cancelled) return;
      locatedFocusKeyRef.current = focusKey;
      if (!located) {
        setFocusMessage(null);
        setActionError("تعذر العثور على مستحقات هذا المدرّس في المالية.");
        return;
      }
      setFocusMessage(located.row.name || focusInstructor.name || focusInstructor.email || null);
      if (located.page !== page) {
        setPage(located.page);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [focusInstructor, focusKey, instructorsQuery.data?.items, instructorsQuery.isLoading, page]);

  const invalidateFinance = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["admin", "finance", "payments"] }),
      queryClient.invalidateQueries({ queryKey: [...adminQueryKeys.stats, "raw"] }),
    ]);
  };

  const releaseMutation = useMutation({
    mutationFn: async ({
      instructorId,
      amount,
      note,
      courseId,
    }: {
      instructorId: string;
      amount: number;
      note?: string;
      courseId?: string;
    }) => {
      setBusyInstructorId(instructorId);
      setActionError(null);
      setActionMessage(null);
      await releaseInstructorPayment(instructorId, { amount, note, courseId });
    },
    onSuccess: async () => {
      setActionMessage("تم صرف المبلغ بنجاح.");
      await invalidateFinance();
      await queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (error) => {
      setActionError(error instanceof Error ? error.message : "تعذر صرف المبلغ");
    },
    onSettled: () => setBusyInstructorId(null),
  });

  const cancelMutation = useMutation({
    mutationFn: async ({
      instructorId,
      amount,
      note,
      courseId,
    }: {
      instructorId: string;
      amount: number;
      note?: string;
      courseId?: string;
    }) => {
      setBusyInstructorId(instructorId);
      setActionError(null);
      setActionMessage(null);
      await cancelInstructorPayment(instructorId, { amount, note, courseId });
    },
    onSuccess: async () => {
      setActionMessage("تم إلغاء المبلغ المحجوز بنجاح.");
      await invalidateFinance();
      await queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (error) => {
      setActionError(error instanceof Error ? error.message : "تعذر إلغاء المبلغ");
    },
    onSettled: () => setBusyInstructorId(null),
  });

  const instructors = instructorsQuery.data?.items ?? [];
  const pagination = instructorsQuery.data?.pagination;
  const summaryCards = mapFinancialSummaryCards(
    statsRawQuery.data ?? {},
    pagination?.total ?? instructors.length,
  );

  const clearFocusParams = () => {
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current);
        next.delete("instructorId");
        next.delete("userId");
        next.delete("email");
        next.delete("name");
        return next;
      },
      { replace: true },
    );
    setFocusMessage(null);
    locatedFocusKeyRef.current = null;
  };

  return (
    <PageMotion className="mx-auto w-full max-w-[1280px] space-y-6">
      <AdminFinancialsPageHeader />

      <AdminFinancialSummaryCards
        cards={summaryCards}
        isLoading={statsRawQuery.isLoading || instructorsQuery.isLoading}
      />

      {instructorsQuery.isError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-right text-sm text-red-600">
          {instructorsQuery.error instanceof Error
            ? instructorsQuery.error.message
            : "تعذر تحميل مستحقات المدرسين"}
        </div>
      ) : null}

      {actionError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-right text-sm text-red-600">
          {actionError}
        </div>
      ) : null}

      {actionMessage ? (
        <div className="rounded-2xl border border-[#a7f3d0] bg-[#ecfdf5] px-4 py-3 text-right text-sm text-[#14b8a6]">
          {actionMessage}
        </div>
      ) : null}

      {focusInstructor && focusMessage && !instructorsQuery.isLoading ? (
        <div className="rounded-2xl border border-[#fde8c8] bg-[#fff7ed] px-4 py-3 text-right text-sm text-[#92400e]">
          تم فتح تفاصيل <span className="font-bold">{focusMessage}</span> لمعالجة الدفع
          {pagination && pagination.totalPages > 1 ? (
            <>
              {" "}
              (صفحة <span dir="ltr">{pagination.page}</span>)
            </>
          ) : null}
          .
          <button
            type="button"
            className="mr-3 text-xs font-bold text-[#f5a524] underline"
            onClick={clearFocusParams}
          >
            إغلاق التنبيه
          </button>
        </div>
      ) : null}

      <AdminInstructorsFinanceTable
        instructors={instructors}
        pagination={pagination}
        isLoading={instructorsQuery.isLoading}
        isFetching={instructorsQuery.isFetching}
        busyInstructorId={busyInstructorId}
        focusInstructor={focusInstructor}
        onPageChange={setPage}
        onRelease={async (instructorId, amount, note, courseId) => {
          await releaseMutation.mutateAsync({ instructorId, amount, note, courseId });
        }}
        onCancel={async (instructorId, amount, note, courseId) => {
          await cancelMutation.mutateAsync({ instructorId, amount, note, courseId });
        }}
      />
    </PageMotion>
  );
};
