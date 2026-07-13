import { apiClient, type ApiEnvelope } from "@/core/api/client";
import { mapInstructorDashboard } from "./mappers";
import type { InstructorDashboardData } from "./types";

export async function fetchInstructorDashboard(): Promise<InstructorDashboardData> {
  const response = await apiClient.get<ApiEnvelope<unknown>>("/instructor/dashboard");
  return mapInstructorDashboard(response.data.data);
}
