import { apiClient, type ApiEnvelope } from "@/core/api/client";
import {
  asArray,
  asRecord,
  extractApiList,
  pickId,
  pickNestedUser,
  pickNumber,
  pickString,
} from "@/core/api/utils";

export type CourseLevel = "beginner" | "intermediate" | "advanced";

export interface AvailableCourse {
  id: string;
  title: string;
  description: string;
  image: string;
  instructor?: string;
  category?: string;
  level?: CourseLevel;
  metCost: number;
  canAfford: boolean;
  isEnrolled: boolean;
  lessonsCount?: number;
  studentsCount?: number;
}

export interface AvailableCoursesResult {
  courses: AvailableCourse[];
  myMetPoints: number;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface EnrollCourseResult {
  metDeducted?: number;
  metRemaining?: number;
  message?: string;
}

export interface DropCourseResult {
  metRefunded?: number;
  metRemaining?: number;
  message?: string;
}

const COURSE_IMAGES = [
  "/images/student/course-js.svg",
  "/images/student/course-data.svg",
  "/images/student/course-web.svg",
  "/images/programming.jpg",
  "/images/web.jpg",
  "/images/CyberSecurity.jpg",
];

const LEVEL_LABELS: Record<CourseLevel, string> = {
  beginner: "مبتدئ",
  intermediate: "متوسط",
  advanced: "متقدم",
};

export function getCourseLevelLabel(level?: CourseLevel): string {
  if (!level) return "عام";
  return LEVEL_LABELS[level] ?? level;
}

function mapInstructorName(raw: Record<string, unknown>): string | undefined {
  const instructor = asRecord(raw.instructor ?? raw.instructorId);
  const user = pickNestedUser(instructor);

  return (
    pickString(
      user.fullName,
      user.name,
      instructor.name,
      raw.instructorName,
      raw.teacherName,
    ) || undefined
  );
}

function mapAvailableCourse(raw: Record<string, unknown>, index: number): AvailableCourse | null {
  const id = pickId(raw);
  const title = pickString(raw.title, raw.name, raw.courseTitle);
  if (!id || !title) return null;

  const level = pickString(raw.level, raw.difficulty) as CourseLevel | "";

  return {
    id,
    title,
    description:
      pickString(raw.description, raw.summary, raw.shortDescription) ||
      "اكتشف محتوى تعليمي متكامل يساعدك على تطوير مهاراتك.",
    image:
      pickString(raw.thumbnail, raw.image, raw.coverImage, raw.banner) ||
      COURSE_IMAGES[index % COURSE_IMAGES.length],
    instructor: mapInstructorName(raw),
    category: pickString(raw.category, raw.track, raw.field),
    level: level === "beginner" || level === "intermediate" || level === "advanced" ? level : undefined,
    metCost: pickNumber(raw.metCost, raw.price, raw.cost, raw.metPoints),
    canAfford: raw.canAfford !== false,
    isEnrolled: Boolean(raw.isEnrolled ?? raw.enrolled ?? raw.isRegistered),
    lessonsCount:
      pickNumber(raw.lessonsCount, raw.totalLessons, raw.lessonsTotal) ||
      asArray(raw.lessons).length ||
      undefined,
    studentsCount: pickNumber(raw.studentsCount, raw.enrolledCount, raw.students) || undefined,
  };
}

function mapPagination(raw: Record<string, unknown>, fallbackLimit: number) {
  const pagination = asRecord(raw.pagination ?? raw.meta ?? raw);

  return {
    total: pickNumber(pagination.total, pagination.totalItems, pagination.count),
    page: pickNumber(pagination.page, pagination.currentPage, 1) || 1,
    limit: pickNumber(pagination.limit, pagination.perPage, fallbackLimit) || fallbackLimit,
    totalPages: pickNumber(pagination.totalPages, pagination.pages, 1) || 1,
    hasNextPage: Boolean(pagination.hasNextPage ?? pagination.hasNext),
    hasPrevPage: Boolean(pagination.hasPrevPage ?? pagination.hasPrev),
    myMetPoints: pickNumber(pagination.myMetPoints, pagination.metBalance, pagination.metPoints),
  };
}

export interface FetchAvailableCoursesParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  level?: CourseLevel;
}

export async function fetchAvailableCourses(
  params: FetchAvailableCoursesParams = {},
): Promise<AvailableCoursesResult> {
  const limit = params.limit ?? 12;
  const response = await apiClient.get<ApiEnvelope<unknown>>("/student/courses/available", {
    params: {
      page: params.page ?? 1,
      limit,
      search: params.search || undefined,
      category: params.category || undefined,
      level: params.level || undefined,
    },
  });

  const envelope = asRecord(response.data);
  const payload = envelope.data ?? envelope;
  const pagination = mapPagination(envelope, limit);
  const paginationRecord = asRecord(envelope.pagination);
  const courses = extractApiList(payload, ["courses", "availableCourses", "items"])
    .map(mapAvailableCourse)
    .filter((course): course is AvailableCourse => course !== null);

  return {
    courses,
    myMetPoints: pickNumber(
      paginationRecord.myMetPoints,
      asRecord(payload).myMetPoints,
      pagination.myMetPoints,
    ),
    pagination: {
      total: pagination.total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: pagination.totalPages,
      hasNextPage: pagination.hasNextPage,
      hasPrevPage: pagination.hasPrevPage,
    },
  };
}

export async function enrollInCourse(courseId: string): Promise<EnrollCourseResult> {
  const response = await apiClient.post<ApiEnvelope<Record<string, unknown>>>(
    `/student/courses/${courseId}/enroll`,
  );
  const data = asRecord(response.data.data);

  return {
    metDeducted: pickNumber(data.metDeducted, data.deducted, data.cost) || undefined,
    metRemaining: pickNumber(data.metRemaining, data.remaining, data.balance) || undefined,
    message: pickString(response.data.message, data.message) || undefined,
  };
}

export async function dropCourse(courseId: string): Promise<DropCourseResult> {
  const response = await apiClient.delete<ApiEnvelope<Record<string, unknown>>>(
    `/student/courses/${courseId}/drop`,
  );
  const data = asRecord(response.data.data);

  return {
    metRefunded: pickNumber(data.metRefunded, data.refunded, data.refundAmount) || undefined,
    metRemaining: pickNumber(data.metRemaining, data.remaining, data.balance) || undefined,
    message: pickString(response.data.message, data.message) || undefined,
  };
}

export const availableCoursesQueryKeys = {
  list: (params: FetchAvailableCoursesParams, userId?: string) =>
    ["student", "courses", "available", userId ?? "guest", params] as const,
};

export const PENDING_ENROLLMENT_STORAGE_KEY = "met_pending_enrollment";

export function savePendingEnrollment(course: AvailableCourse) {
  sessionStorage.setItem(PENDING_ENROLLMENT_STORAGE_KEY, JSON.stringify(course));
}

export function loadPendingEnrollment(courseId: string): AvailableCourse | null {
  try {
    const raw = sessionStorage.getItem(PENDING_ENROLLMENT_STORAGE_KEY);
    if (!raw) return null;
    const course = JSON.parse(raw) as AvailableCourse;
    return course.id === courseId ? course : null;
  } catch {
    return null;
  }
}

export function clearPendingEnrollment() {
  sessionStorage.removeItem(PENDING_ENROLLMENT_STORAGE_KEY);
}
