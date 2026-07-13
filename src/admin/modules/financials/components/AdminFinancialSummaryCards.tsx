import type { FinancialSummaryCardData } from "@/admin/api";
import { AnimatedBar, CountUp } from "@/shared/motion";
import { AdminIcon } from "../../dashboard/components/AdminIcon";

interface AdminFinancialSummaryCardsProps {
  cards: FinancialSummaryCardData[];
  isLoading?: boolean;
}

export const AdminFinancialSummaryCards = ({
  cards,
  isLoading,
}: AdminFinancialSummaryCardsProps) => {
  if (isLoading) {
    return (
      <section className="grid gap-4 lg:grid-cols-3" dir="rtl">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="h-44 animate-pulse rounded-3xl bg-[#e2e8f0]" />
        ))}
      </section>
    );
  }

  return (
    <section className="grid gap-4 lg:grid-cols-3" dir="rtl">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-3xl border border-[#e2e8f0] bg-white p-5 shadow-sm sm:p-6"
        >
          <div className="mb-4 flex items-start justify-between gap-3">
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${card.badgeClassName}`}
              dir="ltr"
            >
              {card.showTrend && (
                <AdminIcon
                  src="/images/student/icon-trending.svg"
                  className="size-3 text-[#14b8a6]"
                />
              )}
              {card.badge}
            </span>

            <span
              className={`flex size-11 shrink-0 items-center justify-center rounded-2xl ${card.iconBg}`}
            >
              <AdminIcon src={card.icon} className={`size-5 ${card.iconColor}`} />
            </span>
          </div>

          <p className="text-right">
            <CountUp
              value={card.value}
              className="text-[1.75rem] font-black leading-none tracking-tight text-[#0f172a] sm:text-[2.25rem]"
            />
            <span className="mr-1 text-base font-bold text-[#64748b]">{card.suffix}</span>
          </p>

          <p className="mt-3 text-right text-sm font-medium text-[#64748b]">{card.label}</p>

          {card.note ? (
            <p className="mt-1 text-right text-xs text-[#94a3b8]">{card.note}</p>
          ) : null}

          {card.releaseProgress !== undefined ? (
            <div className="mt-4">
              <div className="mb-2 flex items-center justify-between text-xs">
                <CountUp
                  value={`${card.releaseProgress}%`}
                  className="font-semibold text-[#f5a524]"
                />
                <span className="text-[#64748b]">{card.releaseLabel}</span>
              </div>
              <AnimatedBar
                value={card.releaseProgress}
                className="h-2"
                barClassName="bg-[#f5a524]"
              />
            </div>
          ) : null}
        </div>
      ))}
    </section>
  );
};
