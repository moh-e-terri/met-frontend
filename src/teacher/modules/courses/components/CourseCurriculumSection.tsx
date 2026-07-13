import { useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createCourseLesson,
  formatLessonDuration,
  lessonQueryKeys,
  type ApiLesson,
} from "@/core/api/lessons";
import { cn } from "@/shared/utils/cn";
import { TeacherIcon } from "../../dashboard/components/TeacherIcon";
import type { CurriculumLesson } from "../data/mockCourseEditor";

interface CourseCurriculumSectionProps {
  courseId: string;
  lessons: CurriculumLesson[];
  onLessonCreated?: () => void;
}

const ACCEPTED_VIDEO_TYPES = "video/mp4,video/webm,video/quicktime,video/x-msvideo";

function mapToCurriculumLessons(apiLessons: ApiLesson[]): CurriculumLesson[] {
  return apiLessons.map((lesson) => ({
    id: lesson.id,
    title: lesson.title,
    subtitle: lesson.videoUrl
      ? `محتوى الفيديو ${formatLessonDuration(lesson.duration)}`
      : "في انتظار التحميل...",
    status: lesson.videoUrl ? "active" : "waiting",
  }));
}

export const CourseCurriculumSection = ({
  courseId,
  lessons,
  onLessonCreated,
}: CourseCurriculumSectionProps) => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [duration, setDuration] = useState("");
  const [order, setOrder] = useState("");
  const [isPublished, setIsPublished] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: () => {
      if (!videoFile) {
        throw new Error("ملف الفيديو مطلوب");
      }

      return createCourseLesson(courseId, {
        title: title.trim(),
        videoFile,
        duration: duration ? Number(duration) : undefined,
        order: order ? Number(order) : lessons.length + 1,
        isPublished,
      });
    },
    onSuccess: async () => {
      setTitle("");
      setVideoFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setDuration("");
      setOrder("");
      setIsPublished(true);
      setShowForm(false);
      setError(null);
      await queryClient.invalidateQueries({ queryKey: lessonQueryKeys.list(courseId) });
      onLessonCreated?.();
    },
    onError: (mutationError) => {
      setError(
        mutationError instanceof Error ? mutationError.message : "تعذر إضافة الدرس",
      );
    },
  });

  return (
    <section
      className="rounded-3xl border border-[#e2e8f0] bg-white p-5 shadow-sm sm:p-6"
      dir="rtl"
    >
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="text-xl font-black text-[#0f172a]">المقرر</h2>
        <button
          type="button"
          onClick={() => setShowForm((open) => !open)}
          className="inline-flex items-center gap-2 rounded-2xl bg-[#eff6ff] px-4 py-2.5 text-sm font-semibold text-[#3b82f6] transition-colors hover:bg-[#dbeafe]"
        >
          <TeacherIcon
            src="/images/student/icon-add.svg"
            className="size-4 text-[#3b82f6]"
          />
          <span>إضافة درس</span>
        </button>
      </div>

      {showForm ? (
        <form
          className="mb-5 space-y-3 rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] p-4"
          onSubmit={(event) => {
            event.preventDefault();
            createMutation.mutate();
          }}
        >
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="عنوان الدرس"
            required
            className="h-11 w-full rounded-2xl border border-[#e2e8f0] bg-white px-4 text-sm outline-none focus:border-[#f5a524]"
          />

          <div className="rounded-2xl border border-dashed border-[#cbd5e1] bg-white p-4">
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_VIDEO_TYPES}
              required
              onChange={(event) => {
                setVideoFile(event.target.files?.[0] ?? null);
                setError(null);
              }}
              className="block w-full text-sm text-[#475569] file:ml-3 file:rounded-xl file:border-0 file:bg-[#eff6ff] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-[#3b82f6]"
            />
            <p className="mt-2 text-right text-xs text-[#64748b]">
              {videoFile
                ? `الملف المختار: ${videoFile.name}`
                : "ارفع ملف فيديو (MP4 / WebM) — مطلوب من الخادم"}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <input
              value={duration}
              onChange={(event) => setDuration(event.target.value)}
              placeholder="المدة بالثواني"
              type="number"
              min={0}
              className="h-11 w-full rounded-2xl border border-[#e2e8f0] bg-white px-4 text-sm outline-none focus:border-[#f5a524]"
            />
            <input
              value={order}
              onChange={(event) => setOrder(event.target.value)}
              placeholder="الترتيب"
              type="number"
              min={1}
              className="h-11 w-full rounded-2xl border border-[#e2e8f0] bg-white px-4 text-sm outline-none focus:border-[#f5a524]"
            />
          </div>
          <label className="flex items-center justify-end gap-2 text-sm text-[#475569]">
            <span>نشر الدرس</span>
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(event) => setIsPublished(event.target.checked)}
              className="size-4"
            />
          </label>
          {error ? <p className="text-sm text-red-500">{error}</p> : null}
          <button
            type="submit"
            disabled={createMutation.isPending || !videoFile}
            className="w-full rounded-2xl bg-[#f5a524] py-2.5 text-sm font-bold text-white disabled:opacity-70"
          >
            {createMutation.isPending ? "جاري الحفظ..." : "حفظ الدرس"}
          </button>
        </form>
      ) : null}

      {lessons.length === 0 ? (
        <p className="py-8 text-center text-sm text-[#64748b]">
          لا توجد دروس بعد. أضف أول درس للكورس.
        </p>
      ) : (
        <ul className="space-y-3">
          {lessons.map((lesson) => (
            <li
              key={lesson.id}
              className={cn(
                "flex items-center gap-3 rounded-2xl border px-4 py-3",
                lesson.status === "active"
                  ? "border border-[#fde8c8] border-r-4 border-r-[#f5a524] bg-[#fff7ed]/40"
                  : "border border-[#f1f5f9] bg-[#f8fafc]",
              )}
            >
              <TeacherIcon
                src="/images/teacher/icon-drag.svg"
                className="size-4 shrink-0 text-[#cbd5e1]"
              />

              <div className="min-w-0 flex-1 text-right">
                <p className="text-sm font-bold text-[#0f172a]">{lesson.title}</p>
                <p
                  className={cn(
                    "mt-0.5 text-xs",
                    lesson.status === "active"
                      ? "text-[#64748b]"
                      : "text-[#94a3b8]",
                  )}
                >
                  {lesson.subtitle}
                </p>
              </div>

              {lesson.status === "active" ? (
                <button
                  type="button"
                  className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-[#e2e8f0] bg-white"
                  aria-label="تعديل"
                >
                  <TeacherIcon
                    src="/images/teacher/icon-edit.svg"
                    className="size-4 text-[#64748b]"
                  />
                </button>
              ) : (
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white">
                  <TeacherIcon
                    src="/images/teacher/icon-cloud-upload.svg"
                    className="size-4 text-[#94a3b8]"
                  />
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export { mapToCurriculumLessons };
