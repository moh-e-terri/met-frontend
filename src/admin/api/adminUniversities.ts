import { apiClient, type ApiEnvelope } from "@/core/api/client";
import { mapAdminUniversities, type AdminUniversityItem } from "./mappers";

export interface CreateUniversityPayload {
  name: string;
  nameEn?: string;
  city?: string;
}

export async function fetchAdminUniversities(params?: {
  page?: number;
  search?: string;
}): Promise<AdminUniversityItem[]> {
  const response = await apiClient.get<ApiEnvelope<unknown>>("/admin/universities", {
    params,
  });
  return mapAdminUniversities(response.data.data);
}

export async function createAdminUniversity(payload: CreateUniversityPayload) {
  const response = await apiClient.post<ApiEnvelope<unknown>>(
    "/admin/universities",
    payload,
  );
  return response.data;
}
