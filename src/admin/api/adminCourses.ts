import { apiClient, type ApiEnvelope } from "@/core/api/client";
import { buildPaginatedResult, type PaginatedResult } from "@/core/api/pagination";
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
}

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
  const items = mapAdminCatalogCourses(body);

  return buildPaginatedResult(items, response.data, page, limit);
}

export async function createAdminCourse(payload: CreateAdminCoursePayload) {
  const response = await apiClient.post<ApiEnvelope<unknown>>("/admin/courses", payload);
  return response.data;
}
