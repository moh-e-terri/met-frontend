import { formatLessonDuration, type ApiLesson } from "@/core/api/lessons.types";
import { cn } from "@/shared/utils/cn";
import { useLayoutEffect, useRef, useState } from "react";

interface CoursePlaylistPlayerProps {
  lessons: ApiLesson[];
  selectedLessonId: string | null;
  onSelectLesson: (lessonId: string) => void;
  isLoading?: boolean;
}

function MaskIcon({ src, className }: { src: string; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-block shrink-0 bg-current mask-contain mask-center mask-no-repeat",
        className,
      )}
      style={{
        WebkitMaskImage: `url(${src})`,
        maskImage: `url(${src})`,
      }}
    />
  );
}

export const CoursePlaylistPlayer = ({
  lessons,
  selectedLessonId,
  onSelectLesson,
  isLoading,
}: CoursePlaylistPlayerProps) => {
  const active =
    lessons.find((lesson) => lesson.id === selectedLessonId) ?? lessons[0] ?? null;
  const playerRef = useRef<HTMLDivElement>(null);
  const [playlistHeight, setPlaylistHeight] = useState<number | null>(null);

  useLayoutEffect(() => {
    const node = playerRef.current;
    if (!node) return;

    const syncHeight = () => {
      setPlaylistHeight(node.getBoundingClientRect().height);
    };

    syncHeight();
    const observer = new ResizeObserver(syncHeight);
    observer.observe(node);
    return () => observer.disconnect();
  }, [isLoading, active?.id, active?.description, lessons.length]);

  if (isLoading) {
    return (
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="aspect-video animate-pulse rounded-3xl bg-[#e2e8f0]" />
        <div className="h-[420px] animate-pulse rounded-3xl bg-[#e2e8f0]" />
      </div>
    );
  }

  return (
    <section
      className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_340px]"
      dir="rtl"
    >
      <div
        ref={playerRef}
        className="overflow-hidden rounded-3xl border border-[#0f172a]/10 bg-[#0b1220] shadow-sm"
      >
        <div className="relative aspect-video bg-black">
          {active?.videoUrl ? (
            <video
              key={active.id}
              src={active.videoUrl}
              controls
              autoPlay
              className="h-full w-full object-contain"
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
              <span className="flex size-16 items-center justify-center rounded-full bg-[#f5a524]/20 text-[#f5a524]">
                <MaskIcon src="/images/student/icon-play.svg" className="size-7" />
              </span>
              <p className="text-sm font-semibold text-white">
                {active ? "لا يوجد فيديو لهذا الدرس بعد" : "لا توجد دروس في هذا المقرر"}
              </p>
            </div>
          )}
        </div>
        <div className="border-t border-white/10 px-5 py-4 text-right">
          <p className="text-xs font-semibold text-[#f5a524]">
            {active ? `الدرس ${active.order}` : "—"}
          </p>
          <h3 className="mt-1 text-lg font-bold text-white">
            {active?.title ?? "اختر درساً من قائمة التشغيل"}
          </h3>
          {active?.description ? (
            <p className="mt-2 text-sm leading-6 text-white/70">{active.description}</p>
          ) : null}
        </div>
      </div>

      <aside
        className="flex min-h-[280px] flex-col overflow-hidden rounded-3xl border border-[#e2e8f0] bg-white shadow-sm xl:min-h-0"
        style={playlistHeight ? { height: playlistHeight } : undefined}
      >
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[#f1f5f9] px-4 py-4">
          <h2 className="text-sm font-bold text-[#0f172a]">قائمة التشغيل</h2>
          <span className="rounded-full bg-[#fff7ed] px-2.5 py-1 text-xs font-semibold text-[#f5a524]">
            {lessons.length} فيديو
          </span>
        </div>

        {lessons.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-[#64748b]">
            لم تُرفع أي دروس بعد.
          </p>
        ) : (
          <ul className="min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-contain p-2">
            {lessons.map((lesson, index) => {
              const selected = lesson.id === active?.id;
              return (
                <li key={lesson.id}>
                  <button
                    type="button"
                    onClick={() => onSelectLesson(lesson.id)}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-2xl px-3 py-3 text-right transition-colors",
                      selected
                        ? "bg-[#fff7ed] ring-1 ring-[#f5a524]/30"
                        : "hover:bg-[#f8fafc]",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold",
                        selected
                          ? "bg-[#f5a524] text-white"
                          : "bg-[#f1f5f9] text-[#64748b]",
                      )}
                    >
                      {selected ? (
                        <MaskIcon
                          src="/images/student/icon-play.svg"
                          className="size-3.5 text-white"
                        />
                      ) : (
                        index + 1
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p
                        className={cn(
                          "text-sm leading-6",
                          selected
                            ? "font-bold text-[#0f172a]"
                            : "font-medium text-[#475569]",
                        )}
                      >
                        {lesson.title}
                      </p>
                      <p className="mt-0.5 text-[11px] text-[#94a3b8]">
                        {formatLessonDuration(lesson.duration)}
                        {lesson.isPublished === false ? " · مسودة" : ""}
                      </p>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </aside>
    </section>
  );
};
