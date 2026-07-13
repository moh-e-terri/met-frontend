import { GraduationCap } from "lucide-react";

export const SigninBrandingPanel = () => {
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

      <div className="relative max-w-[448px] text-right text-white">
        <div className="mb-8 flex justify-end">
          <div className="rounded-3xl border border-white/20 bg-white/10 p-4 backdrop-blur-[6px]">
            <GraduationCap className="size-9 text-white" />
          </div>
        </div>

        <h2 className="text-4xl font-black leading-[1.45] md:text-5xl">
          <span>رؤيتنا هي </span>
          <span className="text-white/80">التميز </span>
          <br />
          <span className="text-white/80">الأكاديمي</span>
        </h2>

        <p className="mt-6 text-lg leading-[29.25px] text-white/90">
          انضم إلى آلاف الطلاب في منصة MET التعليمية وابدأ رحلتك نحو النجاح مع
          أفضل المدرسين والخبراء في الشرق الأوسط.
        </p>

        <div className="mt-10 flex items-center justify-end gap-4">
          <img
            src="/images/small-photos.svg"
            alt="طلاب مسجلون"
            className="h-10 w-auto"
          />
          <span className="text-sm text-white">+5000 طالب مسجل حالياً</span>
        </div>
      </div>
    </div>
  );
};
