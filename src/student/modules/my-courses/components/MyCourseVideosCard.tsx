import { Link } from "react-router-dom";
import { StudentIcon } from "../../dashboard/components/StudentIcon";
import type { MyCourseVideos } from "../data/mockMyCourse";

interface MyCourseVideosCardProps {
  videos: MyCourseVideos;
  courseId?: string;
}

export const MyCourseVideosCard = ({ videos, courseId }: MyCourseVideosCardProps) => {
  const content = (
    <>
      <div className="mb-4 flex items-center justify-between gap-2" dir="rtl">
        <h2 className="flex items-center justify-start gap-2 text-base font-bold text-[#0f172a]">
          <StudentIcon src="/images/student/icon-play.svg" className="size-5 text-[#f5a524]" />
          <span>فيديوهات الدورة</span>
        </h2>
        <span className="text-xs font-semibold text-[#64748b]" dir="ltr">
          {videos.completed}/{videos.total} فيديو
        </span>
      </div>

      <ul className="space-y-3">
        {videos.items.length === 0 ? (
          <li className="rounded-2xl bg-[#f8fafc] px-3 py-6 text-center text-sm text-[#64748b]">
            لا توجد دروس منشورة بعد.
          </li>
        ) : (
          videos.items.map((video) => (
            <li
              key={video.id}
              className="flex items-center gap-3 rounded-2xl bg-[#f8fafc] px-3 py-2.5"
            >
              <span
                className={`flex size-8 shrink-0 items-center justify-center rounded-full ${
                  video.status === "completed"
                    ? "bg-[#ecfdf5]"
                    : video.status === "in-progress"
                      ? "bg-[#fff7ed]"
                      : "bg-[#f1f5f9]"
                }`}
              >
                {video.status === "completed" ? (
                  <StudentIcon
                    src="/images/student/icon-check.svg"
                    className="size-4 text-[#14b8a6]"
                  />
                ) : (
                  <StudentIcon
                    src="/images/student/icon-play.svg"
                    className={`size-3.5 ${
                      video.status === "in-progress" ? "text-[#f5a524]" : "text-[#94a3b8]"
                    }`}
                  />
                )}
              </span>
              <div className="min-w-0 flex-1 text-right">
                <p className="truncate text-sm font-medium text-[#0f172a]">{video.title}</p>
                <p className="text-xs text-[#94a3b8]" dir="ltr">
                  {video.duration}
                </p>
              </div>
            </li>
          ))
        )}
      </ul>

      {courseId ? (
        <Link
          to={`/student/courses/${courseId}`}
          className="mt-4 block w-full rounded-2xl bg-[#fff7ed] py-2.5 text-center text-sm font-semibold text-[#f5a524] transition-colors hover:bg-[#ffedd5]"
        >
          عرض جميع الدروس
        </Link>
      ) : (
        <button
          type="button"
          className="mt-4 w-full rounded-2xl bg-[#fff7ed] py-2.5 text-sm font-semibold text-[#f5a524] transition-colors hover:bg-[#ffedd5]"
        >
          عرض المزيد
        </button>
      )}
    </>
  );

  return (
    <section className="rounded-3xl border border-[#e2e8f0] bg-white p-5 shadow-sm" dir="rtl">
      {content}
    </section>
  );
};
