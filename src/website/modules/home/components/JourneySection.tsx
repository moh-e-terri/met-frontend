import { Reveal, Stagger } from "@/shared/motion";

export const JourneySection = () => {
  const steps = [
    {
      number: "01",
      title: "اختر المقرر",
      description: "تصفح مكتبة المقررات المتنوعة واختر ما يناسب تخصصك الدراسي.",
      style: "border-4 border-[#f5a524]/40 text-[#f5a524] bg-white",
    },
    {
      number: "02",
      title: "شاهد وطبّق",
      description:
        "تابع الشروحات المرئية ونفذ التمارين البرمجية والتقنية فوراً.",
      style: "border-4 border-[#f5a524]/70 text-[#f5a524] bg-[#FFF8EC]",
    },
    {
      number: "03",
      title: "راجع وتقدم",
      description:
        "استخدم الملخصات وبنك الأسئلة لضمان التفوق والحصول على الامتياز.",
      style: "bg-[#f5a524] text-white border-4 border-[#f5a524]",
    },
  ];

  return (
    <section
      className="py-20 px-6 md:px-10 lg:px-16 bg-[#ffffff]"
      id="how-it-works"
    >
      <div className="max-w-[1280px] mx-auto space-y-16" dir="rtl">
        <Reveal className="text-center">
          <h2 className="text-4xl md:text-5xl font-black text-[#0f172a]">
            رحلة نجاحك في 3 خطوات
          </h2>
        </Reveal>

        <Stagger className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center" staggerMs={140}>
          {steps.map((step, i) => (
            <div key={i} className="flex flex-col items-center gap-6">
              <Reveal direction="scale" delay={i * 80}>
                <div
                  className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-black ${step.style} motion-glow-pulse`}
                  style={{ animationDelay: `${i * 0.6}s` }}
                >
                  {step.number}
                </div>
              </Reveal>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-[#0f172a]">
                  {step.title}
                </h3>
                <p className="text-[#64748b] text-[15px] leading-relaxed max-w-[260px] mx-auto">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </Stagger>
      </div>
    </section>
  );
};
