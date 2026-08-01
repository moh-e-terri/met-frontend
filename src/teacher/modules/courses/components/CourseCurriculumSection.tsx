import { useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createCourseLesson,
  formatLessonDuration,
  lessonQueryKeys,
  updateCourseLesson,
  type ApiLesson,
} from "@/core/api/lessons";
import { AppModal } from "@/shared/components/AppModal";
import { cn } from "@/shared/utils/cn";
import { TeacherIcon } from "../../dashboard/components/TeacherIcon";
import type { CurriculumLesson } from "../data/mockCourseEditor";

interface CourseCurriculumSectionProps {
  courseId: string;
  lessons: CurriculumLesson[];
  onLessonCreated?: () => void;
}

const ACCEPTED_VIDEO_TYPES = "video/mp4,video/webm,video/quicktime,video/x-msvideo";

const fieldClass =
  "h-11 w-full rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] px-4 text-sm outline-none transition-colors focus:border-[#f5a524] focus:bg-white";

function mapToCurriculumLessons(apiLessons: ApiLesson[]): CurriculumLesson[] {
  return apiLessons.map((lesson) => ({
    id: lesson.id,
    title: lesson.title,
    subtitle: lesson.videoUrl
      ? `محتوى الفيديو ${formatLessonDuration(lesson.duration)}`
      : "في انتظار التحميل...",
    status: lesson.videoUrl ? "active" : "waiting",
    duration: lesson.duration,
    order: lesson.order,
    isPublished: lesson.isPublished,
    description: lesson.description,
    hasVideo: Boolean(lesson.videoUrl),
  }));
}

