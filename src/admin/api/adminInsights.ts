import { apiClient, type ApiEnvelope } from "@/core/api/client";
import { asArray, asRecord, pickId, pickNumber, pickString } from "@/core/api/utils";
import type { AdminActivity } from "../modules/dashboard/data/mockAdminDashboard";

export interface RevenueDistributionItem {
  label: string;
  percentage: number;
  amount: string;
  barClass: string;
}

export interface FinancialSummaryCardData {
  label: string;
  value: string;
  suffix: string;
  badge?: string;
  badgeClassName: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  showTrend?: boolean;
  note?: string;
  releaseProgress?: number;
  releaseLabel?: string;
}

export interface ReleaseQueueItem {
  id: string;
  label: string;
  progress: number;
  daysRemaining: string;
  barClass: string;
}

export interface FinancialBottomMetrics {
  invoices: string;
  totalPayments: string;
  revenueGrowthNote: string;
  revenueGrowthChart: Array<{
    id: string;
    month: string;
    value: number;
    tone: "orange" | "yellow";
  }>;
}

export interface FeaturedCourseReport {
  id: string;
  title: string;
  enrolledCount: number;
  totalIncome: number;
}

function formatMet(value: number): string {
  return `${value.toLocaleString("en-US")} MET`;
}

function formatRelativeTime(value?: string): string {
  if (!value) return "منذ قليل";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 60) return `منذ ${minutes} دقيقة`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `منذ ${hours} ساعة`;
  const days = Math.floor(hours / 24);
  return `منذ ${days} يوم`;
}

export async function fetchAdminStatsRaw(): Promise<Record<string, unknown>> {
  const response = await apiClient.get<ApiEnvelope<unknown>>("/admin/stats");
  return asRecord(response.data.data);
}

export function mapRevenueDistribution(
  stats: Record<string, unknown>,
): RevenueDistributionItem[] {
  const finance = asRecord(stats.finance);
  const totalIncome = pickNumber(
    finance.totalIncomeMET,
    finance.totalIncome,
    stats.totalIncomeMET,
    stats.totalIncome,
    stats.totalRevenue,
  );
  const reserved = pickNumber(
    finance.totalReservedMET,
    finance.totalReserved,
    stats.totalReservedMET,
    stats.totalReserved,
  );
  const netProfit = pickNumber(
    finance.netProfitMET,
    finance.netProfit,
    finance.platformShareMET,
    stats.netProfitMET,
    stats.netProfit,
  );
  const instructorShare = pickNumber(
    finance.instructorShareMET,
    finance.instructorPayoutMET,
    finance.instructorPaymentsMET,
    stats.instructorPayoutMET,
  );

  const derivedInstructorShare =
    instructorShare > 0
      ? instructorShare
      : totalIncome > 0 && netProfit >= 0
        ? Math.max(totalIncome - netProfit, 0)
        : 0;
  const derivedPlatformShare =
    netProfit > 0 ? Math.max(netProfit - reserved, 0) : Math.max(totalIncome - derivedInstructorShare - reserved, 0);
  const partsTotal = derivedInstructorShare + derivedPlatformShare + reserved;

  if (!partsTotal && !totalIncome) {
    return [
      {
        label: "إجمالي الدخل",
        percentage: 100,
        amount: "0 MET",
        barClass: "bg-[#f5a524]",
      },
    ];
  }

  const total = Math.max(partsTotal, totalIncome, 1);

  const toPercentage = (value: number) =>
    total > 0 ? Math.round((value / total) * 100) : 0;

  return [
    {
      label: "حصة المحاضرين",
      percentage: toPercentage(derivedInstructorShare),
      amount: formatMet(derivedInstructorShare),
      barClass: "bg-[#f5a524]",
    },
    {
      label: "صافي المنصة",
      percentage: toPercentage(derivedPlatformShare),
      amount: formatMet(derivedPlatformShare),
      barClass: "bg-[#3b82f6]",
    },
    {
      label: "المحتجز (أمان)",
      percentage: toPercentage(reserved),
      amount: formatMet(reserved),
      barClass: "bg-[#8b5cf6]",
    },
  ];
}

