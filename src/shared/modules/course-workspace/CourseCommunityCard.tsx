import { Link } from "react-router-dom";

interface CourseCommunityCardProps {
  to: string;
  courseTitle: string;
}

export const CourseCommunityCard = ({
  to,
  courseTitle,
}: CourseCommunityCardProps) => {
  return (
    <section
      className="relative overflow-hidden rounded-3xl border border-[#e2e8f0] bg-[#0f172a] p-6 text-white shadow-sm"
      dir="rtl"
    >
      <div className="pointer-events-none absolute -left-10 top-0 size-40 rounded-full bg-[#f5a524]/20 blur-2xl" />
      <div className="pointer-events-none absolute bottom-0 right-10 size-32 rounded-full bg-[#3b82f6]/20 blur-2xl" />

      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-xl text-right">
          <p className="text-xs font-semibold text-[#f5a524]">مجتمع المقرر</p>
          <h2 className="mt-2 text-xl font-black sm:text-2xl">
            نقاش خاص بـ «{courseTitle}»
          </h2>
          <p className="mt-2 text-sm leading-7 text-white/70">
            اطّلع على منشورات وأسئلة هذا المقرر فقط، بعيداً عن المجتمع العام للمنصة.
          </p>
        </div>
        <Link
          to={to}
          className="inline-flex shrink-0 items-center justify-center rounded-2xl bg-[#f5a524] px-5 py-3 text-sm font-bold text-white shadow-[0_10px_20px_-8px_rgba(245,165,36,0.5)]"
        >
          الدخول إلى مجتمع المقرر
        </Link>
      </div>
    </section>
  );
};
