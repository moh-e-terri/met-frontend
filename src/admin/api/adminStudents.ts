import { apiClient, type ApiEnvelope } from "@/core/api/client";
import { buildPaginatedResult, type PaginatedResult } from "@/core/api/pagination";
import { mapAdminStudents } from "./mappers";
import type { AdminStudent } from "../modules/students/data/mockAdminStudents";

export interface AdminStudentsFilters {
  email?: string;
  name?: string;
  universityId?: string;
  page?: number;
  limit?: number;
}

export interface AddStudentMetPayload {
  amount: number;
  description?: string;
}

export async function fetchAdminStudents(
  filters: AdminStudentsFilters = {},
): Promise<PaginatedResult<AdminStudent>> {
  const page = filters.page ?? 1;
  const limit = filters.limit ?? 10;
  const response = await apiClient.get<ApiEnvelope<unknown>>("/admin/students", {
    params: {
      email: filters.email || undefined,
      name: filters.name || undefined,
      universityId: filters.universityId || undefined,
      page,
      limit,
    },
  });
  const body = response.data.data ?? response.data;
  const items = mapAdminStudents(body);

  return buildPaginatedResult(items, response.data, page, limit);
}

export async function addStudentMetPoints(
  studentId: string,
  payload: AddStudentMetPayload,
) {
  const response = await apiClient.patch<ApiEnvelope<unknown>>(
    `/admin/students/${studentId}/met`,
    payload,
  );
  return response.data;
}
