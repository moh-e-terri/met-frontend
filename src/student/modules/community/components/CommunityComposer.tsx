import { useState, type FormEvent } from "react";
import { STUDENT_DEFAULT_AVATAR } from "@/student/constants/assets";
import { StudentIcon } from "../../dashboard/components/StudentIcon";

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

interface CommunityComposerProps {
  onSubmit: (content: string) => Promise<void> | void;
  isSubmitting?: boolean;
  error?: string;
  avatar?: string;
  placeholder?: string;
}

export const CommunityComposer = ({
  onSubmit,
  isSubmitting = false,
  error,
  avatar = STUDENT_DEFAULT_AVATAR,
  placeholder = "اكتب سؤالاً أو شارك فكرة...",
}: CommunityComposerProps) => {
  const [content, setContent] = useState("");

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const trimmed = content.trim();
    if (!trimmed || isSubmitting) return;

    await onSubmit(trimmed);
    setContent("");
  };

  return (
    <section className="rounded-3xl border border-[#e2e8f0] bg-white p-5 shadow-sm">
      <form onSubmit={handleSubmit}>
        <div className="flex items-start gap-4" dir="rtl">
          <img
            src={avatar}
            alt=""
            className="size-11 shrink-0 rounded-full"
            aria-hidden
          />

          <div className="min-w-0 flex-1">
            <textarea
              rows={3}
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder={placeholder}
              disabled={isSubmitting}
              className="w-full resize-none rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] px-4 py-3 text-right text-sm text-[#0f172a] outline-none transition-colors placeholder:text-[#94a3b8] focus:border-[#f5a524]/30 focus:bg-white disabled:opacity-60"
            />

            {error ? (
              <p className="mt-2 text-right text-xs text-red-600">{error}</p>
            ) : null}

            <div
              className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
              dir="ltr"
            >
              <button
                type="submit"
                disabled={isSubmitting || !content.trim()}
                className="inline-flex items-center justify-center rounded-2xl bg-[#f5a524] px-6 py-2.5 text-sm font-bold text-white shadow-[0px_10px_15px_-3px_rgba(245,165,36,0.2)] transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "جاري النشر..." : "نشر"}
              </button>

              <div className="flex items-center justify-end gap-2" dir="rtl">
                {composerActions.map((action) => (
                  <button
                    key={action.label}
                    type="button"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-[#e2e8f0] bg-white px-3 py-2 text-xs font-medium text-[#64748b] transition-colors hover:bg-[#f8fafc]"
                  >
                    <StudentIcon
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
