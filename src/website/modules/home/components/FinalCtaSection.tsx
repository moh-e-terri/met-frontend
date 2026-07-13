import { AmbientOrb, CountUp, Reveal } from "@/shared/motion";

export const FinalCtaSection = () => {
  return (
    <section className="relative overflow-hidden py-20 px-6 md:px-10 lg:px-16 bg-[#f8f7f5]">
      <AmbientOrb className="right-[10%] top-1/2 size-64 -translate-y-1/2 bg-[#f5a524]/20" />
      <AmbientOrb className="left-[8%] top-1/3 size-48 bg-white/40" delay />

      <div className="max-w-[1120px] mx-auto" dir="rtl">
        <Reveal direction="scale">
          <div className="relative bg-[#f5a524] rounded-[40px] px-10 py-16 text-center space-y-8 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/5 pointer-events-none" />

            <div className="relative space-y-3">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white leading-tight">
                هل أنت مستعد لتغيير مسارك الأكاديمي؟
              </h2>
              <p className="text-white/90 text-lg md:text-xl">
                انضم لأكثر من{" "}
                <CountUp value="5000" className="font-bold text-white" /> طالب
                وباشر رحلة التفوق التقني اليوم.
              </p>
            </div>

            <div className="relative flex flex-wrap justify-center gap-5">
              <button className="motion-glow-pulse bg-white text-[#f5a524] px-10 py-4 rounded-full text-[17px] font-bold hover:bg-gray-50 transition-all hover:scale-[1.02]">
                سجّل الآن
              </button>
              <button className="border-2 border-white/50 text-white px-10 py-4 rounded-full text-[17px] font-medium hover:bg-white/10 transition-all">
                تواصل معنا
              </button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};
