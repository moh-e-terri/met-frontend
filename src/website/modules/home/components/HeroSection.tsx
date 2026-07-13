import { Link } from "react-router-dom";
import { AmbientOrb, CountUp, Reveal, Stagger } from "@/shared/motion";

export const HeroSection = () => {
  return (
    <section
      dir="rtl"
      className="relative w-full overflow-hidden bg-[#f8f7f5] py-12 md:py-16 lg:py-24"
    >
      <AmbientOrb className="right-[8%] top-12 size-56 bg-[#f5a524]/25" />
      <AmbientOrb
        className="left-[6%] top-32 size-72 bg-[#3b82f6]/15"
        delay
      />
      <AmbientOrb className="right-[35%] bottom-8 size-40 bg-[#14b8a6]/20" delay />

      <div className="relative mx-auto flex w-full max-w-[1280px] flex-col-reverse items-center gap-10 px-6 md:pl-20 md:pr-10 lg:flex-row lg:items-start lg:justify-between lg:gap-8">
        <Stagger
          className="flex w-full flex-col items-end text-right -translate-x-[15px] lg:h-[536px] lg:w-[536px] lg:shrink-0"
          staggerMs={120}
        >
          <h1 className="w-full font-bold text-[#0f172a] text-[36px] leading-[1.25] md:text-[48px] lg:text-[60px] lg:leading-[89px]">
            دعم أكاديمي ذكي
            <br />
            للمقررات التقنية…
          </h1>

          <h2 className="motion-shimmer-text mt-1 w-full text-[32px] font-normal leading-tight md:text-[38px] lg:mt-0 lg:text-[45px] lg:leading-[1.2]">
            من الجامعة إلى المهارة
          </h2>

          <p className="mt-3 w-full max-w-[576px] text-[16px] leading-[1.7] text-black md:text-[18px] md:leading-[29.25px]">
            لسد الفجوة بين التعليم الأكاديمي والمهارات العملية المطلوبة في سوق
            العمل السعودي لتمكين طلاب الحاسب والتقنية من التفوق.
          </p>

          <div className="mt-4 flex flex-wrap items-center justify-end gap-4 pt-4">
            <Link
              to="/signup"
              className="motion-glow-pulse rounded-[24px] bg-[#f5a524] px-8 py-[17.5px] text-lg font-bold text-white shadow-[0px_20px_25px_-5px_rgba(245,165,36,0.2),0px_8px_10px_-6px_rgba(245,165,36,0.2)] transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              سجّل الان
            </Link>
            <Link
              to="/courses"
              className="rounded-[24px] border-2 border-[#f1f5f9] bg-white px-[34px] py-[18px] text-lg font-normal text-black transition-colors hover:bg-gray-50"
            >
              تصفح المقررات
            </Link>
          </div>

          <div className="mt-2 flex items-center justify-end gap-4 pt-2">
            <img
              src="/images/small-photos.svg"
              alt="طلاب انضموا"
              className="h-10 w-auto"
            />
            <span className="text-sm leading-5 text-[#64748b] underline underline-offset-2">
              <CountUp value="+5000" className="font-semibold text-[#0f172a]" /> طالب انضموا إلينا
            </span>
          </div>
        </Stagger>

        <Reveal direction="left" className="w-full max-w-[536px] shrink-0 -translate-x-[25px] -translate-y-[45px] lg:w-[536px]">
          <div className="motion-float-slow relative">
            <div className="absolute -inset-4 rounded-[40px] bg-gradient-to-br from-[#f5a524]/10 to-[#3b82f6]/10 blur-2xl" />
            <img
              src="/images/hero-student.svg"
              alt="طلاب يتعلمون في MET E-Academy"
              className="relative block h-auto w-full"
              loading="lazy"
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
};
