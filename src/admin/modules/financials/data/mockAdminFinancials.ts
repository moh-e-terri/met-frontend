export const financialSummaryCards = [
  {
    label: "إجمالي إيرادات المنصة",
    value: "142,850.00",
    suffix: "ر.س",
    badge: "+12.5%",
    badgeClassName: "bg-[#ecfdf5] text-[#14b8a6]",
    icon: "/images/admin/icon-coin.svg",
    iconBg: "bg-[#fff7ed]",
    iconColor: "text-[#f5a524]",
    showTrend: true,
  },
  {
    label: "مدفوعات المدربين",
    value: "99,995.00",
    suffix: "ر.س",
    note: "142 مدرباً نشطاً",
    badge: "70/30",
    badgeClassName: "bg-[#eff6ff] text-[#3b82f6]",
    icon: "/images/student/icon-groups.svg",
    iconBg: "bg-[#eff6ff]",
    iconColor: "text-[#3b82f6]",
  },
  {
    label: "المبالغ المحتجزة",
    value: "14,285.00",
    suffix: "ر.س",
    badge: "10%",
    badgeClassName: "bg-[#fff7ed] text-[#f5a524]",
    icon: "/images/student/icon-lock.svg",
    iconBg: "bg-[#fff7ed]",
    iconColor: "text-[#f5a524]",
    releaseProgress: 65,
    releaseLabel: "تقدم الإفراج",
  },
];

export type TransactionStatus = "pending" | "withheld" | "completed";

export interface FinancialTransaction {
  id: string;
  course: string;
  student: string;
  courseIcon: string;
  amount: string;
  trainerShare: string;
  platformShare: string;
  status: TransactionStatus;
}

export const financialTransactions: FinancialTransaction[] = [
  {
    id: "1",
    course: "Data Science Bootcamp",
    student: "Alex Rivers",
    courseIcon: "/images/student/course-data.svg",
    amount: "249.00 ر.س",
    trainerShare: "174.30",
    platformShare: "74.70",
    status: "pending",
  },
  {
    id: "2",
    course: "UI/UX Masterclass",
    student: "محمد بن قحطان",
    courseIcon: "/images/student/course-web.svg",
    amount: "399.00 ر.س",
    trainerShare: "279.30",
    platformShare: "119.70",
    status: "withheld",
  },
  {
    id: "3",
    course: "JavaScript Advanced",
    student: "سارة العتيبي",
    courseIcon: "/images/student/course-js.svg",
    amount: "189.00 ر.س",
    trainerShare: "132.30",
    platformShare: "56.70",
    status: "completed",
  },
  {
    id: "4",
    course: "Cybersecurity Basics",
    student: "خالد المنصور",
    courseIcon: "/images/student/course-data.svg",
    amount: "320.00 ر.س",
    trainerShare: "224.00",
    platformShare: "96.00",
    status: "completed",
  },
];

export const transactionStatusLabels: Record<
  TransactionStatus,
  { label: string; className: string }
> = {
  pending: {
    label: "قيد الانتظار",
    className: "bg-[#fff7ed] text-[#f5a524]",
  },
  withheld: {
    label: "محتجز",
    className: "bg-[#f1f5f9] text-[#64748b]",
  },
  completed: {
    label: "مكتمل",
    className: "bg-[#ecfdf5] text-[#14b8a6]",
  },
};

export const releaseQueueBatches = [
  {
    id: "78210",
    label: "دفعة #78210",
    progress: 85,
    daysRemaining: "3 أيام متبقية",
    barClass: "bg-[#f5a524]",
  },
  {
    id: "78198",
    label: "دفعة #78198",
    progress: 40,
    daysRemaining: "12 يوماً متبقياً",
    barClass: "bg-[#3b82f6]",
  },
  {
    id: "78175",
    label: "دفعة #78175",
    progress: 15,
    daysRemaining: "28 يوماً متبقياً",
    barClass: "bg-[#8b5cf6]",
  },
];

export const revenueGrowthChart = [
  { month: "يناير", value: 42, tone: "orange" as const },
  { month: "فبراير", value: 55, tone: "yellow" as const },
  { month: "مارس", value: 48, tone: "orange" as const },
  { month: "أبريل", value: 62, tone: "yellow" as const },
  { month: "مايو", value: 58, tone: "orange" as const },
  { month: "يونيو", value: 74, tone: "yellow" as const },
];

export const bottomMetrics = {
  invoices: "12,402",
  totalPayments: "842 ألف",
  revenueGrowthNote: "ارتفاع 18% مقارنة بالربع السابق",
};
