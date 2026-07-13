import { StudentIcon } from "../../dashboard/components/StudentIcon";
import type { PaymentOrderSummary } from "../types";

interface OrderSummarySidebarProps {
  order: PaymentOrderSummary;
  isProcessing?: boolean;
  errorMessage?: string | null;
  onCompletePayment: () => void;
}

export const OrderSummarySidebar = ({
  order,
  isProcessing = false,
  errorMessage,
  onCompletePayment,
}: OrderSummarySidebarProps) => {
  const total = order.metCost + order.vat;

  return (
    <aside className="rounded-3xl border border-[#e2e8f0] bg-white p-5 shadow-sm sm:p-6">
      <h2 className="mb-5 text-right text-lg font-bold text-[#0f172a]" dir="rtl">
        ملخص الاشتراك
      </h2>

      <div className="mb-5 flex items-center gap-3" dir="rtl">
        <img
          src={order.courseImage}
          alt=""
          className="size-14 shrink-0 rounded-xl object-cover"
          aria-hidden
        />
        <div className="min-w-0 text-right">
          <p className="text-sm font-bold text-[#0f172a]">{order.courseTitle}</p>
          <p className="mt-1 text-xs text-[#64748b]">{order.accessLabel}</p>
        </div>
      </div>

      <div className="space-y-3 border-t border-[#f1f5f9] pt-4 text-sm" dir="rtl">
        <div className="flex items-center justify-between text-[#64748b]">
          <span>تكلفة المقرر</span>
          <span className="font-semibold text-[#0f172a]" dir="ltr">
            {order.metCost} {order.currency}
          </span>
        </div>
        <div className="flex items-center justify-between text-[#64748b]">
          <span>رسوم إضافية</span>
          <span className="font-semibold text-[#0f172a]" dir="ltr">
            {order.vat} {order.currency}
          </span>
        </div>
        <div className="flex items-center justify-between pt-2">
          <span className="font-bold text-[#0f172a]">المجموع الكلي</span>
          <span className="text-2xl font-black text-[#f5a524]" dir="ltr">
            {total} {order.currency}
          </span>
        </div>
      </div>

      {errorMessage ? (
        <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-right text-xs text-red-600">
          {errorMessage}
        </p>
      ) : null}

      <button
        type="button"
        disabled={isProcessing}
        onClick={onCompletePayment}
        className="mt-5 w-full rounded-2xl bg-[#14b8a6] py-3.5 text-sm font-bold text-white shadow-[0px_10px_15px_-3px_rgba(20,184,166,0.25)] transition-transform hover:scale-[1.01] disabled:opacity-70"
      >
        {isProcessing ? "جاري إتمام الاشتراك..." : "إتمام الدفع والاشتراك"}
      </button>

      <p
        className="mt-4 flex items-center justify-center gap-1.5 text-[10px] font-semibold tracking-wider text-[#94a3b8]"
        dir="ltr"
      >
        <StudentIcon
          src="/images/student/icon-lock.svg"
          className="size-3 text-[#94a3b8]"
        />
        <span>SECURE CHECKOUT</span>
      </p>
    </aside>
  );
};
