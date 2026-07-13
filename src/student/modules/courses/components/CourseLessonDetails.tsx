import { StudentIcon } from "../../dashboard/components/StudentIcon";

interface ActiveLessonDetailsView {
  id?: string;
  title: string;
  duration: string;
  views?: string;
  description: string;
  isCompleted?: boolean;
}

export const CourseLessonDetails = ({
  activeLesson,
  onMarkComplete,
  isMarkingComplete,
}: {
  activeLesson: ActiveLessonDetailsView;
  onMarkComplete?: () => void;
  isMarkingComplete?: boolean;
}) => {
  return (
    <section
      className="rounded-3xl border border-[#e2e8f0] bg-white p-5 shadow-sm sm:p-6"
      dir="rtl"
    >
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <h2 className="min-w-0 flex-1 text-right text-lg font-bold leading-snug text-[#0f172a] sm:text-xl">
          {activeLesson.title}
        </h2>
        <button
          type="button"
          onClick={onMarkComplete}
          disabled={isMarkingComplete || activeLesson.isCompleted || !onMarkComplete}
          className="shrink-0 self-end rounded-2xl border border-[#99f6e4] bg-[#ecfdf5] px-4 py-2 text-sm font-semibold text-[#14b8a6] transition-colors hover:bg-[#d1fae5] disabled:cursor-not-allowed disabled:opacity-60 sm:self-auto"
        >
          {activeLesson.isCompleted
            ? "مكتمل"
            : isMarkingComplete
              ? "جاري الحفظ..."
              : "تحديد كمكتمل"}
        </button>
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-start gap-4 text-sm text-[#64748b]">
        <span className="inline-flex items-center gap-1.5">
          <StudentIcon
            src="/images/student/icon-clock.svg"
            className="size-4 text-[#94a3b8]"
          />
          <span>{activeLesson.duration}</span>
        </span>
        {activeLesson.views ? (
          <span className="inline-flex items-center gap-1.5">
            <StudentIcon
              src="/images/student/icon-eye.svg"
              className="size-4 text-[#94a3b8]"
            />
            <span>{activeLesson.views}</span>
          </span>
        ) : null}
      </div>

      <p className="text-right text-sm leading-7 text-[#475569]">
        {activeLesson.description}
      </p>
    </section>
  );
};
