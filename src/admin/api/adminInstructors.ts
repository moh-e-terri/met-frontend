import { apiClient, type ApiEnvelope } from "@/core/api/client";
import { buildPaginatedResult, type PaginatedResult } from "@/core/api/pagination";
import { mapAdminInstructor, mapAdminInstructors } from "./mappers";
import type { AdminLecturer } from "../modules/lecturers/data/mockAdminLecturers";

export interface FetchAdminInstructorsParams {
  search?: string;
  page?: number;
  limit?: number;
}

export interface CreateInstructorPayload {
  firstName: string;
  secondName: string;
  familyName: string;
  email: string;
  password: string;
  nationalId: string;
  paypalAccount?: string;
}

export interface UpdateAdminInstructorPayload {
  firstName?: string;
  secondName?: string;
  familyName?: string;
  email?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  paypalAccount?: string;
  bio?: string;
  profileImage?: string | null;
}

export async function fetchAdminInstructors(
  params: FetchAdminInstructorsParams = {},
): Promise<PaginatedResult<AdminLecturer>> {
  const page = params.page ?? 1;
  const limit = params.limit ?? 10;
  const response = await apiClient.get<ApiEnvelope<unknown>>("/admin/instructors", {
    params: {
      page,
      limit,
      search: params.search || undefined,
    },
  });
  const body = response.data.data ?? response.data;
  const items = mapAdminInstructors(body);

  return buildPaginatedResult(items, response.data, page, limit);
}

export async function fetchAdminInstructorById(
  instructorId: string,
): Promise<AdminLecturer | null> {
  const response = await apiClient.get<ApiEnvelope<unknown>>(
    `/admin/instructors/${instructorId}`,
  );
  const body = response.data.data ?? response.data;
  return mapAdminInstructor(body);
}

/** PATCH /admin/instructors/:id */
export async function updateAdminInstructor(
  instructorId: string,
  payload: UpdateAdminInstructorPayload,
): Promise<AdminLecturer | null> {
  const response = await apiClient.patch<ApiEnvelope<unknown>>(
    `/admin/instructors/${instructorId}`,
    payload,
  );
  const body = response.data.data ?? response.data;
  return mapAdminInstructor(body);
}

export async function createAdminInstructor(
  payload: CreateInstructorPayload,
): Promise<AdminLecturer | null> {
  const response = await apiClient.post<ApiEnvelope<unknown>>(
    "/admin/instructors",
    payload,
  );
  const body = response.data.data ?? response.data;
  return mapAdminInstructor(body);
}
