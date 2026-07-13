import { apiClient, type ApiEnvelope } from "@/core/api/client";
import { mapCourseStudents } from "./mappers";
import type { CourseStudent } from "./types";

export async function fetchCourseStudents(courseId: string): Promise<CourseStudent[]> {
  const response = await apiClient.get<ApiEnvelope<unknown>>(
    `/instructor/courses/${courseId}/students`,
  );
  return mapCourseStudents(response.data.data);
}

export const courseStudentsQueryKeys = {
  list: (courseId: string) => ["instructor", "courses", courseId, "students"] as const,
};