export function mapAdminActivities(stats: Record<string, unknown>): AdminActivity[] {
  const topCourses = asArray<Record<string, unknown>>(stats.topCourses);
  const activities: AdminActivity[] = topCourses.slice(0, 3).map((course, index) => {
    const title = pickString(course.title, course.name) || "مقرر";
    const enrolled = pickNumber(course.enrolledCount, course.studentsCount);
    const income = pickNumber(course.totalIncome, course.revenue);

    return {
      id: pickId(course) || `course-activity-${index}`,
      title: enrolled > 0 ? `نشاط في ${title}` : `مقرر جديد: ${title}`,
      description:
        enrolled > 0
          ? `${enrolled} طالب مسجل — إجمالي الدخل ${formatMet(income)}`
          : "المقرر متاح ولم يُسجّل فيه طلاب بعد.",
      time: "آخر تحديث",
      type: enrolled > 0 ? "enrollment" : "publish",
    };
  });

  const totalStudents = pickNumber(stats.totalStudents);
  const totalCourses = pickNumber(stats.totalCourses);

  if (totalStudents > 0) {
    activities.unshift({
      id: "platform-students",
      title: "نمو قاعدة الطلاب",
      description: `${totalStudents} طالب مسجل على المنصة حالياً.`,
      time: "اليوم",
      type: "enrollment",
    });
  }

  if (totalCourses > 0) {
    activities.push({
      id: "platform-courses",
      title: "محتوى المنصة",
      description: `${totalCourses} مقرر نشط على المنصة.`,
      time: "هذا الأسبوع",
      type: "publish",
    });
  }

  return activities.slice(0, 5);
}

export function mapFeaturedCourse(stats: Record<string, unknown>): FeaturedCourseReport | null {
  const topCourses = asArray<Record<string, unknown>>(stats.topCourses);
  const best = topCourses
    .map((course) => ({
      id: pickId(course) || "",
      title: pickString(course.title, course.name) || "مقرر",
      enrolledCount: pickNumber(course.enrolledCount),
      totalIncome: pickNumber(course.totalIncome, course.revenue),
    }))
    .filter((course) => course.id)
    .sort((a, b) => b.totalIncome - a.totalIncome || b.enrolledCount - a.enrolledCount)[0];

  return best ?? null;
}

export function mapFinancialSummaryCards(
  stats: Record<string, unknown>,
  instructorCount: number,
): FinancialSummaryCardData[] {
  const finance = asRecord(stats.finance);
  const totalIncome = pickNumber(finance.totalIncomeMET, finance.totalIncome);
  const totalIncomeUSD = pickNumber(finance.totalIncomeUSD);
  const reserved = pickNumber(finance.totalReservedMET, finance.totalReserved);
  const reservedUSD = pickNumber(finance.totalReservedUSD);
  const netProfit = pickNumber(finance.netProfitMET, finance.netProfit);
  const netProfitUSD = pickNumber(finance.netProfitUSD);

  return [
    {
      label: "الدخل الكلي",
      value: totalIncome.toLocaleString("en-US"),
      suffix: "MET",
      note: totalIncomeUSD
        ? `≈ ${totalIncomeUSD.toLocaleString("en-US")} USD — كل ما دفعه الطلاب`
        : "كل المبالغ التي دفعها الطلاب",
      badge: `${instructorCount} مدرّساً`,
      badgeClassName: "bg-[#eff6ff] text-[#3b82f6]",
      icon: "/images/admin/icon-coin.svg",
      iconBg: "bg-[#fff7ed]",
      iconColor: "text-[#f5a524]",
      showTrend: true,
    },
    {
      label: "المحجوز",
      value: reserved.toLocaleString("en-US"),
      suffix: "MET",
      note: reservedUSD
        ? `≈ ${reservedUSD.toLocaleString("en-US")} USD — مستحقات بانتظار الصرف`
        : "مستحقات المدرسين بانتظار الصرف",
      badge: totalIncome > 0 ? `${Math.round((reserved / totalIncome) * 100)}%` : "0%",
      badgeClassName: "bg-[#fff7ed] text-[#f5a524]",
      icon: "/images/student/icon-lock.svg",
      iconBg: "bg-[#fff7ed]",
      iconColor: "text-[#f5a524]",
    },
    {
      label: "صافي الربح",
      value: netProfit.toLocaleString("en-US"),
      suffix: "MET",
      note: netProfitUSD
        ? `≈ ${netProfitUSD.toLocaleString("en-US")} USD — حصة المنصة`
        : "حصة المنصة بعد خصم مستحقات المدرسين",
      badge: "عمولة المنصة",
      badgeClassName: "bg-[#ecfdf5] text-[#14b8a6]",
      icon: "/images/teacher/icon-money.svg",
      iconBg: "bg-[#ecfdf5]",
      iconColor: "text-[#14b8a6]",
    },
  ];
}

