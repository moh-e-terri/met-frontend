export const adminStats = [
  {
    label: "إجمالي المقررات",
    value: "1,284",
    trend: "+12%",
    trendUp: true,
    icon: "/images/student/icon-book.svg",
    iconBg: "bg-[#eff6ff]",
    iconColor: "text-[#3b82f6]",
  },
  {
    label: "إجمالي المحاضرين",
    value: "342",
    trend: "+5%",
    trendUp: true,
    icon: "/images/student/icon-active-user.svg",
    iconBg: "bg-[#ecfdf5]",
    iconColor: "text-[#14b8a6]",
  },
  {
    label: "إجمالي الطلاب",
    value: "42.5k",
    trend: "+28%",
    trendUp: true,
    icon: "/images/student/icon-groups.svg",
    iconBg: "bg-[#fff7ed]",
    iconColor: "text-[#f5a524]",
  },
  {
    label: "إجمالي الإيرادات",
    value: "2.4M ر.س",
    trend: "-2%",
    trendUp: false,
    icon: "/images/student/icon-wallet.svg",
    iconBg: "bg-[#f5f3ff]",
    iconColor: "text-[#8b5cf6]",
  },
];

export type CourseSummaryStatus = "active" | "pending" | "rejected";

export interface AdminCourseSummary {
  id: string;
  name: string;
  students: string;
  lecturer: string;
  university: string;
  revenue: string;
  status: CourseSummaryStatus;
}

export const adminCourseSummaries: AdminCourseSummary[] = [
  {
    id: "1",
    name: "Advanced AI Ethics",
    students: "1.2k طالب",
    lecturer: "Dr. Ahmed Salman",
    university: "جامعة الملك سعود",
    revenue: "45,200 ر.س",
    status: "active",
  },
  {
    id: "2",
    name: "Petroleum Engineering",
    students: "890 طالب",
    lecturer: "Sara Al-Qahtani",
    university: "جامعة الملك عبدالعزيز",
    revenue: "31,800 ر.س",
    status: "pending",
  },
  {
    id: "3",
    name: "Modern Architecture",
    students: "420 طالب",
    lecturer: "Omar Fahd",
    university: "جامعة الإمام محمد",
    revenue: "12,400 ر.س",
    status: "rejected",
  },
  {
    id: "4",
    name: "Data Structures",
    students: "2.1k طالب",
    lecturer: "Laila Mahmoud",
    university: "جامعة الملك فيصل",
    revenue: "89,000 ر.س",
    status: "active",
  },
];

export const courseStatusLabels: Record<
  CourseSummaryStatus,
  { label: string; className: string }
> = {
  active: {
    label: "نشط",
    className: "bg-[#ecfdf5] text-[#14b8a6]",
  },
  pending: {
    label: "قيد الانتظار",
    className: "bg-[#fff7ed] text-[#f5a524]",
  },
  rejected: {
    label: "مرفوض",
    className: "bg-[#fef2f2] text-[#ef4444]",
  },
};

export const revenueDistribution = [
  {
    label: "حصة المحاضر",
    percentage: 70,
    amount: "1,680,000 ر.س مدفوع",
    barClass: "bg-[#f5a524]",
  },
  {
    label: "حصة المنصة",
    percentage: 30,
    amount: "720,000 ر.س إجمالي الأرباح",
    barClass: "bg-[#3b82f6]",
  },
  {
    label: "المحتجز (أمان)",
    percentage: 10,
    amount: "240,000 ر.س في الضمان",
    barClass: "bg-[#8b5cf6]",
  },
];

export interface AdminActivity {
  id: string;
  title: string;
  description: string;
  time: string;
  type: "request" | "publish" | "enrollment";
  actions?: { primary: string; secondary: string };
}

export const adminActivities: AdminActivity[] = [
  {
    id: "1",
    title: "تسجيل محاضر جديد",
    description: "د. خالد بن الوليد طلب الانضمام كمحاضر.",
    time: "منذ دقيقتين",
    type: "request",
    actions: { primary: "مراجعة الملف", secondary: "تجاهل" },
  },
  {
    id: "2",
    title: "تم نشر مقرر الاقتصاد الكلي 101",
    description: "المحتوى متاح الآن للطلاب المسجلين.",
    time: "منذ ساعة",
    type: "publish",
  },
  {
    id: "3",
    title: "اكتمال التسجيل الجماعي",
    description: "45 طالباً من جامعة الملك سعود سجّلوا دفعة واحدة.",
    time: "منذ 3 ساعات",
    type: "enrollment",
  },
];
