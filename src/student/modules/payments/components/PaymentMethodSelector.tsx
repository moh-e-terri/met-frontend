import { cn } from "@/shared/utils/cn";
import { StudentIcon } from "../../dashboard/components/StudentIcon";
import {
  paymentMethodOptions,
  type PaymentMethodId,
} from "../data/mockPayments";

interface PaymentMethodSelectorProps {
  selected: PaymentMethodId;
  onSelect: (id: PaymentMethodId) => void;
}

export const PaymentMethodSelector = ({
  selected,
  onSelect,
}: PaymentMethodSelectorProps) => {
  return (
    <section dir="rtl">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {paymentMethodOptions.map((method) => {
          const isSelected = selected === method.id;

          return (
            <button
              key={method.id}
              type="button"
              onClick={() => onSelect(method.id)}
              className={cn(
                "relative flex flex-col items-center rounded-2xl border bg-white p-5 text-center transition-colors",
                isSelected
                  ? "border-[#f5a524] shadow-[0_0_0_1px_rgba(245,165,36,0.2)]"
                  : "border-[#e2e8f0] hover:border-[#cbd5e1]",
              )}
            >
              {isSelected && (
                <span className="absolute left-3 top-3 flex size-5 items-center justify-center rounded-full bg-[#fff7ed]">
                  <StudentIcon
                    src="/images/student/icon-check.svg"
                    className="size-3 text-[#f5a524]"
                  />
                </span>
              )}

              <div className="mb-3 flex size-12 items-center justify-center">
                {method.isImage ? (
                  <img
                    src={method.icon}
                    alt=""
                    className="size-12 object-contain"
                    aria-hidden
                  />
                ) : (
                  <span className="flex size-12 items-center justify-center rounded-xl bg-[#f8fafc]">
                    <StudentIcon
                      src={method.icon}
                      className="size-6 text-[#64748b]"
                    />
                  </span>
                )}
              </div>

              <p className="text-sm font-bold text-[#0f172a]">{method.title}</p>
              <p className="mt-1 text-xs text-[#64748b]">{method.subtitle}</p>

              <span
                className={cn(
                  "mt-4 w-full rounded-xl px-3 py-2 text-xs font-semibold",
                  isSelected
                    ? "bg-[#fff7ed] text-[#f5a524]"
                    : "bg-[#f8fafc] text-[#94a3b8]",
                )}
              >
                {isSelected ? "تم الاختيار" : "اختيار"}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
};
