import { useState } from "react";
import { AppModal } from "@/shared/components/AppModal";

interface DropCourseModalProps {
  open: boolean;
  courseTitle: string;
  isPending?: boolean;
  step: "confirm" | "no-refund";
  errorMessage?: string | null;
  onClose: () => void;
  onConfirmRefundable: () => void;
  onConfirmWithoutRefund: () => void;
}

export const DropCourseModal = ({
  open,
  courseTitle,
  isPending,
  step,
  errorMessage,
  onClose,
  onConfirmRefundable,
  onConfirmWithoutRefund,
}: DropCourseModalProps) => {
  return (
    <AppModal
      open={open}
      onClose={() => {
        if (isPending) return;
        onClose();
      }}
      title={step === "confirm" ? "تأكيد الانسحاب" : "انتهت مدة استرداد النقاط"}
      size="sm"
      footer={
        <div className="flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="rounded-2xl border border-[#e2e8f0] px-4 py-2.5 text-sm font-bold text-[#64748b]"
          >
            {step === "confirm" ? "تراجع" : "إلغاء"}
          </button>
          {step === "confirm" ? (
            <button
              type="button"
              disabled={isPending}
              onClick={onConfirmRefundable}
              className="rounded-2xl bg-[#ef4444] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60"
            >
              {isPending ? "جاري الانسحاب..." : "تأكيد الانسحاب"}
            </button>
          ) : (
            <button
              type="button"
              disabled={isPending}
              onClick={onConfirmWithoutRefund}
              className="rounded-2xl bg-[#f59e0b] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60"
            >
              {isPending ? "جاري الانسحاب..." : "انسحب دون استرداد"}
            </button>
          )}
        </div>
      }
    >
      {step === "confirm" ? (
        <p className="text-sm leading-7 text-[#64748b]">
          هل أنت متأكد من الانسحاب من مقرر{" "}
          <span className="font-bold text-[#0f172a]">{courseTitle}</span>؟ قد يتم
          استرداد رسوم الكورس حسب مدة الاسترداد.
        </p>
      ) : (
        <p className="text-sm leading-7 text-[#64748b]">
          يمكنك الانسحاب من الكورس، لكن لن يتم إرجاع نقاطك. هذا الإجراء نهائي.
        </p>
      )}

      {errorMessage && step === "confirm" ? (
        <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-600">
          {errorMessage}
        </p>
      ) : null}
    </AppModal>
  );
};

/** Hook-friendly helper kept colocated for drop flow state */
export function useDropCourseModalState() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"confirm" | "no-refund">("confirm");
  return { open, setOpen, step, setStep };
}
