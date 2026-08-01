import { apiClient, type ApiEnvelope } from "@/core/api/client";
import { fillMissingUniversityNames } from "@/core/api/courseUniversity";
import { mapInstructorDashboard } from "./mappers";
import type { InstructorDashboardData } from "./types";

export async function fetchInstructorDashboard(): Promise<InstructorDashboardData> {
  const response = await apiClient.get<ApiEnvelope<unknown>>("/instructor/dashboard");
  const mapped = mapInstructorDashboard(response.data.data);
  return {
    ...mapped,
    courses: await fillMissingUniversityNames(mapped.courses),
  };
}
