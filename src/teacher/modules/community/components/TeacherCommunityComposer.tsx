import { useState, type FormEvent } from "react";
import { useAuth } from "@/core/auth/AuthContext";
import { resolveAccountAvatar } from "@/shared/utils/accountAvatar";
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
  const { session } = useAuth();
  const [content, setContent] = useState("");
  const avatar = resolveAccountAvatar(session);

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
            src={avatar}
            alt=""
            className="size-11 shrink-0 rounded-full object-cover"
            aria-hidden
          />

          <div className="min-w-0 flex-1">
            <textarea
              rows={3}
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="شارك تحديثاً أو سؤالاً مع مجتمع المدرّسين..."
              className="w-full resize-none rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] px-4 py-3 text-sm text-[#0f172a] outline-none transition-colors placeholder:text-[#94a3b8] focus:border-[#f5a524]/40 focus:bg-white"
            />

            {error ? (
              <p className="mt-2 text-right text-xs text-red-500">{error}</p>
            ) : null}

            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                {composerActions.map((action) => (
                  <button
                    key={action.label}
                    type="button"
                    className={`inline-flex items-center gap-1.5 rounded-xl border border-[#e2e8f0] bg-white px-3 py-1.5 text-xs font-semibold ${action.color}`}
                  >
                    <TeacherIcon src={action.icon} className="size-3.5" />
                    <span>{action.label}</span>
                  </button>
                ))}
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !content.trim()}
                className="rounded-2xl bg-[#f5a524] px-5 py-2 text-sm font-bold text-white disabled:opacity-60"
              >
                {isSubmitting ? "جاري النشر..." : "نشر"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </section>
  );
};
