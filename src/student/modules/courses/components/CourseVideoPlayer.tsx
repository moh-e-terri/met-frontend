import { AnimatedBar } from "@/shared/motion";
import { StudentIcon } from "../../dashboard/components/StudentIcon";

interface ActiveLessonView {
  title: string;
  videoCurrent: string;
  videoTotal: string;
  videoProgress: number;
  videoUrl?: string;
}

export const CourseVideoPlayer = ({ activeLesson }: { activeLesson: ActiveLessonView }) => {
  return (
    <section className="overflow-hidden rounded-3xl bg-[#1e293b] shadow-sm">
      <div className="relative flex aspect-video items-center justify-center">
        {activeLesson.videoUrl ? (
          <video
            src={activeLesson.videoUrl}
            controls
            className="h-full w-full object-cover"
          />
        ) : (
          <button
            type="button"
            className="flex size-16 items-center justify-center rounded-full bg-[#f5a524] text-white shadow-[0px_12px_24px_-6px_rgba(245,165,36,0.45)] transition-transform hover:scale-105"
            aria-label="تشغيل الفيديو"
          >
            <StudentIcon
              src="/images/student/icon-play.svg"
              className="size-7 text-white"
            />
          </button>
        )}
      </div>

      {!activeLesson.videoUrl ? (
        <div className="flex items-center gap-3 px-4 py-3" dir="ltr">
          <button
            type="button"
            className="flex size-8 items-center justify-center rounded-lg text-white/80 transition-colors hover:bg-white/10"
            aria-label="تشغيل/إيقاف"
          >
            <StudentIcon
              src="/images/student/icon-play.svg"
              className="size-4 text-white"
            />
          </button>

          <span className="shrink-0 text-xs text-white/80" dir="ltr">
            {activeLesson.videoCurrent} / {activeLesson.videoTotal}
          </span>

          <div className="min-w-0 flex-1">
            <AnimatedBar
              value={activeLesson.videoProgress}
              className="h-1.5 bg-white/20"
              barClassName="rounded-full bg-[#f5a524]"
            />
          </div>
        </div>
      ) : null}
    </section>
  );
};