export const CourseCurriculumSection = ({
  courseId,
  lessons,
  onLessonCreated,
}: CourseCurriculumSectionProps) => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<CurriculumLesson | null>(null);
  const [title, setTitle] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [duration, setDuration] = useState("");
  const [order, setOrder] = useState("");
  const [isPublished, setIsPublished] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setTitle("");
    setVideoFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (editFileInputRef.current) editFileInputRef.current.value = "";
    setDuration("");
    setOrder("");
    setIsPublished(true);
    setError(null);
  };

  const closeCreate = () => {
    setCreateOpen(false);
    resetForm();
  };

  const openCreate = () => {
    setEditingLesson(null);
    resetForm();
    setCreateOpen(true);
  };

  const openEdit = (lesson: CurriculumLesson) => {
    setCreateOpen(false);
    setEditingLesson(lesson);
    setTitle(lesson.title);
    setDuration(lesson.duration != null ? String(lesson.duration) : "");
    setOrder(lesson.order != null ? String(lesson.order) : "");
    setIsPublished(lesson.isPublished !== false);
    setVideoFile(null);
    setError(null);
    if (editFileInputRef.current) editFileInputRef.current.value = "";
  };

  const closeEdit = () => {
    setEditingLesson(null);
    resetForm();
  };

  const createMutation = useMutation({
    mutationFn: () => {
      if (!videoFile) throw new Error("ملف الفيديو مطلوب");
      return createCourseLesson(courseId, {
        title: title.trim(),
        videoFile,
        duration: duration ? Number(duration) : undefined,
        order: order ? Number(order) : lessons.length + 1,
        isPublished,
      });
    },
    onSuccess: async () => {
      closeCreate();
      await queryClient.invalidateQueries({ queryKey: lessonQueryKeys.list(courseId) });
      await queryClient.invalidateQueries({ queryKey: ["notifications"] });
      onLessonCreated?.();
    },
    onError: (mutationError) => {
      setError(
        mutationError instanceof Error ? mutationError.message : "تعذر إضافة الدرس",
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: () => {
      if (!editingLesson) throw new Error("لم يتم اختيار درس للتعديل");
      return updateCourseLesson(courseId, editingLesson.id, {
        title: title.trim(),
        videoFile: videoFile ?? undefined,
        duration: duration ? Number(duration) : undefined,
        order: order ? Number(order) : undefined,
        isPublished,
      });
    },
    onSuccess: async () => {
      closeEdit();
      await queryClient.invalidateQueries({ queryKey: lessonQueryKeys.list(courseId) });
      await queryClient.invalidateQueries({ queryKey: ["notifications"] });
      onLessonCreated?.();
    },
    onError: (mutationError) => {
      setError(
        mutationError instanceof Error ? mutationError.message : "تعذر تحديث الدرس",
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
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-2xl bg-[#eff6ff] px-4 py-2.5 text-sm font-semibold text-[#3b82f6] transition-colors hover:bg-[#dbeafe]"
        >
          <TeacherIcon
            src="/images/student/icon-add.svg"
            className="size-4 text-[#3b82f6]"
          />
          <span>إضافة درس</span>
        </button>
      </div>

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
                    lesson.status === "active" ? "text-[#64748b]" : "text-[#94a3b8]",
                  )}
                >
                  {lesson.subtitle}
                </p>
              </div>
              <button
                type="button"
                onClick={() => openEdit(lesson)}
                className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-[#e2e8f0] bg-white transition-colors hover:border-[#f5a524]/40 hover:bg-[#fff7ed]"
                aria-label={`تعديل ${lesson.title}`}
              >
                <TeacherIcon
                  src="/images/teacher/icon-edit.svg"
                  className="size-4 text-[#64748b]"
                />
              </button>
            </li>
          ))}
        </ul>
      )}

      <AppModal
        open={createOpen}
        onClose={() => {
          if (createMutation.isPending) return;
          closeCreate();
        }}
        title="إضافة درس جديد"
        description="ارفع فيديو الدرس وحدد الترتيب والنشر."
        size="md"
        footer={
          <div className="flex flex-wrap items-center justify-end gap-3">
            <button
              type="button"
              onClick={closeCreate}
              disabled={createMutation.isPending}
              className="rounded-2xl border border-[#e2e8f0] bg-white px-5 py-2.5 text-sm font-bold text-[#64748b]"
            >
              إلغاء
            </button>
            <button
              type="submit"
              form="create-lesson-form"
              disabled={createMutation.isPending || !videoFile}
              className="rounded-2xl bg-[#f5a524] px-5 py-2.5 text-sm font-bold text-white disabled:opacity-70"
            >
              {createMutation.isPending ? "جاري الحفظ..." : "حفظ الدرس"}
            </button>
          </div>
        }
      >
        <form
          id="create-lesson-form"
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            createMutation.mutate();
          }}
        >
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-[#475569]">
              عنوان الدرس
            </label>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="مثال: الدرس الأول"
              required
              className={fieldClass}
            />
          </div>

          <div className="rounded-2xl border border-dashed border-[#cbd5e1] bg-[#f8fafc] p-4">
            <label className="mb-1.5 block text-xs font-semibold text-[#475569]">
              ملف الفيديو
            </label>
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
            <p className="mt-2 text-xs text-[#64748b]">
              {videoFile
                ? `الملف المختار: ${videoFile.name}`
                : "MP4 / WebM — مطلوب من الخادم"}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-[#475569]">
                المدة (ثانية)
              </label>
              <input
                value={duration}
                onChange={(event) => setDuration(event.target.value)}
                type="number"
                min={0}
                className={fieldClass}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-[#475569]">
                الترتيب
              </label>
              <input
                value={order}
                onChange={(event) => setOrder(event.target.value)}
                type="number"
                min={1}
                placeholder={String(lessons.length + 1)}
                className={fieldClass}
              />
            </div>
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
        </form>
      </AppModal>

      <AppModal
        open={Boolean(editingLesson)}
        onClose={() => {
          if (updateMutation.isPending) return;
          closeEdit();
        }}
        title="تعديل بيانات الدرس"
        description={editingLesson ? `تعديل «${editingLesson.title}»` : undefined}
        size="md"
        footer={
          <div className="flex flex-wrap items-center justify-end gap-3">
            <button
              type="button"
              onClick={closeEdit}
              disabled={updateMutation.isPending}
              className="rounded-2xl border border-[#e2e8f0] bg-white px-5 py-2.5 text-sm font-bold text-[#64748b]"
            >
              إلغاء
            </button>
            <button
              type="submit"
              form="edit-lesson-form"
              disabled={updateMutation.isPending || !title.trim()}
              className="rounded-2xl bg-[#f5a524] px-5 py-2.5 text-sm font-bold text-white disabled:opacity-70"
            >
              {updateMutation.isPending ? "جاري التحديث..." : "حفظ التعديلات"}
            </button>
          </div>
        }
      >
        <form
          id="edit-lesson-form"
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            updateMutation.mutate();
          }}
        >
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-[#475569]">
              عنوان الدرس
            </label>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
              className={fieldClass}
            />
          </div>

          <div className="rounded-2xl border border-dashed border-[#cbd5e1] bg-[#f8fafc] p-4">
            <label className="mb-1.5 block text-xs font-semibold text-[#475569]">
              استبدال الفيديو (اختياري)
            </label>
            <input
              ref={editFileInputRef}
              type="file"
              accept={ACCEPTED_VIDEO_TYPES}
              onChange={(event) => {
                setVideoFile(event.target.files?.[0] ?? null);
                setError(null);
              }}
              className="block w-full text-sm text-[#475569] file:ml-3 file:rounded-xl file:border-0 file:bg-[#eff6ff] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-[#3b82f6]"
            />
            <p className="mt-2 text-xs text-[#64748b]">
              {videoFile
                ? `الملف الجديد: ${videoFile.name}`
                : editingLesson?.hasVideo
                  ? "سيتم الإبقاء على الفيديو الحالي إن لم تختر ملفاً جديداً"
                  : "لا يوجد فيديو حالياً — يمكنك رفع واحد الآن"}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-[#475569]">
                المدة (ثانية)
              </label>
              <input
                value={duration}
                onChange={(event) => setDuration(event.target.value)}
                type="number"
                min={0}
                className={fieldClass}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-[#475569]">
                الترتيب
              </label>
              <input
                value={order}
                onChange={(event) => setOrder(event.target.value)}
                type="number"
                min={1}
                className={fieldClass}
              />
            </div>
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
        </form>
      </AppModal>
    </section>
  );
};

export { mapToCurriculumLessons };
