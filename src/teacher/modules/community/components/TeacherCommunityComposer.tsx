import { useState, type FormEvent } from "react";
import { TEACHER_DEFAULT_AVATAR } from "@/teacher/constants/assets";
import { TeacherIcon } from "../../dashboard/components/TeacherIcon";

const composerActions = [
  {
    label: "صورة",
    icon: "/images/student/icon-image.svg",
    color: "text-[#f5a524]",
  },
  {
    label: "ملف",
    icon: "/images/student/icon-file.svg",
    color: "text-[#3b82f6]",
  },
  {
    label: "سؤال",
    icon: "/images/student/icon-question.svg",
    color: "text-[#22c55e]",
  },
];

interface TeacherCommunityComposerProps {
  onSubmit: (content: string) => Promise<void> | void;
  isSubmitting?: boolean;
  error?: string;
}

export const TeacherCommunityComposer = ({
  onSubmit,
  isSubmitting = false,
  error,
}: TeacherCommunityComposerProps) => {
  const [content, setContent] = useState("");

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const trimmed = content.trim();
    if (!trimmed || isSubmitting) return;

    await onSubmit(trimmed);
    setContent("");
  };

  return (
    <section
      className="rounded-3xl border border-[#e2e8f0] bg-white p-5 shadow-sm"
      dir="rtl"
    >
      <form onSubmit={handleSubmit}>
        <div className="flex items-start gap-4">
          <img
            src={TEACHER_DEFAULT_AVATAR}
            alt=""
            className="size-11 shrink-0 rounded-full"
            aria-hidden
          />

          <div className="min-w-0 flex-1">
            <textarea
              rows={3}
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="اكتب منشوراً أو إعلاناً للمجتمع..."
              disabled={isSubmitting}
              className="w-full resize-none rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] px-4 py-3 text-right text-sm text-[#0f172a] outline-none transition-colors placeholder:text-[#94a3b8] focus:border-[#f5a524]/30 focus:bg-white disabled:opacity-60"
            />

            {error ? (
              <p className="mt-2 text-right text-xs text-red-600">{error}</p>
            ) : null}

            <div className="mt-4 flex items-center justify-between" dir="ltr">
              <button
                type="submit"
                disabled={isSubmitting || !content.trim()}
                className="rounded-2xl bg-[#f5a524] px-6 py-2.5 text-sm font-bold text-white shadow-[0px_10px_15px_-3px_rgba(245,165,36,0.2)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "جاري النشر..." : "نشر"}
              </button>

              <div className="flex items-center gap-2" dir="rtl">
                {composerActions.map((action) => (
                  <button
                    key={action.label}
                    type="button"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-[#e2e8f0] bg-white px-3 py-2 text-xs font-medium text-[#64748b]"
                  >
                    <TeacherIcon
                      src={action.icon}
                      className={`size-4 ${action.color}`}
                    />
                    <span>{action.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </form>
    </section>
  );
};
