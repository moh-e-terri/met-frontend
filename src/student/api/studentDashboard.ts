import { apiClient, type ApiEnvelope } from "@/core/api/client";
import { mapProgressOverview, mapStudentDashboard } from "./mappers";
import type { StudentDashboardData } from "./types";

export async function fetchStudentDashboard(): Promise<StudentDashboardData> {
  const response = await apiClient.get<ApiEnvelope<unknown>>("/student/dashboard");
  const dashboard = mapStudentDashboard(response.data.data);

  if (dashboard.continueLearning.length > 0) {
    return dashboard;
  }

  try {
    const progressResponse =
      await apiClient.get<ApiEnvelope<unknown>>("/progress/overview");
    const courses = mapProgressOverview(progressResponse.data.data);

    if (courses.length) {
      return { ...dashboard, continueLearning: courses.slice(0, 6) };
    }
  } catch {
    // Keep dashboard data even if progress endpoint is unavailable.
  }

  return dashboard;
}
