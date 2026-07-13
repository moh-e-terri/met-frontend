import { apiClient, type ApiEnvelope } from "./client";
import { mapApiLessons, type CreateLessonPayload } from "./lessons.types";
import { asRecord, pickId } from "./utils";

export type { ApiLesson, CreateLessonPayload } from "./lessons.types";
export { formatLessonDuration, lessonQueryKeys } from "./lessons.types";

export async function fetchCourseLessons(courseId: string) {
  const response = await apiClient.get<ApiEnvelope<unknown>>(
    `/courses/${courseId}/lessons`,
  );
  return mapApiLessons(response.data.data);
}

export async function createCourseLesson(
  courseId: string,
  payload: CreateLessonPayload,
) {
  const formData = new FormData();
  formData.append("title", payload.title);
  formData.append("video", payload.videoFile);

  if (payload.duration != null) {
    formData.append("duration", String(payload.duration));
  }
  if (payload.order != null) {
    formData.append("order", String(payload.order));
  }
  if (payload.isPublished != null) {
    formData.append("isPublished", String(payload.isPublished));
  }

  const response = await apiClient.post<ApiEnvelope<unknown>>(
    `/courses/${courseId}/lessons`,
    formData,
  );
  const lessons = mapApiLessons(response.data.data);
  if (lessons.length === 1) return lessons[0];
  if (lessons.length > 0) return lessons[lessons.length - 1];

  const lesson = asRecord(asRecord(response.data.data).lesson);
  if (pickId(lesson)) {
    const mapped = mapApiLessons(lesson);
    if (mapped[0]) return mapped[0];
  }

  return {
    id: pickId(lesson) || "",
    title: payload.title,
    duration: payload.duration,
    order: payload.order ?? 0,
    isPublished: payload.isPublished ?? true,
  };
}
