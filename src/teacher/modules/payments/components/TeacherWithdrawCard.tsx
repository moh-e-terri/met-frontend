import type { TeacherPaymentAlert } from "@/teacher/api";
import { TeacherIcon } from "../../dashboard/components/TeacherIcon";

interface TeacherWithdrawCardProps {
  availableWithdrawal?: string;
  withdrawalMethod?: {
    type: string;
    email: string;
  };
  isLoading?: boolean;
}

export const TeacherWithdrawCard = ({
  availableWithdrawal = "$0.00",
  withdrawalMethod,
  isLoading,
}: TeacherWithdrawCardProps) => {
  if (isLoading) {
    return <div className="h-72 animate-pulse rounded-3xl bg-[#e2e8f0]" />;
  }

  return (
    <section
      className="rounded-3xl border border-[#e2e8f0] bg-white p-5 shadow-sm"
      dir="rtl"
    >
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="text-base font-bold text-[#0f172a]">سحب الأموال</h2>
        <button
          type="button"
          className="text-xs font-semibold text-[#3b82f6] hover:underline"
        >
          تعديل
        </button>
      </div>

      <p className="mb-2 text-right text-xs text-[#64748b]">طريقة الدفع الحالية</p>

      <div className="mb-4 flex items-center gap-3 rounded-2xl bg-[#f8fafc] px-4 py-3">
        <TeacherIcon
          src="/images/student/icon-paypal.svg"
          className="size-8 shrink-0 text-[#3b82f6]"
        />
        <div className="min-w-0 flex-1 text-right">
          <p className="text-sm font-bold text-[#0f172a]">
            {withdrawalMethod?.type ?? "لم تُحدد بعد"}
          </p>
          <p className="text-xs text-[#64748b]" dir="ltr">
            {withdrawalMethod?.email ?? "—"}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-dashed border-[#fde8c8] bg-[#fff7ed]/40 px-4 py-5 text-center">
        <p className="text-xs text-[#64748b]">متاح للسحب الفوري</p>
        <p className="mt-2 text-3xl font-black text-[#f5a524]" dir="ltr">
          {availableWithdrawal}
        </p>
      </div>

      <button
        type="button"
        className="mt-4 w-full rounded-2xl bg-[#f5a524] py-3 text-sm font-bold text-white shadow-[0px_10px_15px_-3px_rgba(245,165,36,0.2)] transition-transform hover:scale-[1.01]"
      >
        طلب سحب
      </button>
    </section>
  );
};

interface TeacherPaymentAlertsProps {
  alerts?: TeacherPaymentAlert[];
  isLoading?: boolean;
}

export const TeacherPaymentAlerts = ({ alerts = [], isLoading }: TeacherPaymentAlertsProps) => {
  return (
    <section
      className="rounded-3xl border border-[#e2e8f0] bg-white p-5 shadow-sm"
      dir="rtl"
    >
      <h2 className="mb-4 text-base font-bold text-[#0f172a]">التنبيهات الأخيرة</h2>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="h-14 animate-pulse rounded-2xl bg-[#e2e8f0]" />
          ))}
        </div>
      ) : alerts.length === 0 ? (
        <p className="py-4 text-center text-sm text-[#64748b]">لا توجد تنبيهات مالية.</p>
      ) : (
        <ul className="space-y-3">
          {alerts.map((alert) => (
            <li
              key={alert.id}
              className="flex items-start gap-3 rounded-2xl bg-[#f8fafc] px-3 py-3"
            >
              <span
                className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${alert.iconBg}`}
              >
                <TeacherIcon src={alert.icon} className={`size-4 ${alert.iconColor}`} />
              </span>
              <p className="flex-1 text-right text-sm leading-6 text-[#475569]">
                {alert.text}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};
