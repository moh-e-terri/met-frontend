import { apiClient, type ApiEnvelope } from "@/core/api/client";
import { fileToDataUrl } from "@/core/api/profile";
import { buildPaginatedResult, type PaginatedResult } from "@/core/api/pagination";
import { asRecord, pickId } from "@/core/api/utils";
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

export interface UpdateAdminStudentPayload {
  firstName?: string;
  secondName?: string;
  familyName?: string;
  email?: string;
  universityId?: string;
  /** data URL or absolute URL — same pattern as self profile APIs */
  profileImage?: string | null;
}

function mapStudentUpdateResponse(body: unknown): AdminStudent | null {
  const data = asRecord(body);
  const studentRaw = data.student ?? data;
  if (Array.isArray(studentRaw)) {
    return mapAdminStudents(studentRaw)[0] ?? null;
  }
  const record = asRecord(studentRaw);
  if (!pickId(record) && !pickId(asRecord(record.userId))) {
    return mapAdminStudents(body)[0] ?? null;
  }
  return mapAdminStudents({ students: [record] })[0] ?? null;
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

/** Resolve a student by profile id or auth user id from the admin list API. */
export async function fetchAdminStudentById(
  studentId: string,
): Promise<AdminStudent | null> {
  const first = await fetchAdminStudents({ page: 1, limit: 100 });
  const found = first.items.find(
    (student) => student.id === studentId || student.userId === studentId,
  );
  if (found) return found;

  const totalPages = first.pagination.totalPages || 1;
  for (let page = 2; page <= Math.min(totalPages, 10); page += 1) {
    const next = await fetchAdminStudents({ page, limit: 100 });
    const match = next.items.find(
      (student) => student.id === studentId || student.userId === studentId,
    );
    if (match) return match;
  }
  return null;
}

/**
 * PATCH /admin/students/:id — updates name, email, university, profileImage.
 * `:id` must be the Student profile document id (not auth user id).
 */
export async function updateAdminStudent(
  studentId: string,
  payload: UpdateAdminStudentPayload,
): Promise<AdminStudent | null> {
  const response = await apiClient.patch<ApiEnvelope<unknown>>(
    `/admin/students/${studentId}`,
    payload,
  );
  const body = response.data.data ?? response.data;
  return mapStudentUpdateResponse(body);
}

/** Updates student avatar via PATCH profileImage (data URL). */
export async function updateAdminStudentAvatar(
  studentId: string,
  file: File,
): Promise<string | null> {
  const profileImage = await fileToDataUrl(file);
  const updated = await updateAdminStudent(studentId, { profileImage });
  return updated?.avatar ?? profileImage;
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
