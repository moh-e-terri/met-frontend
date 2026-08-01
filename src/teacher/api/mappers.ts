import { TEACHER_DEFAULT_AVATAR } from "@/teacher/constants/assets";
import {
  asArray,
  asRecord,
  extractApiList,
  pickAuthUserId,
  pickId,
  pickNestedUser,
  pickNumber,
  pickString,
  resolveMediaUrl,
} from "@/core/api/utils";
import type {
  CourseStudent,
  InstructorDashboardData,
  InstructorFinanceData,
  TeacherActivityItem,
  TeacherCourseItem,
  TeacherEarningsSummary,
  TeacherFinanceChartPoint,
  TeacherFinanceTransaction,
  TeacherNotificationItem,
  TeacherProfile,
  TeacherStatItem,
  TeacherTransactionStatus,
} from "./types";

const COURSE_IMAGES = [
  "/images/student/course-js.svg",
  "/images/student/course-data.svg",
  "/images/student/course-web.svg",
];

function formatCompactCount(value: number): string {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  }
  return String(value);
}

function formatCurrency(value: number, currency = "USD"): string {
  if (currency === "MET") return `${value} MET`;
  return `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatRelativeTime(value?: string): string {
  if (!value) return "منذ قليل";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "الآن";
  if (minutes < 60) return `منذ ${minutes} دقيقة`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `منذ ${hours} ساعة`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `منذ ${days} يوم`;
  return date.toLocaleDateString("ar-SA");
}

function flattenCourse(raw: Record<string, unknown>): Record<string, unknown> {
  const course = asRecord(raw.course);
  if (pickId(course)) {
    return {
      ...course,
      studentsCount: raw.studentsCount ?? course.studentsCount,
      lessonsCount: raw.lessonsCount ?? course.lessonsCount,
      progress: raw.progress ?? course.progress,
    };
  }
  return raw;
}

function mapProfile(data: Record<string, unknown>): TeacherProfile {
  const instructor = asRecord(data.instructor ?? data.teacher ?? data.profile ?? data.user);

  return {
    title: pickString(instructor.title, instructor.specialization, instructor.expertise),
    experience: pickString(instructor.experience, instructor.yearsOfExperience)
      ? `${pickString(instructor.experience, instructor.yearsOfExperience)}`
      : instructor.years
        ? `${pickNumber(instructor.years)} سنوات خبرة`
        : undefined,
    email: pickString(instructor.email, data.email),
    subtitle: pickString(instructor.subtitle, instructor.bio, instructor.headline),
  };
}

function mapStats(data: Record<string, unknown>): TeacherStatItem[] {
  const stats = asRecord(data.stats ?? data.statistics ?? data.summary ?? data);
  const courses = pickNumber(stats.courses, stats.totalCourses, stats.activeCourses, data.totalCourses);
  const students = pickNumber(stats.students, stats.totalStudents, stats.enrolledStudents);
  const views = pickNumber(stats.views, stats.totalViews, stats.watchCount);
  const pending = pickNumber(
    stats.pendingBalance,
    stats.pending,
    stats.reserved,
    asRecord(data.earnings).pending,
  );

  return [
    {
      label: "الدورات الحالية",
      value: formatCompactCount(courses),
      icon: "/images/student/icon-book.svg",
      iconBg: "bg-[#fff7ed]",
      iconColor: "text-[#f5a524]",
    },
    {
      label: "إجمالي الطلاب",
      value: formatCompactCount(students),
      icon: "/images/student/icon-groups.svg",
      iconBg: "bg-[#ecfdf5]",
      iconColor: "text-[#14b8a6]",
    },
    {
      label: "المشاهدات",
      value: formatCompactCount(views),
      icon: "/images/student/icon-eye.svg",
      iconBg: "bg-[#eff6ff]",
      iconColor: "text-[#3b82f6]",
    },
    {
      label: "الرصيد المعلق",
      value: formatCurrency(pending),
      icon: "/images/student/icon-wallet.svg",
      iconBg: "bg-[#fff7ed]",
      iconColor: "text-[#f5a524]",
    },
  ];
}

function resolveCourseUniversity(course: Record<string, unknown>): {
  university?: string;
  universityId?: string;
} {
  const allowedUniversities = asArray(course.allowedUniversities);
  const firstAllowed = allowedUniversities[0];
  const firstAllowedRecord =
    typeof firstAllowed === "object" && firstAllowed ? asRecord(firstAllowed) : {};

  const universityRecord = asRecord(
    course.university ??
      (typeof course.universityId === "object" && course.universityId
        ? course.universityId
        : null) ??
      firstAllowedRecord,
  );

  const university = pickString(
    universityRecord.name,
    universityRecord.nameAr,
    universityRecord.nameEn,
    course.universityName,
    pickString(firstAllowedRecord.name, firstAllowedRecord.nameEn),
    typeof course.university === "string" ? course.university : "",
  );

  const universityId =
    pickId(universityRecord) ||
    pickId(firstAllowedRecord) ||
    (typeof course.universityId === "string" ? course.universityId : "") ||
    (typeof firstAllowed === "string" ? firstAllowed : "") ||
    undefined;

  return {
    university: university || undefined,
    universityId: universityId || undefined,
  };
}

function mapCourses(data: Record<string, unknown>): TeacherCourseItem[] {
  const courses = asArray<Record<string, unknown>>(
    data.courses ?? data.myCourses ?? data.activeCourses ?? data.items,
  );

  return courses
    .map(flattenCourse)
    .map((course, index) => {
      const id = pickId(course);
      const title = pickString(course.title, course.name);
      if (!id || !title) return null;

      const students = pickNumber(course.studentsCount, course.students, course.enrolledCount);
      const lessons = pickNumber(course.lessonsCount, course.totalLessons, course.lessons);
      const { university, universityId } = resolveCourseUniversity(course);

      const mapped: TeacherCourseItem = {
        id,
        title,
        image:
          pickString(course.thumbnail, course.image, course.coverImage) ||
          COURSE_IMAGES[index % COURSE_IMAGES.length],
        students: students ? formatCompactCount(students) : "0",
        lessons: lessons ? String(lessons) : "0",
      };
      if (university) mapped.university = university;
      if (universityId) mapped.universityId = universityId;
      return mapped;
    })
    .filter((course): course is TeacherCourseItem => course !== null);
}

function mapActivities(data: Record<string, unknown>): TeacherActivityItem[] {
  const activities = asArray<Record<string, unknown>>(
    data.activities ?? data.recentActivity ?? data.recentActivities ?? data.activity,
  );

  return activities.map((item, index) => ({
    id: pickId(item) || `activity-${index}`,
    text: pickString(item.text, item.message, item.description, item.title) || "نشاط جديد",
    time: formatRelativeTime(pickString(item.createdAt, item.time, item.date)),
    icon: "/images/teacher/icon-user-join.svg",
    iconBg: "bg-[#fff7ed]",
    iconColor: "text-[#f5a524]",
  }));
}

function mapNotifications(data: Record<string, unknown>): TeacherNotificationItem[] {
  const notifications = asArray<Record<string, unknown>>(
    data.notifications ?? data.adminNotifications ?? data.alerts,
  );

  return notifications.map((item, index) => ({
    id: pickId(item) || `notification-${index}`,
    text: pickString(item.text, item.message, item.title) || "تنبيه إداري",
    icon: "/images/student/icon-info.svg",
    iconBg: "bg-[#ecfdf5]",
    iconColor: "text-[#14b8a6]",
  }));
}

function mapEarningsSummary(data: Record<string, unknown>): TeacherEarningsSummary {
  const earnings = asRecord(data.earnings ?? data.finance ?? data.summary ?? data);
  const total = pickNumber(earnings.total, earnings.totalEarnings, earnings.earned);
  const available = pickNumber(earnings.available, earnings.availableBalance, earnings.withdrawable);
  const pending = pickNumber(earnings.pending, earnings.pendingBalance, earnings.reserved);
  const newSubs = pickNumber(
    earnings.newSubscribers,
    earnings.newEnrollments,
    earnings.recentEnrollments,
  );

  const progress =
    total > 0 ? Math.min(100, Math.round(((total - pending) / total) * 100)) : 0;

  return {
    total: formatCurrency(total),
    progress,
    availableBalance: formatCurrency(available),
    newSubscribers: newSubs > 0 ? `+${newSubs}` : "0",
  };
}

export function mapInstructorDashboard(raw: unknown): InstructorDashboardData {
  const data = asRecord(raw);

  return {
    profile: mapProfile(data),
    stats: mapStats(data),
    courses: mapCourses(data),
    activities: mapActivities(data),
    notifications: mapNotifications(data),
    earnings: mapEarningsSummary(data),
  };
}

function mapTransactionStatus(raw: string): TeacherTransactionStatus {
  const value = raw.toLowerCase();
  if (value.includes("pending") || value.includes("قيد")) return "pending";
  if (value.includes("fail") || value.includes("فشل")) return "failed";
  return "completed";
}

function mapFinanceTxType(raw: string): import("./types").TeacherFinanceTxType {
  const value = raw.toLowerCase();
  if (value.includes("cancel") || value.includes("إلغاء")) return "cancelled";
  if (value.includes("release") || value.includes("صرف")) return "released";
  if (value.includes("earn") || value.includes("دخل") || value.includes("تسجيل")) return "earned";
  return "unknown";
}

function mapFinanceTransactions(raw: unknown): TeacherFinanceTransaction[] {
  return asArray<Record<string, unknown>>(raw).map((item, index) => {
    const course = asRecord(item.course);
    const type = mapFinanceTxType(pickString(item.type, item.action, item.status));
    const amountValue = pickNumber(item.amount, item.value, item.earnings, item.amountMET);
    const signed =
      type === "cancelled" ? -Math.abs(amountValue) : Math.abs(amountValue);
    const status = mapTransactionStatus(
      type === "cancelled" ? "failed" : pickString(item.status, item.state) || "completed",
    );

    const subtitle =
      type === "released"
        ? pickString(item.note) || "تم صرف مستحقاتك"
        : type === "cancelled"
          ? pickString(item.note) || "تم إلغاء دخل تسجيل الطالب"
          : pickString(item.note, item.description) || "تسجيل طالب جديد";

    return {
      id: pickId(item) || pickString(item.reference, item.transactionId) || `#TR-${index + 1}`,
      date:
        formatRelativeTime(pickString(item.createdAt, item.date)) ||
        pickString(item.date) ||
        "—",
      course: pickString(course.title, course.name, item.courseTitle, item.title) || "—",
      subtitle,
      amount: `${signed >= 0 ? "+" : "-"}${Math.abs(signed).toLocaleString("en-US")} MET`,
      amountValue: signed,
      type,
      status,
    };
  });
}

