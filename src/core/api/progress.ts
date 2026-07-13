import { apiClient, type ApiEnvelope } from "./client";

export async function markLessonWatched(courseId: string, lessonId: string) {
  const response = await apiClient.patch<ApiEnvelope<unknown>>(
    `/progress/courses/${courseId}/lessons/${lessonId}`,
  );
  return response.data;
}
