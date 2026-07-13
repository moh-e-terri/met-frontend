import { StudentIcon } from "../../dashboard/components/StudentIcon";

interface MyCoursesPageHeaderProps {
  title?: string;
  subtitle?: string;
  showBackLink?: boolean;
  backLabel?: string;
  onBack?: () => void;
}

export const MyCoursesPageHeader = ({
  title = "دوراتي",
  subtitle = "تابع تقدّمك في جميع المقررات المسجّلة، واستأنف التعلم من حيث توقفت.",
  showBackLink = false,
  backLabel = "جميع الدورات",
  onBack,
}: MyCoursesPageHeaderProps) => {
  return (
    <header className="relative overflow-hidden rounded-3xl border border-[#e2e8f0] bg-white p-6 shadow-sm sm:p-8" dir="rtl">
      <div
        className="pointer-events-none absolute -left-16 -top-16 size-48 rounded-full bg-[#fff7ed] blur-2xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-20 -right-10 size-56 rounded-full bg-[#ecfdf5]/70 blur-2xl"
        aria-hidden
      />

      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 text-right">
          {showBackLink && onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-[#64748b] transition-colors hover:text-[#f5a524]"
            >
              <StudentIcon
                src="/images/student/icon-chevron-down.svg"
                className="size-4 rotate-90 text-current"
              />
              <span>{backLabel}</span>
            </button>
          ) : null}

          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-[#fff7ed] px-3 py-1 text-xs font-semibold text-[#f5a524]">
            <StudentIcon src="/images/student/icon-book.svg" className="size-3.5" />
            <span>مساحة التعلم</span>
          </div>

          <h1 className="text-2xl font-black text-[#0f172a] sm:text-3xl">{title}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-[#64748b]">{subtitle}</p>
        </div>

        <div className="flex shrink-0 items-center justify-center">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-[#fff7ed] sm:size-20">
            <StudentIcon
              src="/images/student/icon-play.svg"
              className="size-8 text-[#f5a524] sm:size-9"
            />
          </div>
        </div>
      </div>
    </header>
  );
};
