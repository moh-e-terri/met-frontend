import { useQuery } from "@tanstack/react-query";
import { PageMotion } from "@/shared/motion";
import { fetchInstructorFinance, teacherQueryKeys } from "@/teacher/api";
import { TeacherCourseBreakdownTable } from "../components/TeacherCourseBreakdownTable";
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
      <header className="text-right" dir="rtl">
        <h1 className="text-2xl font-black text-[#0f172a] sm:text-3xl">الداشبورد المالي</h1>
        <p className="mt-2 text-sm text-[#64748b]">
          تابع إجمالي أرباحك، المبالغ المحجوزة، وما تم صرفه من الإدارة.
        </p>
      </header>

      {financeQuery.isError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-right text-sm text-red-600">
          {financeQuery.error instanceof Error
            ? financeQuery.error.message
            : "تعذر تحميل التقرير المالي"}
        </div>
      ) : null}

      <TeacherPaymentStatsCards stats={finance?.stats} isLoading={financeQuery.isLoading} />

      <TeacherCourseBreakdownTable
        courses={finance?.courseBreakdown}
        isLoading={financeQuery.isLoading}
      />

      <TeacherTransactionsTable
        transactions={finance?.transactions}
        isLoading={financeQuery.isLoading}
      />
    </PageMotion>
  );
};
