import { AlertCircle, CheckCircle2 } from "lucide-react";

const middleStats = [
  { value: "92%", label: "تحسن في الدرجات", color: "text-[#FB8C00]" },
  { value: "24/7", label: "دعم فني مباشر", color: "text-[#0A192F]" },
];

const sideStats = [
  { value: "+150", label: "مشروع تطبيقي", color: "text-[#00BFA5]" },
  { value: "+12K", label: "ساعة تدريبية", color: "text-[#0A192F]" },
];

function StatCard({
  value,
  label,
  color,
}: {
  value: string;
  label: string;
  color: string;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-[#f1f5f9] bg-[#f8fafc] px-4 py-8 text-center">
      <div className={`text-4xl font-bold leading-none md:text-5xl ${color}`}>
        {value}
      </div>
      <div className="mt-2 text-sm font-medium text-[#64748b] md:text-base">
        {label}
      </div>
    </div>
  );
}

function ProblemCard() {
  return (
    <div className="rounded-2xl border border-[#f1f5f9] border-r-4 border-r-[#ef4444] bg-[#fff5f5] p-6 text-right md:p-7">
      <div className="mb-3 flex items-center justify-end gap-2 text-[#ef4444]">
        <span className="text-lg font-bold md:text-xl">المشكلة</span>
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#ef4444]/15">
          <AlertCircle className="size-5" />
        </span>
      </div>
      <p className="text-sm leading-relaxed text-[#64748b] md:text-base">
        المناهج الأكاديمية غالباً ما تفتقر للجانب العملي، ويجد الطلاب صعوبة في
        ربط المفاهيم البرمجية بالواقع.
      </p>
    </div>
  );
}

function SolutionCard() {
  return (
    <div className="rounded-2xl border border-[#f1f5f9] border-r-4 border-r-[#00C853] bg-[#f0fdfa] p-6 text-right md:p-7">
      <div className="mb-3 flex items-center justify-end gap-2 text-[#00C853]">
        <span className="text-lg font-bold md:text-xl">حلنا الذكي</span>
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#00C853]/15">
          <CheckCircle2 className="size-5" />
        </span>
      </div>
      <p className="text-sm leading-relaxed text-[#64748b] md:text-base">
        نقدم شروحات مبسطة تركز على الفهم العميق مع تطبيق عملي مباشر على مشاريع
        واقعية تحاكي سوق العمل.
      </p>
    </div>
  );
}

export const StatsSection = () => {
  return (
    <section dir="rtl" className="bg-white px-6 py-16 md:px-12 md:py-20">
      <div className="mx-auto max-w-[1120px]">
        <div className="mb-10 text-center md:mb-12">
          <h2 className="text-3xl font-bold text-[#0f172a] md:text-4xl lg:text-5xl">
            لماذا MET E-Academy؟
          </h2>
          <p className="mx-auto mt-3 max-w-3xl text-base text-[#64748b] md:text-lg">
            نحن نعلم أن الفجوة كبيرة بين الدروس النظرية والمهارات التطبيقية،
            لذلك صممنا لك الحل.
          </p>
        </div>

        {/* Mobile: cards then 2×2 stats */}
        <div className="flex flex-col gap-4 lg:hidden">
          <div className="flex flex-col gap-4">
            <ProblemCard />
            <SolutionCard />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <StatCard {...sideStats[0]} />
            <StatCard {...middleStats[0]} />
            <StatCard {...sideStats[1]} />
            <StatCard {...middleStats[1]} />
          </div>
        </div>

        {/* Desktop — Figma RTL: wide cards right, two stat columns left */}
        <div className="hidden gap-5 lg:grid lg:grid-cols-4">
          <div className="flex flex-col gap-4 lg:col-span-2">
            <ProblemCard />
            <SolutionCard />
          </div>

          {/* Middle stats column — 92%, 24/7 */}
          <div className="flex flex-col gap-4">
            {middleStats.map((stat) => (
              <StatCard key={stat.label} {...stat} />
            ))}
          </div>

          {/* Left stats column — +150, +12K */}
          <div className="flex flex-col gap-4">
            {sideStats.map((stat) => (
              <StatCard key={stat.label} {...stat} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
