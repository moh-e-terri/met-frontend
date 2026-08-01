import { apiClient, type ApiEnvelope } from "@/core/api/client";
import {
  asArray,
  asRecord,
  pickAuthUserId,
  pickId,
  pickNumber,
  pickString,
  resolveMediaUrl,
} from "@/core/api/utils";

export interface CourseEnrollee {
  /** Auth user id — for chat and profile routes */
  id: string;
  /** Student profile document id when available */
  profileId?: string;
  name: string;
  firstName?: string;
  secondName?: string;
  familyName?: string;
  email?: string;
  avatar: string;
  university?: string;
  progress: number;
  enrolledAt?: string;
  status?: string;
}

function cleanPart(value: unknown): string {
  const text = pickString(value);
  if (!text || /^(undefined|null|n\/a)$/i.test(text)) return "";
  return text;
}

function personName(raw: Record<string, unknown>): string {
  const built = [raw.firstName, raw.secondName, raw.middleName, raw.familyName, raw.lastName]
    .map(cleanPart)
    .filter(Boolean)
    .join(" ");
  const full = pickString(raw.fullName, raw.name)
    .split(/\s+/)
    .map(cleanPart)
    .filter(Boolean)
    .join(" ");
  return built || full || pickString(raw.email) || "طالب";
}

export function mapCourseEnrollees(raw: unknown): CourseEnrollee[] {
  const data = asRecord(raw);
  const items = asArray<Record<string, unknown>>(
    data.students ?? data.items ?? data.data ?? (Array.isArray(raw) ? raw : []),
  );

  return items.flatMap((item) => {
    const student = asRecord(item.studentId ?? item.student ?? item);
    const userIdRaw = student.userId ?? student.user;
    const user = typeof userIdRaw === "string" ? {} : asRecord(userIdRaw || student);
    // Chat / messaging must use auth User `_id`, not Student profile `_id`.
    const id =
      pickAuthUserId(student, item) ||
      pickId(user) ||
      pickId(student) ||
      pickId(item) ||
      pickString(item.enrollmentId);
    if (!id) return [];

    const display = { ...student, ...user };
    const avatar =
      resolveMediaUrl(
        pickString(user.profileImage, user.avatar, user.image, student.avatar),
      ) || "/images/student/avatar-student-default.svg";

    const profileId = pickId(student) || undefined;

    return [
      {
        id,
        profileId: profileId && profileId !== id ? profileId : undefined,
        name: personName(display),
        firstName: cleanPart(display.firstName) || undefined,
        secondName: cleanPart(display.secondName) || undefined,
        familyName: cleanPart(display.familyName ?? display.lastName) || undefined,
        email: pickString(user.email, student.email) || undefined,
        avatar,
        university: pickString(
          asRecord(student.universityId).name,
          student.universityName,
          item.university,
        ) || undefined,
        progress: pickNumber(item.progress, student.progress, item.progressPercent),
        enrolledAt: pickString(item.enrolledAt, item.createdAt) || undefined,
        status: pickString(item.status) || undefined,
      },
    ];
  });
}

/** Admin-only course students list */
export async function fetchAdminCourseStudents(
  courseId: string,
): Promise<CourseEnrollee[]> {
  const response = await apiClient.get<ApiEnvelope<unknown>>(
    `/admin/courses/${courseId}/students`,
  );
  return mapCourseEnrollees(response.data.data ?? response.data);
}

/** Instructor-assigned course students */
export async function fetchInstructorCourseStudents(
  courseId: string,
): Promise<CourseEnrollee[]> {
  const response = await apiClient.get<ApiEnvelope<unknown>>(
    `/instructor/courses/${courseId}/students`,
  );
  return mapCourseEnrollees(response.data.data ?? response.data);
}

export const courseEnrolleeQueryKeys = {
  admin: (courseId: string) => ["admin", "courses", courseId, "students"] as const,
  instructor: (courseId: string) =>
    ["instructor", "courses", courseId, "students"] as const,
};
