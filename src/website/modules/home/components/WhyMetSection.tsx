import { AlertCircle, CheckCircle2 } from "lucide-react";
import { CountUp, Reveal, Stagger } from "@/shared/motion";

const GAP = "gap-5";

const stats = [
  {
    value: "150+",
    label: "مشروع تطبيقي",
    valueColor: "text-[#14b8a6]",
  },
  {
    value: "92%",
    label: "تحسن في الدرجات",
    valueColor: "text-[#f5a524]",
  },
  {
    value: "12K+",
    label: "ساعة تدريبية",
    valueColor: "text-[#1e293b]",
  },
  {
    value: "24/7",
    label: "دعم فني مباشر",
    valueColor: "text-[#1e293b]",
  },
];

function StatCard({
  value,
  label,
  valueColor,
}: {
  value: string;
  label: string;
  valueColor: string;
}) {
  return (
    <div className="flex h-full min-h-[120px] flex-col items-center justify-center gap-1 rounded-2xl bg-[#f8f7f5] p-5 text-center transition-[transform,box-shadow,background-color] duration-[350ms] ease-out hover:-translate-y-0.5 hover:bg-[#f1f5f9] hover:shadow-md sm:p-6">
      <CountUp
        value={value}
        className={`block text-[28px] font-black leading-9 sm:text-[30px] ${valueColor}`}
      />
      <div className="text-sm leading-5 text-[#64748b]">{label}</div>
    </div>
  );
}

export const WhyMetSection = () => {
  return (
    <section dir="rtl" className="bg-white px-6 py-16 md:px-12 md:py-20 lg:px-20">
      <div className="mx-auto max-w-[1120px] space-y-12 md:space-y-16">
        <div className="space-y-4 text-center">
          <Reveal>
            <h2 className="text-3xl font-black text-[#0f172a] md:text-4xl">
              لماذا MET E-Academy؟
            </h2>
            <p className="mx-auto mt-4 max-w-[672px] text-base text-[#64748b] md:text-lg">
              نحن نعلم أن الفجوة كبيرة بين الدروس النظرية والمهارات التطبيقية،
              لذلك صممنا لك الحل.
            </p>
          </Reveal>
        </div>

        <div className={`flex flex-col ${GAP} lg:flex-row lg:items-stretch`}>
          <Stagger
            className={`flex w-full flex-col ${GAP} lg:min-h-0 lg:flex-1`}
            staggerMs={100}
          >
            <div className="flex flex-1 gap-4 rounded-2xl border-r-4 border-r-[#f87171] bg-[rgba(254,242,242,0.5)] p-6 text-right">
              <div className="flex flex-1 flex-col justify-center space-y-2">
                <h3 className="text-xl font-bold text-[#b91c1c]">المشكلة</h3>
                <p className="text-base leading-[26px] text-[#475569]">
                  المناهج الأكاديمية غالباً ما تفتقر للجانب العملي، ويجد الطلاب
                  صعوبة في ربط المفاهيم البرمجية بالواقع.
                </p>
              </div>
              <AlertCircle className="size-[25px] shrink-0 self-start text-[#f87171]" />
            </div>

            <div className="flex flex-1 gap-4 rounded-2xl border-r-4 border-r-[#14b8a6] bg-[rgba(20,184,166,0.05)] p-6 text-right">
              <div className="flex flex-1 flex-col justify-center space-y-2">
                <h3 className="text-xl font-bold text-[#14b8a6]">حلنا الذكي</h3>
                <p className="text-base leading-[26px] text-[#475569]">
                  نقدم شروحات مبسطة تركز على الفهم العميق مع تطبيق عملي مباشر
                  على مشاريع واقعية تحاكي سوق العمل.
                </p>
              </div>
              <CheckCircle2 className="size-[25px] shrink-0 self-start text-[#14b8a6]" />
            </div>
          </Stagger>

          <Stagger
            dir="ltr"
            className={`grid w-full grid-cols-2 grid-rows-2 ${GAP} lg:min-h-0 lg:flex-1`}
            staggerMs={90}
          >
            {stats.map((stat) => (
              <StatCard key={stat.label} {...stat} />
            ))}
          </Stagger>
        </div>
      </div>
    </section>
  );
};