function mapCourseBreakdown(raw: unknown): import("./types").TeacherCourseBreakdownItem[] {
  return asArray<Record<string, unknown>>(raw).map((item, index) => {
    const earned = pickNumber(item.earnedMET, item.earned);
    const reserved = pickNumber(item.reservedMET, item.reserved);
    const released = Math.max(
      pickNumber(item.releasedMET, item.released),
      earned - reserved,
      0,
    );
    return {
      courseId: pickString(item.courseId) || pickId(item) || `course-${index}`,
      title: pickString(item.title, item.name, item.courseTitle) || "مقرر",
      enrolledCount: pickNumber(item.enrolledCount, item.studentsCount, item.students),
      totalIncomeMET: pickNumber(item.totalIncomeMET, item.totalIncome, earned),
      earnedMET: earned,
      reservedMET: reserved,
      releasedMET: released,
    };
  });
}

function mapChartPoints(raw: unknown, fallback: TeacherFinanceChartPoint[]): TeacherFinanceChartPoint[] {
  const points = asArray<Record<string, unknown>>(raw);
  if (!points.length) return fallback;

  const mapped = points.map((item, index) => ({
    label: pickString(item.label, item.month, item.week, item.name) || `نقطة ${index + 1}`,
    value: pickNumber(item.value, item.amount, item.total, item.earnings),
    amount:
      pickString(item.amountLabel, item.formattedAmount) ||
      formatCurrency(pickNumber(item.amount, item.value)),
    active: Boolean(item.active ?? item.isCurrent),
  }));

  const max = Math.max(...mapped.map((item) => item.value), 1);
  return mapped.map((item) => ({
    ...item,
    value: Math.round((item.value / max) * 100) || item.value,
  }));
}