export function mapReleaseQueue(
  payments: Array<Record<string, unknown>>,
): ReleaseQueueItem[] {
  return payments
    .filter((item) => pickNumber(item.totalReservedMET, item.totalReservedUSD) > 0)
    .slice(0, 3)
    .map((item, index) => {
      const instructor = asRecord(item.instructor);
      const reserved = pickNumber(item.totalReservedMET, item.totalReservedUSD);
      const earned = pickNumber(item.totalEarnedMET, item.totalEarnedUSD, 1);
      const progress = Math.min(100, Math.round((reserved / earned) * 100));

      return {
        id: pickId(item) || pickString(item.instructorId) || `queue-${index}`,
        label: pickString(instructor.fullName, instructor.name) || "مدرّس",
        progress: progress || 50,
        daysRemaining: `${formatMet(reserved)} محتجزة`,
        barClass: "bg-[#f5a524]",
      };
    });
}

export function mapFinancialBottomMetrics(
  payments: Array<Record<string, unknown>>,
  stats: Record<string, unknown>,
): FinancialBottomMetrics {
  const topCourses = asArray<Record<string, unknown>>(stats.topCourses);
  const finance = asRecord(stats.finance);
  const totalIncome = pickNumber(finance.totalIncomeMET, finance.totalIncome);

  const invoices = payments.reduce(
    (sum, item) => sum + asArray(item.courses).length,
    topCourses.length,
  );

  return {
    invoices: String(invoices),
    totalPayments: totalIncome.toLocaleString("en-US"),
    revenueGrowthNote: "توزيع الدخل حسب المقررات الأعلى أداءً",
    revenueGrowthChart: topCourses.slice(0, 6).map((course, index) => {
      const id = pickId(course) || `course-chart-${index}`;
      const title = pickString(course.title, course.name) || `م${index + 1}`;

      return {
        id,
        month: title.length > 10 ? `${title.slice(0, 10)}…` : title,
        value: pickNumber(course.totalIncome, course.enrolledCount, 1),
        tone: index % 2 === 0 ? "orange" : "yellow",
      };
    }),
  };
}

export interface AdminMetTransactionEntry {
  id: string;
  amount: string;
  date: string;
  description: string;
  tone: "success" | "warning";
}

export function mapStudentMetTransactions(
  raw: Record<string, unknown>,
): AdminMetTransactionEntry[] {
  const transactions = asArray<Record<string, unknown>>(raw.metTransactions);

  return transactions.map((item, index) => {
    const amount = pickNumber(item.amount);
    const type = pickString(item.type).toLowerCase();

    return {
      id: pickId(item) || `met-${index}`,
      amount: `${amount > 0 ? "+" : ""}${amount} MET`,
      date: formatRelativeTime(pickString(item.createdAt, item.date)),
      description: pickString(item.description) || "عملية MET",
      tone: type === "credit" || amount > 0 ? "success" : "warning",
    };
  });
}
