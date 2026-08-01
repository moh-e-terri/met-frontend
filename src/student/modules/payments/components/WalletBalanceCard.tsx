import { CountUp } from "@/shared/motion";
import { StudentIcon } from "../../dashboard/components/StudentIcon";

interface WalletBalanceCardProps {
  currentMet?: number;
  currentUsd?: number;
  isLoading?: boolean;
}

export const WalletBalanceCard = ({
  currentMet = 0,
  currentUsd,
  isLoading,
}: WalletBalanceCardProps) => {
  if (isLoading) {
    return <div className="h-48 animate-pulse rounded-[28px] bg-[#e2e8f0]" />;
  }

  return (
    <section
      className="relative overflow-hidden rounded-[28px] border border-[#e2e8f0] bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] p-6 text-white shadow-sm sm:p-8"
      dir="rtl"
    >
      <div className="pointer-events-none absolute -left-10 top-0 size-40 rounded-full bg-[#f5a524]/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-8 bottom-0 size-32 rounded-full bg-[#14b8a6]/15 blur-3xl" />

      <div className="relative flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-white/70">رصيدك الحالي</p>
          <p className="mt-3 flex items-baseline gap-2" dir="ltr">
            <CountUp
              value={currentMet.toLocaleString("en-US")}
              className="text-4xl font-black tracking-tight sm:text-5xl"
            />
            <span className="text-lg font-bold text-[#f5a524]">MET</span>
          </p>
          {typeof currentUsd === "number" ? (
            <p className="mt-3 text-sm text-white/65">
              يعادل تقريباً{" "}
              <span className="font-bold text-white" dir="ltr">
                {currentUsd.toLocaleString("en-US")} USD
              </span>
            </p>
          ) : (
            <p className="mt-3 text-sm text-white/65">
              نقاط MET قابلة للاستخدام للاشتراك في المقررات
            </p>
          )}
        </div>

        <span className="flex size-14 items-center justify-center rounded-2xl bg-white/10">
          <StudentIcon
            src="/images/student/icon-wallet.svg"
            className="size-7 text-[#f5a524]"
          />
        </span>
      </div>
    </section>
  );
};
