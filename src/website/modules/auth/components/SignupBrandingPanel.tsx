import { GraduationCap } from "lucide-react";

export const SignupBrandingPanel = () => {
  return (
    <div
      className="relative flex h-full min-h-screen items-center justify-center px-16 py-20"
      style={{
        backgroundImage:
          "linear-gradient(134deg, #f5a524 0.89%, rgba(245,165,36,0.8) 56.89%, #14b8a6 115.13%)",
      }}
    >
      <div className="pointer-events-none absolute -right-12 -top-12 size-[235px] rounded-[200px] bg-white/10 blur-[20px]" />
      <div className="pointer-events-none absolute bottom-24 right-[260px] size-[384px] rounded-[174.5px] bg-white/10 blur-[20px]" />
      <div className="pointer-events-none absolute left-10 top-20 size-64 rounded-full bg-[rgba(20,184,166,0.16)] blur-[32px]" />

      <div className="relative max-w-[512px] text-right text-white">
        <div className="mb-8 flex justify-end">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-[6px]">
            <GraduationCap className="size-9 text-white" />
          </div>
        </div>

        <h2 className="text-4xl font-black leading-[48px] md:text-5xl">
          ابدأ رحلتك التعليمية
          <br />
          مع خبراء MET
        </h2>

        <p className="mt-6 text-lg font-light leading-7 text-white/90">
          انضم إلى آلاف الطلاب الذين حققوا نجاحات مبهرة من خلال دوراتنا
          المتخصصة والمناهج التفاعلية المبتكرة.
        </p>

        <div className="mt-10 grid grid-cols-2 gap-4">
          <div className="rounded-3xl border border-white/20 bg-white/10 p-4 backdrop-blur-[2px]">
            <div className="text-2xl font-bold">+50k</div>
            <div className="text-sm text-white/80">طالب نشط</div>
          </div>
          <div className="rounded-3xl border border-white/20 bg-white/10 p-4 backdrop-blur-[2px]">
            <div className="text-2xl font-bold">+500</div>
            <div className="text-sm text-white/80">دورة تعليمية</div>
          </div>
        </div>
      </div>
    </div>
  );
};
