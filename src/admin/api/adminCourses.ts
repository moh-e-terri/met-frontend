import { apiClient, type ApiEnvelope } from "@/core/api/client";
import { fillMissingUniversityNames } from "@/core/api/courseUniversity";
import { buildPaginatedResult, type PaginatedResult } from "@/core/api/pagination";
import { asRecord, pickId } from "@/core/api/utils";
import { mapAdminCatalogCourses } from "./mappers";
import type { AdminCatalogCourse } from "../modules/courses/data/mockAdminCourses";

export interface CreateAdminCoursePayload {
  title: string;
  description?: string;
  instructorId?: string;
  allowedUniversities: string[];
  metCost?: number;
  instructorPercentage?: number;
  reservedPercentage?: number;
  level?: "beginner" | "intermediate" | "advanced";
  thumbnail?: string;
}

export type UpdateAdminCoursePayload = CreateAdminCoursePayload;

export interface FetchAdminCoursesParams {
  page?: number;
  limit?: number;
}

export async function fetchAdminCourses(
  params: FetchAdminCoursesParams = {},
): Promise<PaginatedResult<AdminCatalogCourse>> {
  const page = params.page ?? 1;
  const limit = params.limit ?? 10;
  const response = await apiClient.get<ApiEnvelope<unknown>>("/admin/courses", {
    params: { page, limit },
  });
  const body = response.data.data ?? response.data;
  const mapped = mapAdminCatalogCourses(body);
  const withIds = mapped.map((course) => ({
    ...course,
    university: course.university === "—" ? undefined : course.university,
    universityId: course.universityIds?.[0],
  }));
  const resolved = await fillMissingUniversityNames(withIds);
  const items = resolved.map((course) => ({
    ...course,
    university: course.university || "—",
  }));

  return buildPaginatedResult(items, response.data, page, limit);
}

export async function createAdminCourse(payload: CreateAdminCoursePayload) {
  const response = await apiClient.post<ApiEnvelope<unknown>>("/admin/courses", payload);
  return response.data;
}

export async function deleteAdminCourse(courseId: string) {
  const response = await apiClient.delete<ApiEnvelope<unknown>>(
    `/admin/courses/${courseId}`,
  );
  return response.data;
}

/**
 * Backend OpenAPI currently documents only GET/POST for admin courses.
 * DELETE works. PATCH/PUT are missing — we recreate when the course has no enrollments.
 */
export async function updateAdminCourse(
  courseId: string,
  payload: UpdateAdminCoursePayload,
  options: { enrolledCount?: number } = {},
) {
  try {
    const response = await apiClient.patch<ApiEnvelope<unknown>>(
      `/admin/courses/${courseId}`,
      payload,
    );
    return response.data;
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    const missingRoute =
      message.includes("غير موجود") ||
      message.toLowerCase().includes("not found") ||
      message.includes("404");

    if (!missingRoute) throw error;

    if ((options.enrolledCount ?? 0) > 0) {
      throw new Error(
        "الخادم لا يدعم تعديل المقررات التي لديها طلاب مسجّلون بعد. يلزم إضافة PATCH /admin/courses/:id من الـ Backend.",
      );
    }

    const created = await createAdminCourse(payload);
    const createdCourse = asRecord(asRecord(created.data).course);
    const newId = pickId(createdCourse);

    try {
      await deleteAdminCourse(courseId);
    } catch {
      if (newId) {
        try {
          await deleteAdminCourse(newId);
        } catch {
          /* best-effort rollback */
        }
      }
      throw new Error("تعذر استبدال المقرر بعد إنشائه. لم يُحذف المقرر القديم.");
    }

    return created;
  }
}
