export const adminStudentsOverview = {
  totalRegistered: 1248,
  subtitleCount: "1,248",
};

export type StudentTab = "active" | "waiting" | "graduates";
export type StudentPaymentStatus = "paid" | "partial";
export type StudentListStatus = "active" | "waiting" | "graduate";

export interface AdminStudent {
  id: string;
  /** Auth user id — required for starting chats */
  userId: string;
  name: string;
  firstName?: string;
  secondName?: string;
  familyName?: string;
  email: string;
  avatar: string;
  coursesCount: number;
  totalPaid: string;
  metPoints?: number;
  universityId?: string;
  universityName?: string;
  isActive?: boolean;
  createdAt?: string;
  paymentNote: string;
  paymentNoteTone: "success" | "danger" | "neutral";
  paymentStatus: StudentPaymentStatus;
  listStatus: StudentListStatus;
  degree: string;
  yearTag: string;
  gpa: string;
  attendance: string;
  enrolledCourses: {
    id?: string;
    name: string;
    progress: number;
    tone: "orange" | "green";
  }[];
  recentActivities: {
    id: string;
    text: string;
    time: string;
    icon: string;
    iconBg: string;
    iconColor: string;
  }[];
  metTransactions?: {
    id: string;
    amount: string;
    date: string;
    description: string;
    tone: "success" | "warning";
  }[];
}

export const adminStudents: AdminStudent[] = [
  {
    id: "1",
    userId: "1",
    name: "محمد بن قحطان",
    email: "m.qahtan@university.edu",
    avatar: "/images/student/avatar-user-2.svg",
    coursesCount: 4,
    totalPaid: "12,450 ر.س",
    paymentNote: "لا يوجد رصيد مستحق",
    paymentNoteTone: "success",
    paymentStatus: "paid",
    listStatus: "active",
    degree: "بكالوريوس علوم الحاسب",
    yearTag: "طالب سنة نهائية",
    gpa: "4.8",
    attendance: "92%",
    enrolledCourses: [
      { name: "Advanced UI/UX Design", progress: 78, tone: "orange" },
      { name: "Mastering Motion Graphics", progress: 64, tone: "orange" },
      { name: "Digital Marketing Basics", progress: 100, tone: "green" },
    ],
    recentActivities: [
      {
        id: "1",
        text: "تم تسليم الواجب",
        time: "منذ ساعتين",
        icon: "/images/student/icon-file.svg",
        iconBg: "bg-[#eff6ff]",
        iconColor: "text-[#3b82f6]",
      },
      {
        id: "2",
        text: "اكتمل امتحان منتصف الفصل",
        time: "منذ يوم",
        icon: "/images/student/icon-quiz.svg",
        iconBg: "bg-[#ecfdf5]",
        iconColor: "text-[#14b8a6]",
      },
      {
        id: "3",
        text: "تسجيل دخول للنظام",
        time: "منذ 3 أيام",
        icon: "/images/student/icon-active-user.svg",
        iconBg: "bg-[#fff7ed]",
        iconColor: "text-[#f5a524]",
      },
    ],
  },
  {
    id: "2",
    userId: "2",
    name: "Alex Rivers",
    email: "alex.rivers@campus.edu",
    avatar: "/images/student/avatar-user-3.svg",
    coursesCount: 2,
    totalPaid: "6,800 ر.س",
    paymentNote: "600 ر.س معلّق",
    paymentNoteTone: "danger",
    paymentStatus: "partial",
    listStatus: "active",
    degree: "بكالوريوس هندسة البرمجيات",
    yearTag: "طالب سنة ثالثة",
    gpa: "4.5",
    attendance: "88%",
    enrolledCourses: [
      { name: "Data Structures", progress: 55, tone: "orange" },
      { name: "Web Development", progress: 42, tone: "orange" },
    ],
    recentActivities: [
      {
        id: "1",
        text: "دفع قسط جزئي",
        time: "منذ 4 ساعات",
        icon: "/images/student/icon-wallet.svg",
        iconBg: "bg-[#fff7ed]",
        iconColor: "text-[#f5a524]",
      },
    ],
  },
  {
    id: "3",
    userId: "3",
    name: "سارة العتيبي",
    email: "sara.otibi@university.edu",
    avatar: "/images/student/avatar-user-1.svg",
    coursesCount: 6,
    totalPaid: "18,900 ر.س",
    paymentNote: "لا يوجد رصيد مستحق",
    paymentNoteTone: "success",
    paymentStatus: "paid",
    listStatus: "active",
    degree: "بكالوريوس التسويق الرقمي",
    yearTag: "طالب سنة رابعة",
    gpa: "4.9",
    attendance: "96%",
    enrolledCourses: [
      { name: "Brand Strategy", progress: 90, tone: "orange" },
      { name: "Content Marketing", progress: 72, tone: "orange" },
    ],
    recentActivities: [],
  },
  {
    id: "4",
    userId: "4",
    name: "خالد المنصور",
    email: "k.almansour@university.edu",
    avatar: "/images/student/avatar-user-4.svg",
    coursesCount: 3,
    totalPaid: "9,200 ر.س",
    paymentNote: "350 ر.س معلّق",
    paymentNoteTone: "danger",
    paymentStatus: "partial",
    listStatus: "waiting",
    degree: "بكالوريوس الأمن السيبراني",
    yearTag: "طالب سنة ثانية",
    gpa: "4.2",
    attendance: "85%",
    enrolledCourses: [
      { name: "Network Security", progress: 30, tone: "orange" },
    ],
    recentActivities: [],
  },
  {
    id: "5",
    userId: "5",
    name: "ليلى الحربي",
    email: "l.harbi@university.edu",
    avatar: "/images/student/avatar-user-5.svg",
    coursesCount: 5,
    totalPaid: "15,600 ر.س",
    paymentNote: "لا يوجد رصيد مستحق",
    paymentNoteTone: "success",
    paymentStatus: "paid",
    listStatus: "graduate",
    degree: "بكالوريوس علوم البيانات",
    yearTag: "خريجة 2024",
    gpa: "4.7",
    attendance: "94%",
    enrolledCourses: [],
    recentActivities: [],
  },
];

