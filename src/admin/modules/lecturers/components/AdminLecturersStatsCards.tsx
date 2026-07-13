import { CountUp, Stagger } from "@/shared/motion";
import { AdminIcon } from "../../dashboard/components/AdminIcon";

interface LecturerStatCard {
  label: string;
  value: string;
  badge?: string;
  badgeClassName?: string;
  showTrendIcon?: boolean;
  showStars?: boolean;
  icon: string;
  iconBg: string;
  iconColor: string;
}

interface AdminLecturersStatsCardsProps {
  stats: LecturerStatCard[];
  isLoading?: boolean;
}

export const AdminLecturersStatsCards = ({
  stats,
  isLoading,
}: AdminLecturersStatsCardsProps) => {
  if (isLoading) {
    return (
      <Stagger className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" dir="rtl" staggerMs={80}>
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-36 animate-pulse rounded-3xl bg-[#e2e8f0]" />
        ))}
      </Stagger>
    );
  }

  return (
    <Stagger className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" dir="rtl" staggerMs={80}>
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-3xl border border-[#e2e8f0] bg-white p-5 shadow-sm sm:p-6"
        >
          <div className="flex items-end justify-between gap-3" dir="rtl">
            <div className="min-w-0 text-right">
              <p className="mb-2 text-sm font-medium text-[#64748b]">{stat.label}</p>
              <CountUp
                value={stat.value}
                className="block text-[2rem] font-black leading-[0.95] tracking-tight text-[#0f172a] sm:text-[2.5rem]"
              />

              {stat.showStars ? (
                <div className="mt-2 flex items-center justify-end gap-0.5">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <AdminIcon
                      key={index}
                      src="/images/student/icon-star.svg"
                      className="size-3.5 text-[#f5a524]"
                    />
                  ))}
                </div>
              ) : null}

              {stat.badge ? (
                <span
                  className={`mt-2 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold ${stat.badgeClassName}`}
                  dir="ltr"
                >
                  {stat.showTrendIcon ? (
                    <AdminIcon
                      src="/images/student/icon-trending.svg"
                      className="size-3 text-[#14b8a6]"
                    />
                  ) : null}
                  {stat.badge}
                </span>
              ) : null}
            </div>

            <span
              className={`flex size-12 shrink-0 items-center justify-center rounded-2xl ${stat.iconBg}`}
            >
              <AdminIcon src={stat.icon} className={`size-5 ${stat.iconColor}`} />
            </span>
          </div>
        </div>
      ))}
    </Stagger>
  );
};
