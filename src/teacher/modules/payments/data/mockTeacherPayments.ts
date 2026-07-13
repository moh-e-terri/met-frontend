export const teacherPaymentStats = [
  {
    label: "إجمالي الأرباح",
    value: "$12,450.00",
    badge: "+12%",
    icon: "/images/student/icon-wallet.svg",
    iconBg: "bg-[#eff6ff]",
    iconColor: "text-[#3b82f6]",
    badgeClassName: "bg-[#ecfdf5] text-[#14b8a6]",
  },
  {
    label: "الرصيد المتاح",
    value: "$3,200.00",
    icon: "/images/teacher/icon-money.svg",
    iconBg: "bg-[#ecfdf5]",
    iconColor: "text-[#14b8a6]",
    showInfo: true,
  },
  {
    label: "الرصيد المعلق",
    value: "$1,150.00",
    icon: "/images/student/icon-clock.svg",
    iconBg: "bg-[#fff7ed]",
    iconColor: "text-[#f5a524]",
  },
  {
    label: "إجمالي المبلغ المسحوب",
    value: "$8,100.00",
    icon: "/images/teacher/icon-history.svg",
    iconBg: "bg-[#f1f5f9]",
    iconColor: "text-[#64748b]",
  },
];

export interface EarningsChartPoint {
  label: string;
  value: number;
  amount: string;
  active?: boolean;
}

export const earningsMonthlyChartData: EarningsChartPoint[] = [
  { label: "يناير", value: 45, amount: "$1.8k" },
  { label: "فبراير", value: 52, amount: "$2.1k" },
  { label: "مارس", value: 48, amount: "$1.9k" },
  { label: "أبريل", value: 60, amount: "$2.4k" },
  { label: "مايو", value: 55, amount: "$2.2k" },
  { label: "يونيو", value: 80, amount: "$3.2k", active: true },
  { label: "يوليو", value: 58, amount: "$2.3k" },
];

export const earningsWeeklyChartData: EarningsChartPoint[] = [
  { label: "السبت", value: 38, amount: "$520" },
  { label: "الأحد", value: 42, amount: "$580" },
  { label: "الاثنين", value: 55, amount: "$760" },
  { label: "الثلاثاء", value: 48, amount: "$640" },
  { label: "الأربعاء", value: 62, amount: "$840" },
  { label: "الخميس", value: 74, amount: "$980", active: true },
  { label: "الجمعة", value: 50, amount: "$690" },
];

/** @deprecated Use earningsMonthlyChartData */
export const earningsChartData = earningsMonthlyChartData;

export const withdrawalMethod = {
  type: "PayPal Business",
  email: "ah***@business.paypal.com",
};

export const availableWithdrawal = "$3,200.00";

export const paymentAlerts = [
  {
    id: "1",
    type: "success" as const,
    text: "تم تحويل $12.00 إلى حساب PayPal بنجاح.",
    icon: "/images/student/icon-check.svg",
    iconBg: "bg-[#ecfdf5]",
    iconColor: "text-[#14b8a6]",
  },
  {
    id: "2",
    type: "warning" as const,
    text: "يرجى تحديث مستندات الضرائب لاستكمال السحب القادم.",
    icon: "/images/student/icon-info.svg",
    iconBg: "bg-[#fff7ed]",
    iconColor: "text-[#f5a524]",
  },
];

export type TransactionStatus = "completed" | "pending" | "failed";

export interface TeacherTransaction {
  id: string;
  date: string;
  course: string;
  subtitle: string;
  amount: string;
  status: TransactionStatus;
}

export const teacherTransactions: TeacherTransaction[] = [
  {
    id: "#TR-8921-01",
    date: "Oct 24, 2023",
    course: "ماستر كلاس JavaScript",
    subtitle: "اشتراك طالب — خطة شهرية",
    amount: "$299.00",
    status: "completed",
  },
  {
    id: "#TR-8920-88",
    date: "Oct 22, 2023",
    course: "مقدمة React 18",
    subtitle: "اشتراك طالب — خطة سنوية",
    amount: "$149.00",
    status: "pending",
  },
  {
    id: "#TR-8919-44",
    date: "Oct 20, 2023",
    course: "Data Science Essentials",
    subtitle: "اشتراك طالب — خطة شهرية",
    amount: "$199.00",
    status: "failed",
  },
  {
    id: "#TR-8918-12",
    date: "Oct 18, 2023",
    course: "UI/UX Design Basics",
    subtitle: "اشتراك طالب — خطة شهرية",
    amount: "$89.00",
    status: "completed",
  },
];

export const transactionStatusLabels: Record<
  TransactionStatus,
  { label: string; className: string }
> = {
  completed: {
    label: "مكتمل",
    className: "bg-[#ecfdf5] text-[#14b8a6]",
  },
  pending: {
    label: "قيد الانتظار",
    className: "bg-[#fff7ed] text-[#f5a524]",
  },
  failed: {
    label: "فشل",
    className: "bg-[#fef2f2] text-[#ef4444]",
  },
};
