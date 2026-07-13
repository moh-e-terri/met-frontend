import { COMMUNITY_USER_AVATARS } from "@/student/constants/assets";
import {
  asArray,
  asRecord,
  extractApiList,
  pickId,
  pickNestedUser,
  pickNumber,
  pickString,
} from "@/core/api/utils";
import type { AdminCourseSummary } from "../modules/dashboard/data/mockAdminDashboard";
import type { AdminCatalogCourse, AdminCourseStatus } from "../modules/courses/data/mockAdminCourses";
import type { FinancialTransaction, TransactionStatus } from "../modules/financials/data/mockAdminFinancials";
import type { AdminLecturer, LecturerStatus } from "../modules/lecturers/data/mockAdminLecturers";
import type { AdminStudent } from "../modules/students/data/mockAdminStudents";
import { mapStudentMetTransactions } from "./adminInsights";

export interface AdminStatCard {
  label: string;
  value: string;
  trend: string;
  trendUp: boolean;
  icon: string;
  iconBg: string;
  iconColor: string;
}

function formatCount(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}k`;
  return String(value);
}

function formatCurrency(value: number, suffix = "ر.س"): string {
  return `${value.toLocaleString("ar-SA")} ${suffix}`;
}

function flattenPersonRecord(raw: Record<string, unknown>): Record<string, unknown> {
  const nested = pickNestedUser(raw);
  if (!pickId(nested) && !pickString(nested.email, nested.name, nested.firstName, nested.fullName)) {
    return raw;
  }

  const instructorId = pickId(raw);

  return {
    ...nested,
    ...raw,
    _id: instructorId || pickId(nested),
    id: instructorId || pickId(nested),
    fullName: pickString(raw.fullName, nested.fullName),
    email: pickString(raw.email, nested.email),
    firstName: pickString(raw.firstName, nested.firstName),
    secondName: pickString(raw.secondName, nested.secondName, nested.middleName),
    familyName: pickString(raw.familyName, nested.familyName, nested.lastName),
    avatar: pickString(raw.avatar, raw.image, raw.photo, nested.profileImage, nested.avatar, nested.image),
    bio: pickString(raw.bio, nested.bio),
    status: pickString(raw.status, nested.status, nested.isActive === false ? "inactive" : ""),
  };
}

function fullName(raw: Record<string, unknown>): string {
  const source = flattenPersonRecord(raw);

  return pickString(
    source.name,
    source.fullName,
    [source.firstName, source.secondName, source.middleName, source.familyName, source.lastName]
      .map((part) => pickString(part))
      .filter(Boolean)
      .join(" "),
    source.email,
  );
}

export function mapAdminStats(raw: unknown): AdminStatCard[] {
  const data = asRecord(raw);
  const courses = pickNumber(data.totalCourses, data.coursesCount, data.courses);
  const instructors = pickNumber(data.totalInstructors, data.instructorsCount, data.instructors);
  const students = pickNumber(data.totalStudents, data.studentsCount, data.students);
  const revenue = pickNumber(data.totalRevenue, data.revenue, data.platformRevenue);

  return [
    {
      label: "إجمالي المقررات",
      value: formatCount(courses),
      trend: pickString(data.coursesTrend, data.coursesGrowth) || "—",
      trendUp: !pickString(data.coursesTrend).startsWith("-"),
      icon: "/images/student/icon-book.svg",
      iconBg: "bg-[#eff6ff]",
      iconColor: "text-[#3b82f6]",
    },
    {
      label: "إجمالي المحاضرين",
      value: formatCount(instructors),
      trend: pickString(data.instructorsTrend, data.instructorsGrowth) || "—",
      trendUp: !pickString(data.instructorsTrend).startsWith("-"),
      icon: "/images/student/icon-active-user.svg",
      iconBg: "bg-[#ecfdf5]",
      iconColor: "text-[#14b8a6]",
    },
    {
      label: "إجمالي الطلاب",
      value: formatCount(students),
      trend: pickString(data.studentsTrend, data.studentsGrowth) || "—",
      trendUp: !pickString(data.studentsTrend).startsWith("-"),
      icon: "/images/student/icon-groups.svg",
      iconBg: "bg-[#fff7ed]",
      iconColor: "text-[#f5a524]",
    },
    {
      label: "إجمالي الإيرادات",
      value: revenue ? formatCurrency(revenue) : pickString(data.revenueLabel) || "—",
      trend: pickString(data.revenueTrend, data.revenueGrowth) || "—",
      trendUp: !pickString(data.revenueTrend).startsWith("-"),
      icon: "/images/student/icon-wallet.svg",
      iconBg: "bg-[#f5f3ff]",
      iconColor: "text-[#8b5cf6]",
    },
  ];
}

function mapCatalogStatus(value?: string, isPublished?: boolean): AdminCourseStatus {
  const status = (value || "").toLowerCase();
  if (status.includes("draft") || isPublished === false) return "draft";
  return "published";
}

function mapLecturerStatus(value?: string): LecturerStatus {
  const status = (value || "").toLowerCase();
  if (status.includes("pending") || status.includes("انتظار")) return "pending";
  if (status.includes("inactive") || status.includes("معطل")) return "inactive";
  return "active";
}

function mapPaymentStatus(value?: string): TransactionStatus {
  const status = (value || "").toLowerCase();
  if (status.includes("withheld") || status.includes("محتجز")) return "withheld";
  if (status.includes("complete") || status.includes("مكتمل") || status.includes("released")) {
    return "completed";
  }
  return "pending";
}

export function mapAdminCourseSummaries(raw: unknown): AdminCourseSummary[] {
  return mapAdminCatalogCourses(raw).slice(0, 5).map((course) => ({
    id: course.id,
    name: course.title,
    students: course.students,
    lecturer: course.lecturer,
    university: course.university,
    revenue: course.revenue,
    status: course.status === "draft" ? "pending" : "active",
  }));
}

export function mapAdminCatalogCourses(raw: unknown): AdminCatalogCourse[] {
  const data = asRecord(raw);
  const items = asArray<Record<string, unknown>>(
    data.courses ?? data.items ?? (Array.isArray(raw) ? raw : []),
  );

  return items
    .map((item, index) => {
      const id = pickId(item);
      const title = pickString(item.title, item.name);
      if (!id || !title) return null;

      const instructor = flattenPersonRecord({
        ...asRecord(item.instructor ?? item.lecturer),
        ...(typeof item.instructorId === "object" && item.instructorId
          ? asRecord(item.instructorId)
          : {}),
      });
      const university = asRecord(
        item.university ??
          (typeof item.universityId === "object" && item.universityId
            ? item.universityId
            : null) ??
          asArray(item.allowedUniversities)[0],
      );
      const studentsCount = pickNumber(item.studentsCount, item.enrolledCount, item.students);
      const revenue = pickNumber(item.revenue, item.totalRevenue, item.metCost);

      return {
        id,
        title,
        category: pickString(item.level, item.category, item.description) || "دورة",
        image: pickString(item.image, item.thumbnail) || "/images/programming.jpg",
        lecturer: fullName(instructor) || pickString(item.instructorName) || "محاضر",
        lecturerAvatar:
          pickString(instructor.avatar, instructor.image, instructor.photo) ||
          COMMUNITY_USER_AVATARS[index % COMMUNITY_USER_AVATARS.length],
        university:
          pickString(
            university.name,
            item.universityName,
            pickString(asRecord(asArray(item.allowedUniversities)[0]).name),
          ) || "—",
        revenue: revenue ? formatCurrency(revenue) : "—",
        students: studentsCount ? `${studentsCount} طالب` : "—",
        status: mapCatalogStatus(pickString(item.status), item.isPublished !== false),
      };
    })
    .filter((course): course is AdminCatalogCourse => course !== null);
}

function mapAdminInstructorItem(
  item: Record<string, unknown>,
  index: number,
): AdminLecturer | null {
  const source = flattenPersonRecord(item);
  const id = pickId(source);
  const name = fullName(source);
  if (!id || !name) return null;

  const earnings = pickNumber(
    source.earnings,
    source.totalEarnings,
    source.revenue,
    asRecord(source.finance).totalEarnings,
  );
  const available = pickNumber(
    source.availableBalance,
    source.balance,
    source.available,
    asRecord(source.finance).availableBalance,
  );
  const pending = pickNumber(
    source.pendingBalance,
    source.pending,
    asRecord(source.finance).pendingBalance,
  );

  return {
    id,
    name,
    specialization: pickString(source.specialization, source.title, source.role, source.bio) || "مدرّس",
    coursesCount:
      pickNumber(source.coursesCount, source.courses, source.totalCourses) ||
      asArray(source.assignedCourses).length,
    earnings: earnings ? `$${earnings.toLocaleString("en-US")}` : "—",
    status: mapLecturerStatus(pickString(source.status, source.accountStatus)),
    avatar:
      pickString(source.avatar, source.image, source.photo) ||
      COMMUNITY_USER_AVATARS[index % COMMUNITY_USER_AVATARS.length],
    title: pickString(source.title, source.specialization) || "مدرّس",
    joinedDate: pickString(source.createdAt, source.joinedAt, source.registeredAt) || "—",
    studentsCount: String(pickNumber(source.studentsCount, source.students) || 0),
    managedCourses: [],
    totalProfit: earnings ? `$${earnings.toLocaleString("en-US")}` : "—",
    availableBalance: available ? `$${available.toLocaleString("en-US")}` : "—",
    pendingBalance: pending ? `$${pending.toLocaleString("en-US")}` : "—",
  };
}

export function mapAdminInstructor(raw: unknown): AdminLecturer | null {
  const data = asRecord(raw);
  const user = asRecord(data.user);
  const instructor = asRecord(data.instructor);

  if (pickId(instructor) || pickId(user)) {
    return mapAdminInstructorItem(
      {
        ...instructor,
        userId: user,
      },
      0,
    );
  }

  const mapped = mapAdminInstructors(raw);
  if (mapped.length === 1) return mapped[0];

  const item = flattenPersonRecord(asRecord(raw));
  if (pickId(item) && fullName(item)) {
    return mapAdminInstructorItem(item, 0);
  }

  return null;
}

export function mapAdminInstructors(raw: unknown): AdminLecturer[] {
  const items = extractApiList(raw, ["instructors", "users", "lecturers", "teachers"]);

  return items
    .map((item, index) => mapAdminInstructorItem(item, index))
    .filter((lecturer): lecturer is AdminLecturer => lecturer !== null);
}

export function mapAdminStudents(raw: unknown): AdminStudent[] {
  const items = extractApiList(raw, ["students", "users"]);

  return items
    .map((item, index) => {
      const source = flattenPersonRecord(item);
      const id = pickId(source);
      const name = fullName(source);
      const email = pickString(source.email);
      if (!id || !name) return null;

      const university = asRecord(source.university ?? source.universityId);
      const metBalance = pickNumber(source.metBalance, source.metPoints, source.balance);
      const enrolled = asArray(source.enrolledCourses);
      const coursesCount =
        pickNumber(source.coursesCount, source.enrolledCoursesCount) || enrolled.length;

      return {
        id,
        name,
        email: email || "—",
        avatar:
          pickString(source.avatar, source.image) ||
          COMMUNITY_USER_AVATARS[index % COMMUNITY_USER_AVATARS.length],
        coursesCount: coursesCount || 0,
        totalPaid: metBalance ? `${metBalance} MET` : "—",
        paymentNote: metBalance ? "رصيد MET متاح" : "لا توجد بيانات دفع",
        paymentNoteTone: "neutral" as const,
        paymentStatus: "paid" as const,
        listStatus: "active" as const,
        degree: pickString(university.name, source.major, source.degree) || "طالب",
        yearTag: pickString(source.year, source.level) || "طالب",
        gpa: pickString(source.gpa) || "—",
        attendance: pickString(source.attendance) || "—",
        enrolledCourses: [],
        recentActivities: [],
        metTransactions: mapStudentMetTransactions(item),
      };
    })
    .filter((student) => student !== null) as AdminStudent[];
}

export interface AdminFinancePayment extends FinancialTransaction {
  instructorId?: string;
  releasableAmount?: number;
}

export function mapAdminFinancePayments(raw: unknown): AdminFinancePayment[] {
  const data = asRecord(raw);
  const items = asArray<Record<string, unknown>>(
    data.payments ?? data.items ?? data.instructorPayments ?? (Array.isArray(raw) ? raw : []),
  );

  const rows: AdminFinancePayment[] = [];

  for (const [index, item] of items.entries()) {
    const instructor = asRecord(item.instructor ?? item.lecturer);
    const instructorId = pickString(item.instructorId) || pickId(instructor) || undefined;
    const instructorName = fullName(instructor) || pickString(item.instructorName) || "مدرّس";
    const earned = pickNumber(item.totalEarnedMET, item.totalEarnedUSD, item.amount, item.totalAmount);
    const reserved = pickNumber(item.totalReservedMET, item.totalReservedUSD, item.reservedMET);
    const released = pickNumber(item.totalReleasedMET, item.totalReleasedUSD);
    const courses = asArray<Record<string, unknown>>(item.courses);

    if (courses.length > 0) {
      for (const [courseIndex, course] of courses.entries()) {
        const courseEarned = pickNumber(course.earnedMET, course.totalIncome, course.amount);
        rows.push({
          id: pickId(course) || pickString(course.courseId) || `payment-${index}-${courseIndex}`,
          instructorId,
          course: pickString(course.title, course.name) || "مقرر",
          student: instructorName,
          courseIcon: "/images/student/course-data.svg",
          amount: courseEarned ? `${courseEarned} MET` : "—",
          trainerShare: courseEarned ? String(courseEarned) : "—",
          platformShare: reserved ? String(reserved) : "—",
          status: mapPaymentStatus(
            courseEarned > 0 && reserved > 0 ? "withheld" : courseEarned > 0 ? "completed" : "pending",
          ),
          releasableAmount: Math.max(courseEarned - released, 0) || undefined,
        });
      }
      continue;
    }

    rows.push({
      id: pickId(item) || instructorId || `payment-${index}`,
      instructorId,
      course: "مستحقات المدرّس",
      student: instructorName,
      courseIcon: "/images/student/course-data.svg",
      amount: earned ? `${earned} MET` : "—",
      trainerShare: earned ? String(earned) : "—",
      platformShare: reserved ? String(reserved) : "—",
      status: mapPaymentStatus(
        earned > 0 && reserved > 0 ? "withheld" : earned > 0 ? "completed" : "pending",
      ),
      releasableAmount: Math.max(earned - released, reserved, 0) || undefined,
    });
  }

  return rows;
}

export interface AdminUniversityItem {
  id: string;
  name: string;
  nameEn?: string;
  city?: string;
}

export function mapAdminUniversities(raw: unknown): AdminUniversityItem[] {
  const data = asRecord(raw);
  const items = asArray<Record<string, unknown>>(
    data.universities ?? data.items ?? (Array.isArray(raw) ? raw : []),
  );

  return items
    .map((item) => {
      const id = pickId(item);
      const name = pickString(item.name, item.nameEn);
      if (!id || !name) return null;
      return {
        id,
        name,
        nameEn: pickString(item.nameEn) || undefined,
        city: pickString(item.city) || undefined,
      };
    })
    .filter((university) => university !== null) as AdminUniversityItem[];
}

export interface AdminInstructorOption {
  id: string;
  name: string;
}

export function mapInstructorOptions(instructors: AdminLecturer[]): AdminInstructorOption[] {
  return instructors.map((instructor) => ({
    id: instructor.id,
    name: instructor.name,
  }));
}
