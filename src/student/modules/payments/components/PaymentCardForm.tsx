import { StudentIcon } from "../../dashboard/components/StudentIcon";

interface PaymentCardFormProps {
  isProcessing?: boolean;
  onSubmit: () => void;
}

export const PaymentCardForm = ({ isProcessing = false, onSubmit }: PaymentCardFormProps) => {
  return (
    <section className="rounded-3xl border border-[#e2e8f0] bg-white p-5 shadow-sm sm:p-6">
      <h2
        className="mb-6 flex w-full items-center justify-start gap-2 text-lg font-bold text-[#0f172a]"
        dir="rtl"
      >
        <StudentIcon
          src="/images/student/icon-lock.svg"
          className="size-5 text-[#f5a524]"
        />
        <span>تفاصيل الدفع</span>
      </h2>

      <form
        className="space-y-5"
        dir="rtl"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <label className="block text-right">
          <span className="mb-2 block text-sm font-medium text-[#475569]">
            الاسم على البطاقة
          </span>
          <input
            type="text"
            defaultValue="Ahmed Mohamed"
            className="w-full rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] px-4 py-3 text-right text-sm text-[#0f172a] outline-none transition-colors focus:border-[#f5a524]/30 focus:bg-white"
            dir="ltr"
          />
        </label>

        <label className="block text-right">
          <span className="mb-2 block text-sm font-medium text-[#475569]">
            رقم البطاقة
          </span>
          <input
            type="text"
            defaultValue="0000 0000 0000 0000"
            className="w-full rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] px-4 py-3 text-left text-sm text-[#0f172a] outline-none transition-colors focus:border-[#f5a524]/30 focus:bg-white"
            dir="ltr"
          />
        </label>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block text-right">
            <span className="mb-2 block text-sm font-medium text-[#475569]">
              تاريخ الانتهاء
            </span>
            <input
              type="text"
              defaultValue="MM / YY"
              className="w-full rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] px-4 py-3 text-center text-sm text-[#94a3b8] outline-none transition-colors focus:border-[#f5a524]/30 focus:bg-white"
              dir="ltr"
            />
          </label>

          <label className="block text-right">
            <span className="mb-2 block text-sm font-medium text-[#475569]">
              الرمز السري (CVV)
            </span>
            <input
              type="password"
              defaultValue="•••"
              className="w-full rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] px-4 py-3 text-center text-sm text-[#0f172a] outline-none transition-colors focus:border-[#f5a524]/30 focus:bg-white"
              dir="ltr"
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={isProcessing}
          className="w-full rounded-2xl bg-[#f5a524] py-3.5 text-sm font-bold text-white shadow-[0px_10px_15px_-3px_rgba(245,165,36,0.2)] transition-transform hover:scale-[1.01] disabled:opacity-70"
        >
          {isProcessing ? "جاري المعالجة..." : "تأكيد الدفع"}
        </button>
      </form>
    </section>
  );
};
