interface PaymentPageHeaderProps {
  courseTitle?: string;
}

export const PaymentPageHeader = ({ courseTitle }: PaymentPageHeaderProps) => {
  return (
    <header className="text-right" dir="rtl">
      <h1 className="text-2xl font-black text-[#0f172a] md:text-3xl">
        وسائل الدفع
      </h1>
      <p className="mt-2 text-sm leading-6 text-[#64748b] md:text-base">
        {courseTitle
          ? `أكمل الدفع للاشتراك في "${courseTitle}" ثم سيتم تفعيل المقرر في حسابك.`
          : "اختر طريقة الدفع المناسبة للاشتراك في الكورسات التعليمية."}
      </p>
    </header>
  );
};
