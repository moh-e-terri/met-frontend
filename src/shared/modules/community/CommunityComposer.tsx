import { useRef, useState, type FormEvent } from "react";
import { cn } from "@/shared/utils/cn";

async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("تعذر قراءة الصورة"));
    reader.readAsDataURL(file);
  });
}

export interface CommunityComposerSubmitPayload {
  content: string;
  attachments?: string[];
}

interface CommunityComposerProps {
  onSubmit: (payload: CommunityComposerSubmitPayload) => Promise<void> | void;
  isSubmitting?: boolean;
  error?: string;
  avatar?: string;
  placeholder?: string;
  className?: string;
}

export const CommunityComposer = ({
  onSubmit,
  isSubmitting = false,
  error,
  avatar = "/images/student/avatar-student-default.svg",
  placeholder = "اكتب منشوراً وشاركه مع المجتمع...",
  className,
}: CommunityComposerProps) => {
  const [content, setContent] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setContent("");
    setImagePreview(null);
    setImageError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const trimmed = content.trim();
    if (!trimmed || isSubmitting) return;

    await onSubmit({
      content: trimmed,
      attachments: imagePreview ? [imagePreview] : undefined,
    });
    reset();
  };

  return (
    <section
      className={cn(
        "rounded-3xl border border-[#e2e8f0] bg-white p-5 shadow-sm",
        className,
      )}
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
              placeholder={placeholder}
              disabled={isSubmitting}
              className="w-full resize-none rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] px-4 py-3 text-right text-sm text-[#0f172a] outline-none transition-colors placeholder:text-[#94a3b8] focus:border-[#f5a524]/30 focus:bg-white disabled:opacity-60"
            />

            {imagePreview ? (
              <div className="relative mt-3 overflow-hidden rounded-2xl border border-[#e2e8f0]">
                <img
                  src={imagePreview}
                  alt=""
                  className="max-h-56 w-full object-cover"
                  aria-hidden
                />
                <button
                  type="button"
                  onClick={() => setImagePreview(null)}
                  className="absolute left-3 top-3 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white"
                >
                  إزالة الصورة
                </button>
              </div>
            ) : null}

            {error || imageError ? (
              <p className="mt-2 text-right text-xs text-red-600">
                {error || imageError}
              </p>
            ) : null}

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (event) => {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    if (file.size > 2 * 1024 * 1024) {
                      setImageError("الحد الأقصى لحجم الصورة 2MB");
                      return;
                    }
                    try {
                      setImageError(null);
                      const dataUrl = await fileToDataUrl(file);
                      setImagePreview(dataUrl);
                    } catch {
                      setImageError("تعذر رفع الصورة");
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-[#e2e8f0] bg-white px-3 py-2 text-xs font-medium text-[#64748b] transition-colors hover:bg-[#f8fafc]"
                >
                  <span
                    className="inline-block size-4 bg-[#f5a524] mask-contain mask-center mask-no-repeat"
                    style={{
                      WebkitMaskImage: "url(/images/student/icon-image.svg)",
                      maskImage: "url(/images/student/icon-image.svg)",
                    }}
                    aria-hidden
                  />
                  صورة
                </button>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !content.trim()}
                className="inline-flex items-center justify-center rounded-2xl bg-[#f5a524] px-6 py-2.5 text-sm font-bold text-white shadow-[0px_10px_15px_-3px_rgba(245,165,36,0.2)] transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "جاري النشر..." : "نشر على العام"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </section>
  );
};
