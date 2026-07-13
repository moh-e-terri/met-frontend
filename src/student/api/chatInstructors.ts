import { COMMUNITY_USER_AVATARS } from "@/student/constants/assets";
import { apiClient, type ApiEnvelope } from "@/core/api/client";
import { asArray, asRecord, pickId, pickString } from "@/core/api/utils";
import type { ChatThread } from "@/core/api/chat";

export interface ChatInstructor {
  id: string;
  name: string;
  avatar: string;
  role?: string;
  courseTitle?: string;
}

function mapInstructor(raw: Record<string, unknown>, index: number): ChatInstructor | null {
  const id = pickId(raw);
  const name = pickString(
    raw.name,
    raw.fullName,
    pickString(raw.firstName) && pickString(raw.lastName)
      ? `${pickString(raw.firstName)} ${pickString(raw.lastName)}`
      : "",
  );
  if (!id || !name) return null;

  const course = asRecord(raw.course ?? asArray(raw.courses)[0]);

  return {
    id,
    name,
    avatar: pickString(raw.avatar, raw.image, raw.photo) || COMMUNITY_USER_AVATARS[index % COMMUNITY_USER_AVATARS.length],
    role: pickString(raw.role, raw.title, raw.specialization) || "مدرّس",
    courseTitle: pickString(course.title, course.name, raw.courseTitle),
  };
}

export function mapInstructorToChatThread(
  instructor: ChatInstructor,
): ChatThread {
  return {
    id: instructor.id,
    name: instructor.name,
    preview: instructor.courseTitle
      ? `مدرّس: ${instructor.courseTitle}`
      : "تواصل مع مدرّسك",
    time: "متاح",
    avatar: instructor.avatar,
    online: true,
    role: instructor.role,
    participantId: instructor.id,
    sharedCourses: instructor.courseTitle
      ? [{ title: instructor.courseTitle, status: "active" }]
      : [],
  };
}

export async function fetchChatInstructors(): Promise<ChatInstructor[]> {
  const response = await apiClient.get<ApiEnvelope<unknown>>("/student/chat/instructors");
  const data = asRecord(response.data.data);

  return asArray<Record<string, unknown>>(data.instructors ?? data.items ?? data)
    .map(mapInstructor)
    .filter((instructor): instructor is ChatInstructor => instructor !== null);
}

export const chatInstructorsQueryKeys = {
  all: ["student", "chat", "instructors"] as const,
};
