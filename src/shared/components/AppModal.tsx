import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/shared/utils/cn";

export interface AppModalProps {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
  /** Extra class on the dialog panel */
  className?: string;
}

const SIZE_CLASS = {
  sm: "max-w-md",
  md: "max-w-xl",
  lg: "max-w-3xl",
} as const;

export const AppModal = ({
  open,
  title,
  description,
  onClose,
  children,
  footer,
  size = "md",
  className,
}: AppModalProps) => {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end justify-center p-0 sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-[#0f172a]/50 backdrop-blur-[2px] transition-opacity"
        aria-label="إغلاق"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="app-modal-title"
        dir="rtl"
        className={cn(
          "relative z-10 flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-3xl border border-[#e2e8f0] bg-white shadow-[0_25px_50px_-12px_rgba(15,23,42,0.35)] sm:rounded-3xl",
          SIZE_CLASS[size],
          className,
        )}
      >
        <div className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-[#e2e8f0] sm:hidden" />

        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-[#f1f5f9] px-5 py-4">
          <div className="min-w-0 text-right">
            <h3 id="app-modal-title" className="text-lg font-black text-[#0f172a]">
              {title}
            </h3>
            {description ? (
              <p className="mt-1 text-sm leading-6 text-[#64748b]">{description}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-[#e2e8f0] bg-[#f8fafc] text-lg leading-none text-[#64748b] transition-colors hover:bg-[#f1f5f9] hover:text-[#0f172a]"
            aria-label="إغلاق"
          >
            ×
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">{children}</div>

        {footer ? (
          <div className="shrink-0 border-t border-[#f1f5f9] bg-[#fafafa] px-5 py-4">
            {footer}
          </div>
        ) : null}
      </div>
    </div>,
    document.body,
  );
};
