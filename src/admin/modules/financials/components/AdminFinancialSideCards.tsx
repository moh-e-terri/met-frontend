import { AnimatedBar, CountUp } from "@/shared/motion";
import type { ReleaseQueueItem } from "@/admin/api";
import { AdminIcon } from "../../dashboard/components/AdminIcon";

interface AdminReleaseQueueCardProps {
  items: ReleaseQueueItem[];
  isLoading?: boolean;
}

export const AdminReleaseQueueCard = ({ items, isLoading }: AdminReleaseQueueCardProps) => {
  if (isLoading) {
    return <div className="h-56 animate-pulse rounded-3xl bg-[#e2e8f0]" />;
  }

  return (
    <section
      className="rounded-3xl border border-[#e2e8f0] bg-white p-5 shadow-sm sm:p-6"
      dir="rtl"
    >
      <h2 className="mb-5 text-base font-bold text-[#0f172a]">طابور الإفراج عن المحتجز</h2>

      {items.length === 0 ? (
        <p className="text-right text-sm text-[#64748b]">لا توجد مبالغ محتجزة حالياً.</p>
      ) : (
        <ul className="space-y-4">
          {items.map((batch) => (
            <li key={batch.id}>
              <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                <CountUp value={`${batch.progress}%`} className="font-semibold text-[#0f172a]" />
                <span className="text-[#475569]">{batch.label}</span>
              </div>
              <AnimatedBar value={batch.progress} className="h-2" barClassName={batch.barClass} />
              <p className="mt-1.5 text-right text-xs text-[#94a3b8]">{batch.daysRemaining}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export const AdminPlatformHealthCard = ({
  totalTransactions,
}: {
  totalTransactions: number;
}) => {
  return (
    <section
      className="motion-glow-pulse rounded-3xl bg-gradient-to-br from-[#f5a524] to-[#e6951f] p-5 text-white shadow-sm sm:p-6"
      dir="rtl"
    >
      <h2 className="text-lg font-bold">سلامة المنصة</h2>
      <p className="mt-3 text-sm leading-7 text-white/90">
        {totalTransactions} سجل مالي نشط — النظام يعمل بشكل طبيعي.
      </p>

      <div className="mt-5 flex items-center gap-2 rounded-2xl bg-white/15 px-3 py-2.5">
        <AdminIcon src="/images/student/icon-check.svg" className="size-4 shrink-0 text-white" />
        <p className="text-right text-xs font-semibold text-white">حالة النظام: يعمل بكامل طاقته</p>
      </div>
    </section>
  );
};