export function mapInstructorFinance(raw: unknown): InstructorFinanceData {
  const data = asRecord(raw);
  const summaryRaw = asRecord(data.summary ?? data.totals ?? data);
  const totalEarnedMET = pickNumber(
    summaryRaw.totalEarnedMET,
    summaryRaw.totalEarnings,
    summaryRaw.total,
    summaryRaw.earned,
    data.totalEarnings,
  );
  const totalEarnedUSD = pickNumber(summaryRaw.totalEarnedUSD, summaryRaw.totalUSD);
  const reservedMET = pickNumber(
    summaryRaw.reservedMET,
    summaryRaw.reserved,
    summaryRaw.pending,
    summaryRaw.pendingBalance,
  );
  const reservedUSD = pickNumber(summaryRaw.reservedUSD);
  const releasedMET = pickNumber(
    summaryRaw.releasedMET,
    summaryRaw.released,
    summaryRaw.withdrawn,
    summaryRaw.totalWithdrawn,
    summaryRaw.paidOut,
  );
  const releasedUSD = pickNumber(summaryRaw.releasedUSD);
  const growth = pickNumber(summaryRaw.growthPercent, summaryRaw.changePercent, summaryRaw.trend);

  const withdrawal = asRecord(data.withdrawalMethod ?? data.payoutMethod ?? data.paymentMethod);
  const chart = asRecord(data.chart);
  const courseBreakdown = mapCourseBreakdown(data.courseBreakdown ?? data.courses);
  const transactions = mapFinanceTransactions(
    data.recentTransactions ?? data.transactions ?? data.payments ?? data.items,
  );

  return {
    summary: {
      totalEarnedMET,
      totalEarnedUSD,
      reservedMET,
      reservedUSD,
      releasedMET,
      releasedUSD,
    },
    courseBreakdown,
    stats: [
      {
        label: "إجمالي الربح",
        value: `${totalEarnedMET.toLocaleString("en-US")} MET`,
        badge: totalEarnedUSD ? `${totalEarnedUSD.toLocaleString("en-US")} USD` : growth ? `+${growth}%` : undefined,
        icon: "/images/student/icon-wallet.svg",
        iconBg: "bg-[#eff6ff]",
        iconColor: "text-[#3b82f6]",
        badgeClassName: "bg-[#ecfdf5] text-[#14b8a6]",
      },
      {
        label: "المبلغ المحجوز",
        value: `${reservedMET.toLocaleString("en-US")} MET`,
        badge: reservedUSD ? `${reservedUSD.toLocaleString("en-US")} USD` : undefined,
        icon: "/images/student/icon-lock.svg",
        iconBg: "bg-[#fff7ed]",
        iconColor: "text-[#f5a524]",
        badgeClassName: "bg-[#fff7ed] text-[#f5a524]",
      },
      {
        label: "تم صرفه",
        value: `${releasedMET.toLocaleString("en-US")} MET`,
        badge: releasedUSD ? `${releasedUSD.toLocaleString("en-US")} USD` : undefined,
        icon: "/images/teacher/icon-money.svg",
        iconBg: "bg-[#ecfdf5]",
        iconColor: "text-[#14b8a6]",
        badgeClassName: "bg-[#ecfdf5] text-[#14b8a6]",
      },
    ],
    availableWithdrawal: formatCurrency(reservedMET, "MET"),
    withdrawalMethod: pickString(withdrawal.type, withdrawal.provider)
      ? {
          type: pickString(withdrawal.type, withdrawal.provider, "PayPal Business"),
          email: pickString(withdrawal.email, withdrawal.account, withdrawal.maskedEmail) || "—",
        }
      : undefined,
    transactions,
    chartMonthly: mapChartPoints(data.monthlyEarnings ?? data.monthlyChart ?? chart.monthly, []),
    chartWeekly: mapChartPoints(data.weeklyEarnings ?? data.weeklyChart ?? chart.weekly, []),
    alerts: asArray<Record<string, unknown>>(data.alerts ?? data.notifications).map(
      (item, index) => ({
        id: pickId(item) || `alert-${index}`,
        text: pickString(item.text, item.message) || "تنبيه مالي",
        icon: "/images/student/icon-info.svg",
        iconBg: "bg-[#fff7ed]",
        iconColor: "text-[#f5a524]",
      }),
    ),
  };
}

