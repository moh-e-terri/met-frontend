import { AnimatedBar } from "@/shared/motion";
import { cn } from "@/shared/utils/cn";
import { StudentIcon } from "../../dashboard/components/StudentIcon";
import type { CourseLesson } from "../data/mockCourse";

const statusIcon = (lesson: CourseLesson) => {
  switch (lesson.status) {
    case "completed":
      return (
        <span className="flex size-8 items-center justify-center rounded-full bg-[#ecfdf5]">
          <StudentIcon
            src="/images/student/icon-check.svg"
            className="size-4 text-[#14b8a6]"
          />
        </span>
      );
    case "active":
      return (
        <span className="flex size-8 items-center justify-center rounded-full bg-[#fff7ed]">
          <StudentIcon
            src="/images/student/icon-play.svg"
            className="size-4 text-[#f5a524]"
          />
        </span>
      );
    case "upcoming":
      return (
        <span className="flex size-8 items-center justify-center rounded-full bg-[#f1f5f9] text-xs font-bold text-[#64748b]">
          {lesson.order}
        </span>
      );
    case "locked":
      return (
        <span className="flex size-8 items-center justify-center rounded-full bg-[#f1f5f9]">
          <StudentIcon
            src="/images/student/icon-lock.svg"
            className="size-4 text-[#94a3b8]"
          />
        </span>
      );
  }
};

interface CourseLessonsSidebarProps {
  lessons: CourseLesson[];
  totalLessons: number;
  selectedLessonId: string;
  onSelectLesson: (lessonId: string) => void;
}

export const CourseLessonsSidebar = ({
  lessons,
  totalLessons,
  selectedLessonId,
  onSelectLesson,
}: CourseLessonsSidebarProps) => {
  return (
    <aside
      className="rounded-3xl border border-[#e2e8f0] bg-white p-5 shadow-sm"
      dir="rtl"
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <span className="rounded-full bg-[#fff7ed] px-2.5 py-1 text-xs font-semibold text-[#f5a524]">
          {totalLessons} فيديو
        </span>
        <h2 className="text-base font-bold text-[#0f172a]">قائمة المحاضرات</h2>
      </div>

      {lessons.length === 0 ? (
        <p className="py-6 text-center text-sm text-[#64748b]">
          لا توجد دروس منشورة بعد.
        </p>
      ) : (
        <ul className="space-y-2">
          {lessons.map((lesson) => (
            <li key={lesson.id}>
              <button
                type="button"
                onClick={() => onSelectLesson(lesson.id)}
                className={cn(
                  "flex w-full items-start gap-3 rounded-2xl border-r-4 px-3 py-3 text-right transition-colors",
                  lesson.id === selectedLessonId || lesson.status === "active"
                    ? "border-[#f5a524] bg-[#fff7ed]"
                    : "border-transparent hover:bg-[#f8fafc]",
                  lesson.status === "locked" && "opacity-70",
                )}
                disabled={lesson.status === "locked"}
              >
                {statusIcon(lesson)}
                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      "text-sm leading-6",
                      lesson.id === selectedLessonId || lesson.status === "active"
                        ? "font-bold text-[#0f172a]"
                        : "text-[#475569]",
                    )}
                  >
                    {lesson.title}
                  </p>
                  {lesson.progress !== undefined && lesson.progress > 0 && (
                    <AnimatedBar
                      value={lesson.progress}
                      className="mt-2 h-1 bg-[#fde8c8]"
                      barClassName="rounded-full bg-[#f5a524]"
                    />
                  )}
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
};
