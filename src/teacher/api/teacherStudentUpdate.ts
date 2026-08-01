import { apiClient, ApiError, type ApiEnvelope } from "@/core/api/client";
import { fileToDataUrl } from "@/core/api/profile";
import { asRecord, pickId, pickString, resolveMediaUrl } from "@/core/api/utils";

export interface UpdateTeacherStudentPayload {
  firstName?: string;
  secondName?: string;
  familyName?: string;
  profileImage?: string | null;
}

export interface TeacherStudentUpdateResult {
  profileId: string;
  userId?: string;
  firstName?: string;
  secondName?: string;
  familyName?: string;
  avatar?: string;
}

/**
 * Updates a student visible to the instructor.
 * Tries documented-style paths; backend may expose one of them.
 * Prefer Student profile `_id` when available.
 */
export async function updateTeacherStudent(
  studentProfileId: string,
  payload: UpdateTeacherStudentPayload,
): Promise<TeacherStudentUpdateResult> {
  if (!studentProfileId) {
    throw new ApiError("معرّف ملف الطالب مطلوب", { status: 400 });
  }

  const candidates = [
    { method: "patch" as const, path: `/instructor/students/${studentProfileId}` },
    { method: "put" as const, path: `/instructor/students/${studentProfileId}` },
    { method: "patch" as const, path: `/instructor/students/${studentProfileId}/profile` },
    { method: "put" as const, path: `/instructor/students/${studentProfileId}/profile` },
  ];

  let lastError: unknown;
  for (const candidate of candidates) {
    try {
      const response = await apiClient.request<ApiEnvelope<unknown>>({
        method: candidate.method,
        url: candidate.path,
        data: payload,
      });
      const body = asRecord(response.data.data ?? response.data);
      const student = asRecord(body.student ?? body);
      const user = asRecord(student.userId ?? student.user);
      return {
        profileId: pickId(student) || studentProfileId,
        userId: pickId(user) || undefined,
        firstName: pickString(user.firstName, student.firstName) || undefined,
        secondName: pickString(user.secondName, student.secondName) || undefined,
        familyName: pickString(user.familyName, student.familyName) || undefined,
        avatar:
          resolveMediaUrl(
            pickString(user.profileImage, student.profileImage, user.avatar),
          ) || undefined,
      };
    } catch (error) {
      lastError = error;
      if (error instanceof ApiError && error.status && ![404, 405].includes(error.status)) {
        throw error;
      }
    }
  }

  throw lastError instanceof ApiError
    ? lastError
    : new ApiError(
        "الخادم لا يوفّر بعد endpoint لتعديل بيانات الطالب من حساب المدرّس. يلزم إضافة PATCH /instructor/students/:id.",
        { status: 404 },
      );
}

export async function updateTeacherStudentAvatar(
  studentProfileId: string,
  file: File,
): Promise<string | null> {
  const profileImage = await fileToDataUrl(file);
  const updated = await updateTeacherStudent(studentProfileId, { profileImage });
  return updated.avatar ?? profileImage;
}
