import { AnimatedBar } from "@/shared/motion";
import { TeacherIcon } from "../../dashboard/components/TeacherIcon";
import type { PromotionalVideo } from "../data/mockCourseEditor";

interface CourseMediaUploadProps {
  video: PromotionalVideo;
}

export const CourseMediaUpload = ({ video }: CourseMediaUploadProps) => {
  return (
    <div className="grid gap-5 lg:grid-cols-2" dir="rtl">
      <section className="rounded-3xl border border-[#e2e8f0] bg-white p-5 shadow-sm sm:p-6">
        <h3 className="mb-4 text-right text-base font-bold text-[#0f172a]">
          صورة مصغرة للمساق
        </h3>

        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#e2e8f0] bg-[#f8fafc] px-6 py-10 text-center">
          <span className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-white shadow-sm">
            <TeacherIcon
              src="/images/teacher/icon-image-upload.svg"
              className="size-6 text-[#94a3b8]"
            />
          </span>
          <p className="text-sm font-medium text-[#475569]">
            اسحب وأفلت الصورة هنا
          </p>
          <p className="mt-1 text-xs text-[#94a3b8]">
            يُفضّل 1280×720 بكسل — PNG أو JPG
          </p>
          <button
            type="button"
            className="mt-5 rounded-2xl border border-[#e2e8f0] bg-white px-5 py-2.5 text-sm font-semibold text-[#475569] transition-colors hover:bg-[#f8fafc]"
          >
            تصفح الملفات
          </button>
        </div>
      </section>

      <section className="rounded-3xl border border-[#e2e8f0] bg-white p-5 shadow-sm sm:p-6">
        <h3 className="mb-4 text-right text-base font-bold text-[#0f172a]">
          الفيديو الترويجي
        </h3>

        <div className="mb-4 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[#f5a524]" dir="ltr">
              {video.progress}%
            </span>
            <span className="text-[#64748b]">{video.statusLabel}</span>
          </div>
          <AnimatedBar
            value={video.progress}
            className="h-2 bg-[#e2e8f0]"
            barClassName="rounded-full bg-[#f5a524]"
          />
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] px-4 py-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#fff7ed]">
            <TeacherIcon
              src="/images/student/icon-video.svg"
              className="size-5 text-[#f5a524]"
            />
          </span>
          <div className="min-w-0 flex-1 text-right">
            <p className="truncate text-sm font-semibold text-[#0f172a]">
              {video.name}
            </p>
            <p className="text-xs text-[#64748b]" dir="ltr">
              {video.size} · {video.duration}
            </p>
          </div>
          <button
            type="button"
            className="shrink-0 px-2 text-lg leading-none text-[#94a3b8] hover:text-[#64748b]"
            aria-label="حذف"
          >
            ×
          </button>
        </div>
      </section>
    </div>
  );
};