export const paymentStatusLabels: Record<
  StudentPaymentStatus,
  { label: string; className: string }
> = {
  paid: {
    label: "مدفوع بالكامل",
    className: "bg-[#ecfdf5] text-[#14b8a6]",
  },
  partial: {
    label: "جزئي",
    className: "bg-[#fff7ed] text-[#f5a524]",
  },
};

export const paymentNoteToneClass: Record<
  AdminStudent["paymentNoteTone"],
  string
> = {
  success: "text-[#14b8a6]",
  danger: "text-[#ef4444]",
  neutral: "text-[#64748b]",
};

export interface PaymentHistoryEntry {
  id: string;
  amount: string;
  date: string;
  description: string;
  tone: "success" | "warning";
}

export const adminPaymentHistory: PaymentHistoryEntry[] = [
  {
    id: "1",
    amount: "+1,687.50 ر.س",
    date: "24 أكتوبر 2023 • 10:42 ص",
    description: "قسط مستلم من Alex Rivers",
    tone: "success",
  },
  {
    id: "2",
    amount: "+2,400.00 ر.س",
    date: "22 أكتوبر 2023 • 03:15 م",
    description: "دفعة كاملة من محمد بن قحطان",
    tone: "success",
  },
  {
    id: "3",
    amount: "+950.00 ر.س",
    date: "20 أكتوبر 2023 • 09:20 ص",
    description: "قسط جزئي من خالد المنصور",
    tone: "warning",
  },
  {
    id: "4",
    amount: "+3,120.00 ر.س",
    date: "18 أكتوبر 2023 • 11:05 ص",
    description: "تسجيل دورة جديدة — سارة العتيبي",
    tone: "success",
  },
];

export const studentTabLabels: Record<StudentTab, string> = {
  active: "الطلاب النشطون",
  waiting: "قائمة الانتظار",
  graduates: "الخريجون",
};

export function filterStudentsByTab(
  students: AdminStudent[],
  tab: StudentTab,
): AdminStudent[] {
  if (tab === "active") {
    return students.filter((student) => student.listStatus === "active");
  }
  if (tab === "waiting") {
    return students.filter((student) => student.listStatus === "waiting");
  }
  return students.filter((student) => student.listStatus === "graduate");
}
