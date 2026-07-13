import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PageMotion } from "@/shared/motion";
import {
  adminQueryKeys,
  fetchAdminFinancePayments,
  fetchAdminFinancePaymentsRaw,
  fetchAdminStatsRaw,
  mapFinancialBottomMetrics,
  mapFinancialSummaryCards,
  mapReleaseQueue,
  releaseInstructorPayment,
} from "@/admin/api";
import { AdminFinancialBottomCards } from "../components/AdminFinancialBottomCards";
import { AdminFinancialsPageHeader } from "../components/AdminFinancialsPageHeader";
import { AdminFinancialSummaryCards } from "../components/AdminFinancialSummaryCards";
import {
  AdminPlatformHealthCard,
  AdminReleaseQueueCard,
} from "../components/AdminFinancialSideCards";
import { AdminFinancialTransactionsTable } from "../components/AdminFinancialTransactionsTable";

export const AdminFinancialsPage = () => {
  const queryClient = useQueryClient();
  const [releasingId, setReleasingId] = useState<string | null>(null);

  const paymentsQuery = useQuery({
    queryKey: adminQueryKeys.financePayments(),
    queryFn: fetchAdminFinancePayments,
  });

  const paymentsRawQuery = useQuery({
    queryKey: [...adminQueryKeys.financePayments(), "raw"],
    queryFn: fetchAdminFinancePaymentsRaw,
  });

  const statsRawQuery = useQuery({
    queryKey: [...adminQueryKeys.stats, "raw"],
    queryFn: fetchAdminStatsRaw,
  });

  const releaseMutation = useMutation({
    mutationFn: async ({
      instructorId,
      amount,
      note,
    }: {
      instructorId: string;
      amount: number;
      note?: string;
    }) => {
      setReleasingId(instructorId);
      await releaseInstructorPayment(instructorId, { amount, note });
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: adminQueryKeys.financePayments() }),
        queryClient.invalidateQueries({ queryKey: [...adminQueryKeys.financePayments(), "raw"] }),
      ]);
    },
    onSettled: () => setReleasingId(null),
  });

  const payments = paymentsQuery.data ?? [];
  const statsRaw = statsRawQuery.data ?? {};
  const financePaymentsRaw = paymentsRawQuery.data ?? [];

  const summaryCards = mapFinancialSummaryCards(
    statsRaw,
    financePaymentsRaw.length,
  );
  const releaseQueue = mapReleaseQueue(financePaymentsRaw);
  const bottomMetrics = mapFinancialBottomMetrics(financePaymentsRaw, statsRaw);

  return (
    <PageMotion className="mx-auto w-full max-w-[1280px] space-y-6">
      <AdminFinancialsPageHeader />
      <AdminFinancialSummaryCards
        cards={summaryCards}
        isLoading={statsRawQuery.isLoading || paymentsQuery.isLoading}
      />

      {paymentsQuery.isError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-right text-sm text-red-600">
          {paymentsQuery.error instanceof Error
            ? paymentsQuery.error.message
            : "تعذر تحميل مستحقات المدرسين"}
        </div>
      ) : null}

      <section
        className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[320px_minmax(0,1fr)]"
        dir="ltr"
      >
        <aside className="order-2 space-y-6 xl:order-1 xl:row-start-1">
          <AdminReleaseQueueCard
            items={releaseQueue}
            isLoading={paymentsRawQuery.isLoading}
          />
          <AdminPlatformHealthCard totalTransactions={payments.length} />
        </aside>

        <div className="order-1 min-w-0 xl:order-2 xl:row-start-1">
          <AdminFinancialTransactionsTable
            payments={payments}
            isLoading={paymentsQuery.isLoading}
            releasingId={releasingId}
            onRelease={(instructorId, amount, note) =>
              releaseMutation.mutateAsync({ instructorId, amount, note })
            }
          />
        </div>
      </section>

      {releaseMutation.isError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-right text-sm text-red-600">
          {releaseMutation.error instanceof Error
            ? releaseMutation.error.message
            : "تعذر صرف المبلغ"}
        </div>
      ) : null}

      {releaseMutation.isSuccess ? (
        <div className="rounded-2xl border border-[#a7f3d0] bg-[#ecfdf5] px-4 py-3 text-right text-sm text-[#14b8a6]">
          تم صرف المبلغ بنجاح.
        </div>
      ) : null}

      <AdminFinancialBottomCards
        metrics={bottomMetrics}
        isLoading={statsRawQuery.isLoading}
      />
    </PageMotion>
  );
};