export function mapCourseStudents(raw: unknown): CourseStudent[] {
  const students = extractApiList(raw, [
    "students",
    "enrollments",
    "enrolledStudents",
    "items",
    "data",
  ]);

  return students
    .map((item) => {
      const studentRef = asRecord(item.student ?? item.studentId);
      const nested = pickNestedUser(studentRef);
      // Nested auth user fields win over Student profile (profile `_id` must not overwrite User `_id`).
      const user =
        pickId(nested) || pickString(nested.email, nested.firstName, nested.fullName)
          ? { ...studentRef, ...nested }
          : { ...pickNestedUser(item), ...studentRef, ...nested };

      const university = asRecord(user.university ?? studentRef.university);
      // Chat APIs require the auth User `_id`, not the Student profile `_id`.
      const id =
        pickAuthUserId(studentRef, item, nested, user) ||
        pickId(nested) ||
        pickId(studentRef) ||
        pickId(item);
      const name = pickString(
        user.name,
        user.fullName,
        [user.firstName, user.secondName, user.middleName, user.familyName, user.lastName]
          .map((part) => pickString(part))
          .filter(Boolean)
          .join(" "),
        user.email,
        studentRef.email,
      );
      if (!id || !name) return null;

      const profileId = pickId(studentRef) || undefined;
      const student: CourseStudent = {
        id,
        profileId: profileId && profileId !== id ? profileId : undefined,
        name,
        firstName: pickString(user.firstName, studentRef.firstName) || undefined,
        secondName: pickString(user.secondName, studentRef.secondName) || undefined,
        familyName:
          pickString(user.familyName, user.lastName, studentRef.familyName) || undefined,
        avatar:
          resolveMediaUrl(
            pickString(
              user.profileImage,
              user.avatar,
              user.image,
              user.photo,
              studentRef.profileImage,
              studentRef.avatar,
              studentRef.image,
            ),
          ) || TEACHER_DEFAULT_AVATAR,
        email: pickString(user.email, studentRef.email) || undefined,
        progress: pickNumber(
          item.progress,
          item.progressPercent,
          item.completion,
          user.progress,
          studentRef.progress,
        ),
        isRecognized: Boolean(
          item.isRecognized ??
            item.recognized ??
            item.knownBefore ??
            item.previouslyKnown ??
            item.wasKnown,
        ),
        university:
          pickString(university.name, user.universityName, studentRef.universityName) ||
          undefined,
        enrolledAt: pickString(item.enrolledAt, item.createdAt, item.enrollmentDate) || undefined,
      };

      return student;
    })
    .filter((student): student is CourseStudent => student !== null);
}
