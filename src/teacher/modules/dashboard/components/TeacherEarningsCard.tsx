import { AnimatedBar, CountUp } from "@/shared/motion";
import type { TeacherEarningsSummary } from "@/teacher/api";
import { TeacherIcon } from "./TeacherIcon";

interface TeacherEarningsCardProps {
  earnings?: TeacherEarningsSummary;
  isLoading?: boolean;
}

export const TeacherEarningsCard = ({ earnings, isLoading }: TeacherEarningsCardProps) => {
  if (isLoading || !earnings) {
    return <div className="h-64 animate-pulse rounded-3xl bg-[#e2e8f0]" />;
  }

  return (
    <section
      className="rounded-3xl border border-[#e2e8f0] bg-white p-5 shadow-sm sm:p-6"
      dir="rtl"
    >
      <h2 className="mb-4 text-right text-base font-bold text-[#0f172a]">ملخص الأرباح</h2>

      <CountUp
        value={earnings.total}
        className="block text-right text-3xl font-black text-[#14b8a6]"
      />

      <AnimatedBar
        value={earnings.progress}
        className="mt-4 h-2 bg-[#e2e8f0]"
        barClassName="rounded-full bg-[#14b8a6]"
      />

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-[#f8fafc] px-3 py-3 text-right">
          <p className="text-[10px] text-[#64748b]">الرصيد المتاح</p>
          <p className="mt-1 text-sm font-bold text-[#0f172a]" dir="ltr">
            {earnings.availableBalance}
          </p>
        </div>
        <div className="rounded-2xl bg-[#f8fafc] px-3 py-3 text-right">
          <p className="text-[10px] text-[#64748b]">مشتركون جدد</p>
          <p className="mt-1 text-sm font-bold text-[#14b8a6]" dir="ltr">
            {earnings.newSubscribers}
          </p>
        </div>
      </div>

      <button
        type="button"
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#f5a524] py-3 text-sm font-bold text-white shadow-[0px_10px_15px_-3px_rgba(245,165,36,0.2)] transition-transform hover:scale-[1.01]"
      >
        <TeacherIcon src="/images/teacher/icon-withdraw.svg" className="size-4 text-white" />
        <span>طلب سحب رصيد</span>
      </button>
    </section>
  );
};
