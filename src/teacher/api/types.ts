export interface TeacherProfile {
  title?: string;
  experience?: string;
  email?: string;
  subtitle?: string;
}

export interface TeacherStatItem {
  label: string;
  value: string;
  icon: string;
  iconBg: string;
  iconColor: string;
}

export interface TeacherCourseItem {
  id: string;
  title: string;
  image: string;
  students: string;
  lessons: string;
  university?: string;
  universityId?: string;
}

export interface TeacherActivityItem {
  id: string;
  text: string;
  time: string;
  icon: string;
  iconBg: string;
  iconColor: string;
}

export interface TeacherNotificationItem {
  id: string;
  text: string;
  icon: string;
  iconBg: string;
  iconColor: string;
}

export interface TeacherEarningsSummary {
  total: string;
  progress: number;
  availableBalance: string;
  newSubscribers: string;
}

export interface InstructorDashboardData {
  profile: TeacherProfile;
  stats: TeacherStatItem[];
  courses: TeacherCourseItem[];
  activities: TeacherActivityItem[];
  notifications: TeacherNotificationItem[];
  earnings: TeacherEarningsSummary;
}

export interface TeacherFinanceStat {
  label: string;
  value: string;
  badge?: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  badgeClassName?: string;
  showInfo?: boolean;
}

export type TeacherTransactionStatus = "completed" | "pending" | "failed";

export type TeacherFinanceTxType = "earned" | "released" | "cancelled" | "unknown";

export interface TeacherFinanceSummary {
  totalEarnedMET: number;
  totalEarnedUSD: number;
  reservedMET: number;
  reservedUSD: number;
  releasedMET: number;
  releasedUSD: number;
}

export interface TeacherCourseBreakdownItem {
  courseId: string;
  title: string;
  enrolledCount: number;
  totalIncomeMET: number;
  earnedMET: number;
  reservedMET: number;
  releasedMET: number;
}

export interface TeacherFinanceTransaction {
  id: string;
  date: string;
  course: string;
  subtitle: string;
  amount: string;
  amountValue: number;
  type: TeacherFinanceTxType;
  status: TeacherTransactionStatus;
}

export interface TeacherFinanceChartPoint {
  label: string;
  value: number;
  amount: string;
  active?: boolean;
}

export interface TeacherPaymentAlert {
  id: string;
  text: string;
  icon: string;
  iconBg: string;
  iconColor: string;
}

export interface InstructorFinanceData {
  summary: TeacherFinanceSummary;
  courseBreakdown: TeacherCourseBreakdownItem[];
  /** @deprecated prefer recentTransactions — kept for legacy UI */
  stats: TeacherFinanceStat[];
  availableWithdrawal: string;
  withdrawalMethod?: {
    type: string;
    email: string;
  };
  transactions: TeacherFinanceTransaction[];
  chartMonthly: TeacherFinanceChartPoint[];
  chartWeekly: TeacherFinanceChartPoint[];
  alerts: TeacherPaymentAlert[];
}

export interface CourseStudent {
  /** Auth user id — for chat and profile routes */
  id: string;
  /** Student profile document id when available */
  profileId?: string;
  name: string;
  firstName?: string;
  secondName?: string;
  familyName?: string;
  avatar: string;
  email?: string;
  progress: number;
  isRecognized?: boolean;
  university?: string;
  enrolledAt?: string;
}
