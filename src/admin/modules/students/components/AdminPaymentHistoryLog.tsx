import type { AdminStudent } from "../data/mockAdminStudents";
import { AdminIcon } from "../../dashboard/components/AdminIcon";

interface AdminPaymentHistoryLogProps {
  student?: AdminStudent | null;
}

export const AdminPaymentHistoryLog = ({ student }: AdminPaymentHistoryLogProps) => {
  const entries = student?.metTransactions ?? [];

  return (
    <section
      className="rounded-3xl border border-[#e2e8f0] bg-white p-5 shadow-sm sm:p-6"
      dir="rtl"
    >
      <h2 className="mb-5 flex items-center justify-start gap-2 text-lg font-bold text-[#0f172a]">
        <AdminIcon
          src="/images/student/icon-receipt.svg"
          className="size-5 text-[#f5a524]"
        />
        <span>سجل عمليات MET</span>
      </h2>

      {!student ? (
        <p className="text-right text-sm text-[#64748b]">اختر طالباً لعرض سجل عملياته.</p>
      ) : entries.length === 0 ? (
        <p className="text-right text-sm text-[#64748b]">
          لا توجد عمليات MET مسجلة لـ {student.name}.
        </p>
      ) : (
        <ul className="space-y-3">
          {entries.map((entry) => (
            <li
              key={entry.id}
              className="flex items-start gap-3 rounded-2xl bg-[#f8fafc] px-4 py-3"
            >
              <span
                className={`mt-1.5 size-2.5 shrink-0 rounded-full ${
                  entry.tone === "success" ? "bg-[#14b8a6]" : "bg-[#f5a524]"
                }`}
              />

              <div className="min-w-0 flex-1 text-right">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-bold text-[#14b8a6]" dir="ltr">
                    {entry.amount}
                  </p>
                  <p className="text-xs text-[#94a3b8]">{entry.date}</p>
                </div>
                <p className="mt-1 text-sm text-[#64748b]">{entry.description}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};
