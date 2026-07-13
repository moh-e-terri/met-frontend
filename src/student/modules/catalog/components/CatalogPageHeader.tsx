import { StudentIcon } from "../../dashboard/components/StudentIcon";

interface CatalogPageHeaderProps {
  myMetPoints?: number;
}

export const CatalogPageHeader = ({ myMetPoints }: CatalogPageHeaderProps) => {
  return (
    <header
      className="relative overflow-hidden rounded-3xl border border-[#e2e8f0] bg-white p-6 shadow-sm sm:p-8"
      dir="rtl"
    >
      <div
        className="pointer-events-none absolute -left-20 -top-20 size-56 rounded-full bg-[#eff6ff] blur-2xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-16 -right-10 size-48 rounded-full bg-[#fff7ed] blur-2xl"
        aria-hidden
      />

      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 text-right">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-[#fff7ed] px-3 py-1 text-xs font-semibold text-[#f5a524]">
            <StudentIcon src="/images/student/icon-search.svg" className="size-3.5" />
            <span>استكشاف المقررات</span>
          </div>
          <h1 className="text-2xl font-black text-[#0f172a] sm:text-3xl">
            المقررات المتاحة
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-[#64748b]">
            تصفّح الدورات المتوافقة مع جامعتك، واشترك في ما يناسبك. بعد الاشتراك
            ستنتقل لإتمام الدفع عبر وسائل الدفع المتاحة.
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-3 rounded-2xl border border-[#fde8c8] bg-[#fff7ed]/60 px-4 py-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-white">
            <StudentIcon src="/images/admin/icon-coin.svg" className="size-5 text-[#f5a524]" />
          </span>
          <div className="text-right">
            <p className="text-xs font-semibold text-[#94a3b8]">رصيد MET</p>
            <p className="text-lg font-black text-[#0f172a]" dir="ltr">
              {myMetPoints ?? "—"}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};
