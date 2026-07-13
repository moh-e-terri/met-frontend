import { apiClient, type ApiEnvelope } from "@/core/api/client";
import { mapAdminStats, type AdminStatCard } from "./mappers";

export async function fetchAdminStats(): Promise<AdminStatCard[]> {
  const response = await apiClient.get<ApiEnvelope<unknown>>("/admin/stats");
  return mapAdminStats(response.data.data);
}
