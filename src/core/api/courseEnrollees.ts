import { apiClient, type ApiEnvelope } from "@/core/api/client";
import {
  asArray,
  asRecord,
  extractApiList,
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
  const items = extractApiList(raw, [
    "students",
    "enrollments",
    "enrolledStudents",
    "items",
    "docs",
    "results",
    "data",
  ]);

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
        pickString(
          user.profileImage,
          user.avatar,
          user.image,
          student.profileImage,
          student.avatar,
          item.avatar,
        ),
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

function enrolleeKey(student: CourseEnrollee): string {
  return student.profileId || student.id;
}

function mergeEnrollees(
  primary: CourseEnrollee[],
  supplement: CourseEnrollee[],
): CourseEnrollee[] {
  const byKey = new Map<string, CourseEnrollee>();
  for (const student of supplement) {
    byKey.set(enrolleeKey(student), student);
    byKey.set(student.id, student);
  }
  for (const student of primary) {
    // Prefer endpoint rows (may include progress) but keep supplement-only students.
    byKey.set(enrolleeKey(student), student);
    byKey.set(student.id, student);
  }

  const seen = new Set<string>();
  const merged: CourseEnrollee[] = [];
  for (const student of [...primary, ...supplement]) {
    const key = enrolleeKey(student);
    if (seen.has(key) || seen.has(student.id)) continue;
    const resolved = byKey.get(key) || byKey.get(student.id) || student;
    seen.add(enrolleeKey(resolved));
    seen.add(resolved.id);
    merged.push(resolved);
  }
  return merged;
}

/**
 * Some backends under-report `/courses/:id/students` while student profiles
 * still list the course under `enrolledCourses`. Merge both sources for admin.
 */
async function fetchEnrolleesFromAdminStudentDirectory(
  courseId: string,
): Promise<CourseEnrollee[]> {
  const collected: CourseEnrollee[] = [];
  const maxPages = 10;

  for (let page = 1; page <= maxPages; page += 1) {
    const response = await apiClient.get<ApiEnvelope<unknown>>("/admin/students", {
      params: { page, limit: 100 },
    });
    const body = response.data.data ?? response.data;
    const items = extractApiList(body, ["students", "users", "items", "docs"]);

    for (const item of items) {
      const student = asRecord(item);
      const userIdRaw = student.userId ?? student.user;
      const user = typeof userIdRaw === "string" ? {} : asRecord(userIdRaw);
      const enrolled = asArray(student.enrolledCourses);
      const matched = enrolled.some((entry) => {
        if (typeof entry === "string") return entry === courseId;
        return pickId(asRecord(entry)) === courseId;
      });
      if (!matched) continue;

      const id =
        pickAuthUserId(student) ||
        pickId(user) ||
        (typeof userIdRaw === "string" ? userIdRaw : "") ||
        pickId(student);
      if (!id) continue;

      const display = { ...student, ...user };
      const courseEntry = enrolled.find((entry) => {
        if (typeof entry === "string") return entry === courseId;
        return pickId(asRecord(entry)) === courseId;
      });
      const courseRecord =
        typeof courseEntry === "string" ? {} : asRecord(courseEntry);

      collected.push({
        id,
        profileId: pickId(student) !== id ? pickId(student) || undefined : undefined,
        name: personName(display),
        firstName: cleanPart(display.firstName) || undefined,
        secondName: cleanPart(display.secondName) || undefined,
        familyName: cleanPart(display.familyName ?? display.lastName) || undefined,
        email: pickString(user.email, student.email) || undefined,
        avatar:
          resolveMediaUrl(
            pickString(user.profileImage, user.avatar, student.profileImage, student.avatar),
          ) || "/images/student/avatar-student-default.svg",
        university: pickString(
          asRecord(student.universityId).name,
          student.universityName,
        ) || undefined,
        progress: pickNumber(courseRecord.progress, courseRecord.progressPercent),
        enrolledAt: pickString(student.enrolledAt, student.createdAt) || undefined,
      });
    }

    const totalPages = pickNumber(
      asRecord(asRecord(response.data).pagination).totalPages,
      asRecord(asRecord(body).pagination).totalPages,
      asRecord(asRecord(body).meta).totalPages,
    );
    if (totalPages && page >= totalPages) break;
    if (items.length < 100) break;
  }

  return collected;
}

/** Admin-only course students list */
export async function fetchAdminCourseStudents(
  courseId: string,
): Promise<CourseEnrollee[]> {
  const response = await apiClient.get<ApiEnvelope<unknown>>(
    `/admin/courses/${courseId}/students`,
  );
  const primary = mapCourseEnrollees(response.data.data ?? response.data);

  try {
    const supplement = await fetchEnrolleesFromAdminStudentDirectory(courseId);
    return mergeEnrollees(primary, supplement);
  } catch {
    return primary;
  }
}

function enrolleeFromPersonRecord(
  raw: Record<string, unknown>,
  fallbackProgress = 0,
): CourseEnrollee | null {
  const student = asRecord(raw.studentId ?? raw.student ?? raw);
  const userIdRaw = student.userId ?? student.user ?? raw.userId ?? raw.user;
  const user = typeof userIdRaw === "string" ? {} : asRecord(userIdRaw);
  const id =
    pickAuthUserId(student, raw, user) ||
    pickId(user) ||
    (typeof userIdRaw === "string" ? userIdRaw : "") ||
    pickId(student) ||
    pickId(raw);
  if (!id) return null;

  const display = { ...student, ...user };
  return {
    id,
    profileId: pickId(student) && pickId(student) !== id ? pickId(student) : undefined,
    name: personName(display),
    firstName: cleanPart(display.firstName) || undefined,
    secondName: cleanPart(display.secondName) || undefined,
    familyName: cleanPart(display.familyName ?? display.lastName) || undefined,
    email: pickString(user.email, student.email, raw.email) || undefined,
    avatar:
      resolveMediaUrl(
        pickString(
          user.profileImage,
          user.avatar,
          student.profileImage,
          student.avatar,
          raw.profileImage,
          raw.avatar,
        ),
      ) || "/images/student/avatar-student-default.svg",
    university: pickString(
      asRecord(student.universityId).name,
      student.universityName,
      raw.university,
    ) || undefined,
    progress: pickNumber(raw.progress, student.progress, fallbackProgress),
    enrolledAt: pickString(raw.enrolledAt, raw.submittedAt, raw.createdAt) || undefined,
  };
}

/**
 * Instructor `/students` often under-reports. Assignment submission bundles
 * usually include early + late + notSubmitted (= full roster).
 * Community authors and exam result lists are used as extra signals.
 */
async function fetchEnrolleesFromCourseActivity(
  courseId: string,
): Promise<CourseEnrollee[]> {
  const buckets: CourseEnrollee[][] = await Promise.all([
    fetchEnrolleesFromAssignmentSubmissions(courseId),
    fetchEnrolleesFromCommunityAuthors(courseId),
  ]);
  return buckets.reduce((acc, list) => mergeEnrollees(acc, list), [] as CourseEnrollee[]);
}

async function fetchEnrolleesFromAssignmentSubmissions(
  courseId: string,
): Promise<CourseEnrollee[]> {
  try {
    const assignmentsRes = await apiClient.get<ApiEnvelope<unknown>>(
      `/courses/${courseId}/assignments`,
    );
    const assignments = extractApiList(assignmentsRes.data.data ?? assignmentsRes.data, [
      "assignments",
      "items",
      "docs",
      "data",
    ]);
    if (!assignments.length) return [];

    const collected: CourseEnrollee[] = [];
    for (const assignment of assignments.slice(0, 3)) {
      const assignmentId = pickId(assignment);
      if (!assignmentId) continue;
      try {
        const response = await apiClient.get<ApiEnvelope<unknown>>(
          `/courses/${courseId}/assignments/${assignmentId}/submissions`,
        );
        const data = asRecord(response.data.data ?? response.data);
        const rows = [
          ...asArray<Record<string, unknown>>(data.early),
          ...asArray<Record<string, unknown>>(data.late),
          ...asArray<Record<string, unknown>>(data.notSubmitted),
          ...asArray<Record<string, unknown>>(data.submissions),
          ...asArray<Record<string, unknown>>(data.students),
        ];
        for (const row of rows) {
          const enrollee = enrolleeFromPersonRecord(row);
          if (enrollee) collected.push(enrollee);
        }
        if (collected.length) break;
      } catch {
        /* try next assignment */
      }
    }
    return collected;
  } catch {
    return [];
  }
}

async function fetchEnrolleesFromCommunityAuthors(
  courseId: string,
): Promise<CourseEnrollee[]> {
  try {
    const response = await apiClient.get<ApiEnvelope<unknown>>(
      `/community/courses/${courseId}/posts`,
      { params: { limit: 50, page: 1 } },
    );
    const posts = extractApiList(response.data.data ?? response.data, [
      "posts",
      "items",
      "docs",
      "data",
    ]);
    const collected: CourseEnrollee[] = [];
    for (const post of posts) {
      const authorRaw = post.authorId ?? post.author ?? post.user ?? post.createdBy;
      if (typeof authorRaw === "string") {
        collected.push({
          id: authorRaw,
          name: "طالب",
          avatar: "/images/student/avatar-student-default.svg",
          progress: 0,
        });
        continue;
      }
      const author = asRecord(authorRaw);
      const role = pickString(author.role, post.role, author.userRole).toLowerCase();
      if (role.includes("instructor") || role.includes("teacher") || role.includes("admin")) {
        continue;
      }
      const enrollee = enrolleeFromPersonRecord(author);
      if (enrollee) collected.push(enrollee);
    }
    return collected;
  } catch {
    return [];
  }
}

/** Instructor-assigned course students */
export async function fetchInstructorCourseStudents(
  courseId: string,
): Promise<CourseEnrollee[]> {
  const response = await apiClient.get<ApiEnvelope<unknown>>(
    `/instructor/courses/${courseId}/students`,
  );
  const primary = mapCourseEnrollees(response.data.data ?? response.data);

  try {
    const fromActivity = await fetchEnrolleesFromCourseActivity(courseId);
    return mergeEnrollees(primary, fromActivity);
  } catch {
    return primary;
  }
}

export const courseEnrolleeQueryKeys = {
  admin: (courseId: string) => ["admin", "courses", courseId, "students"] as const,
  instructor: (courseId: string) =>
    ["instructor", "courses", courseId, "students"] as const,
};
