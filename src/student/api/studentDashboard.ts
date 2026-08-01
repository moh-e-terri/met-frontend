import { apiClient, type ApiEnvelope } from "@/core/api/client";
import { fillMissingUniversityNames } from "@/core/api/courseUniversity";
import { mapProgressOverview, mapStudentDashboard } from "./mappers";
import type { StudentDashboardData } from "./types";

export async function fetchStudentDashboard(): Promise<StudentDashboardData> {
  const response = await apiClient.get<ApiEnvelope<unknown>>("/student/dashboard");
  const dashboard = mapStudentDashboard(response.data.data);
  const continueLearning = await fillMissingUniversityNames(dashboard.continueLearning);

  if (continueLearning.length > 0) {
    return { ...dashboard, continueLearning };
  }

  try {
    const progressResponse =
      await apiClient.get<ApiEnvelope<unknown>>("/progress/overview");
    const courses = await fillMissingUniversityNames(
      mapProgressOverview(progressResponse.data.data),
    );

    if (courses.length) {
      return { ...dashboard, continueLearning: courses.slice(0, 6) };
    }
  } catch {
    // Keep dashboard data even if progress endpoint is unavailable.
  }

  return { ...dashboard, continueLearning };
}
