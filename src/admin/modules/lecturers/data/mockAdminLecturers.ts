export const adminLecturersOverview = {
  totalStudents: "12,482",
  studentsTrend: "↑ 12%",
  averageRating: "4.82",
  totalPayments: "$142k",
  paymentsTrend: "↑ $4.2k",
  activeLecturers: "142",
  totalLecturersCount: 142,
};

export type LecturerStatus = "active" | "pending" | "inactive";

export interface AdminLecturer {
  id: string;
  /** Auth user id — required for starting chats */
  userId: string;
  name: string;
  firstName?: string;
  secondName?: string;
  familyName?: string;
  email?: string;
  specialization: string;
  coursesCount: number;
  earnings: string;
  status: LecturerStatus;
  avatar: string;
  title: string;
  joinedDate: string;
  studentsCount: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  paypalAccount?: string;
  bio?: string;
  isActive?: boolean;
  createdAt?: string;
  managedCourses: {
    id?: string;
    name: string;
    revenue: string;
    enrolledCount?: number;
    thumbnail?: string;
    metCost?: number;
  }[];
  totalProfit: string;
  availableBalance: string;
  pendingBalance: string;
}

export const adminLecturers: AdminLecturer[] = [
  {
    id: "1",
    userId: "1",
    name: "محمد بن قحطان",
    specialization: "UI/UX Design",
    coursesCount: 8,
    earnings: "$18,200",
    status: "active",
    avatar: "/images/student/avatar-user-2.svg",
    title: "UI/UX Design Specialist",
    joinedDate: "14 أكتوبر 2023",
    studentsCount: "3,240",
    managedCourses: [
      { name: "Figma Mastery 2024", revenue: "$12,400" },
      { name: "Design Systems Basics", revenue: "$5,800" },
    ],
    totalProfit: "$18,200",
    availableBalance: "$4,150",
    pendingBalance: "$1,200",
  },
  {
    id: "2",
    userId: "2",
    name: "محمد بن قحطان",
    specialization: "Data Science",
    coursesCount: 15,
    earnings: "$31,400",
    status: "pending",
    avatar: "/images/student/avatar-user-3.svg",
    title: "Data Science Expert",
    joinedDate: "2 يناير 2024",
    studentsCount: "5,120",
    managedCourses: [
      { name: "Python for Analytics", revenue: "$18,600" },
      { name: "Machine Learning 101", revenue: "$12,800" },
    ],
    totalProfit: "$31,400",
    availableBalance: "$8,200",
    pendingBalance: "$2,400",
  },
  {
    id: "3",
    userId: "3",
    name: "محمد بن قحطان",
    specialization: "Digital Marketing",
    coursesCount: 5,
    earnings: "$9,320",
    status: "inactive",
    avatar: "/images/student/avatar-user-4.svg",
    title: "Digital Marketing Consultant",
    joinedDate: "20 مارس 2023",
    studentsCount: "1,860",
    managedCourses: [
      { name: "Social Media Strategy", revenue: "$6,100" },
      { name: "SEO Fundamentals", revenue: "$3,220" },
    ],
    totalProfit: "$9,320",
    availableBalance: "$1,450",
    pendingBalance: "$680",
  },
  {
    id: "4",
    userId: "4",
    name: "نوال آل سعود",
    specialization: "Cybersecurity",
    coursesCount: 11,
    earnings: "$24,600",
    status: "active",
    avatar: "/images/student/avatar-user-1.svg",
    title: "Cybersecurity Instructor",
    joinedDate: "8 يونيو 2023",
    studentsCount: "2,980",
    managedCourses: [
      { name: "Network Security Basics", revenue: "$14,200" },
      { name: "Ethical Hacking Intro", revenue: "$10,400" },
    ],
    totalProfit: "$24,600",
    availableBalance: "$6,800",
    pendingBalance: "$1,900",
  },
];

export const lecturerStatusLabels: Record<
  LecturerStatus,
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
  inactive: {
    label: "غير نشط",
    className: "bg-[#f1f5f9] text-[#64748b]",
  },
};

export const lecturerStatsCards = [
  {
    label: "إجمالي الطلاب",
    value: adminLecturersOverview.totalStudents,
    badge: adminLecturersOverview.studentsTrend,
    badgeClassName: "bg-[#ecfdf5] text-[#14b8a6]",
    icon: "/images/student/icon-groups.svg",
    iconBg: "bg-[#eff6ff]",
    iconColor: "text-[#3b82f6]",
    showTrendIcon: true,
  },
  {
    label: "متوسط التقييم",
    value: adminLecturersOverview.averageRating,
    icon: "/images/student/icon-star.svg",
    iconBg: "bg-[#fff7ed]",
    iconColor: "text-[#f5a524]",
    showStars: true,
  },
  {
    label: "إجمالي المدفوعات",
    value: adminLecturersOverview.totalPayments,
    badge: adminLecturersOverview.paymentsTrend,
    badgeClassName: "bg-[#ecfdf5] text-[#14b8a6]",
    icon: "/images/student/icon-wallet.svg",
    iconBg: "bg-[#ecfdf5]",
    iconColor: "text-[#14b8a6]",
    showTrendIcon: false,
  },
  {
    label: "المعلمون النشطون",
    value: adminLecturersOverview.activeLecturers,
    icon: "/images/admin/icon-graduation.svg",
    iconBg: "bg-[#f5f3ff]",
    iconColor: "text-[#8b5cf6]",
  },
];
