import { useQuery } from "@tanstack/react-query";
import { PageMotion } from "@/shared/motion";
import { fetchInstructorFinance, teacherQueryKeys } from "@/teacher/api";
import { TeacherPaymentAlerts, TeacherWithdrawCard } from "../components/TeacherWithdrawCard";
import { TeacherEarningsChart } from "../components/TeacherEarningsChart";
import { TeacherPaymentStatsCards } from "../components/TeacherPaymentStatsCards";
import { TeacherTransactionsTable } from "../components/TeacherTransactionsTable";

export const TeacherPaymentsPage = () => {
  const financeQuery = useQuery({
    queryKey: teacherQueryKeys.finance,
    queryFn: fetchInstructorFinance,
  });

  const finance = financeQuery.data;

  return (
    <PageMotion className="mx-auto w-full max-w-[1280px] space-y-6">
      {financeQuery.isError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-right text-sm text-red-600">
          {financeQuery.error instanceof Error
            ? financeQuery.error.message
            : "تعذر تحميل التقرير المالي"}
        </div>
      ) : null}

      <TeacherPaymentStatsCards stats={finance?.stats} isLoading={financeQuery.isLoading} />

      <section
        className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[320px_minmax(0,1fr)]"
        dir="ltr"
      >
        <aside className="order-2 space-y-6 xl:order-1 xl:row-start-1">
          <TeacherWithdrawCard
            availableWithdrawal={finance?.availableWithdrawal}
            withdrawalMethod={finance?.withdrawalMethod}
            isLoading={financeQuery.isLoading}
          />
          <TeacherPaymentAlerts alerts={finance?.alerts} isLoading={financeQuery.isLoading} />
        </aside>

        <div className="order-1 min-w-0 xl:order-2 xl:row-start-1">
          <TeacherEarningsChart
            chartMonthly={finance?.chartMonthly}
            chartWeekly={finance?.chartWeekly}
            isLoading={financeQuery.isLoading}
          />
        </div>
      </section>

      <TeacherTransactionsTable
        transactions={finance?.transactions}
        isLoading={financeQuery.isLoading}
      />
    </PageMotion>
  );
};
