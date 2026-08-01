import { apiClient, ApiError, type ApiEnvelope } from "@/core/api/client";
import {
  asRecord,
  pickId,
  pickString,
  resolveMediaUrl,
} from "@/core/api/utils";
import type { UserRole } from "@/core/auth/types";

export interface OwnProfile {
  userId: string;
  role: UserRole;
  email: string;
  firstName: string;
  secondName: string;
  familyName: string;
  fullName: string;
  avatar?: string;
  phoneNumber?: string;
  bio?: string;
  paypalAccount?: string;
  dateOfBirth?: string;
  universityId?: string;
  universityName?: string;
  /** True when this role can persist profile edits via API */
  canEdit: boolean;
  /** True when avatar can be persisted via API */
  canEditAvatar: boolean;
}

export interface UpdateOwnProfilePayload {
  firstName?: string;
  secondName?: string;
  familyName?: string;
  phoneNumber?: string;
  bio?: string;
  paypalAccount?: string;
  dateOfBirth?: string;
  /** Absolute URL or data:image/... base64 */
  profileImage?: string | null;
}

function mapRole(raw?: string): UserRole {
  if (raw === "admin") return "admin";
  if (raw === "teacher" || raw === "instructor") return "teacher";
  return "student";
}

function personParts(raw: Record<string, unknown>) {
  return {
    firstName: pickString(raw.firstName),
    secondName: pickString(raw.secondName, raw.middleName),
    familyName: pickString(raw.familyName, raw.lastName),
    fullName:
      pickString(raw.fullName, raw.name) ||
      [raw.firstName, raw.secondName || raw.middleName, raw.familyName || raw.lastName]
        .map((part) => pickString(part))
        .filter(Boolean)
        .join(" "),
    email: pickString(raw.email),
    avatar:
      resolveMediaUrl(
        pickString(raw.profileImage, raw.avatar, raw.image, raw.photo),
      ) || undefined,
  };
}

function buildUpdateBody(payload: UpdateOwnProfilePayload, options?: { teacherExtras?: boolean }) {
  const body: Record<string, unknown> = {};
  if (payload.firstName != null) body.firstName = payload.firstName;
  if (payload.secondName != null) body.secondName = payload.secondName;
  if (payload.familyName != null) body.familyName = payload.familyName;
  if (payload.profileImage !== undefined) body.profileImage = payload.profileImage;

  if (options?.teacherExtras) {
    if (payload.phoneNumber != null) body.phoneNumber = payload.phoneNumber || null;
    if (payload.bio != null) body.bio = payload.bio;
    if (payload.paypalAccount != null) body.paypalAccount = payload.paypalAccount || null;
    if (payload.dateOfBirth != null) body.dateOfBirth = payload.dateOfBirth || null;
  }

  return body;
}

export async function fetchOwnProfile(role: UserRole): Promise<OwnProfile> {
  if (role === "teacher") {
    const response = await apiClient.get<ApiEnvelope<unknown>>("/instructor/profile");
    const data = asRecord(response.data.data ?? response.data);
    const user = asRecord(data.user);
    const instructor = asRecord(data.instructor);
    const parts = personParts({ ...instructor, ...user });

    return {
      userId: pickId(user) || pickId(instructor),
      role: "teacher",
      email: parts.email,
      firstName: parts.firstName,
      secondName: parts.secondName,
      familyName: parts.familyName,
      fullName: parts.fullName || parts.email || "مدرّس",
      avatar: parts.avatar,
      phoneNumber: pickString(instructor.phoneNumber, instructor.phone) || undefined,
      bio: pickString(instructor.bio) || undefined,
      paypalAccount: pickString(instructor.paypalAccount) || undefined,
      dateOfBirth: pickString(instructor.dateOfBirth)?.slice(0, 10) || undefined,
      canEdit: true,
      canEditAvatar: true,
    };
  }

  if (role === "student") {
    const response = await apiClient.get<ApiEnvelope<unknown>>("/student/profile");
    const data = asRecord(response.data.data ?? response.data);
    const student = asRecord(data.student ?? data);
    const user = asRecord(student.userId ?? student.user);
    const university = asRecord(student.universityId ?? student.university);
    const parts = personParts({ ...student, ...user });

    return {
      userId: pickId(user) || pickId(student),
      role: "student",
      email: parts.email,
      firstName: parts.firstName,
      secondName: parts.secondName,
      familyName: parts.familyName,
      fullName: parts.fullName || parts.email || "طالب",
      avatar: parts.avatar,
      universityId: pickId(university) || undefined,
      universityName: pickString(university.name) || undefined,
      canEdit: true,
      canEditAvatar: true,
    };
  }

  const response = await apiClient.get<ApiEnvelope<unknown>>("/admin/profile").catch(async () => {
    return apiClient.get<ApiEnvelope<unknown>>("/auth/me");
  });
  const data = asRecord(response.data.data ?? response.data);
  const user = asRecord(data.user ?? data);
  const parts = personParts(user);
  return {
    userId: pickId(user),
    role: mapRole(pickString(user.role)),
    email: parts.email,
    firstName: parts.firstName,
    secondName: parts.secondName,
    familyName: parts.familyName,
    fullName: parts.fullName || parts.email || "مدير",
    avatar: parts.avatar,
    canEdit: true,
    canEditAvatar: true,
  };
}

export async function updateOwnProfile(
  role: UserRole,
  payload: UpdateOwnProfilePayload,
): Promise<OwnProfile> {
  if (role === "teacher") {
    await apiClient.put<ApiEnvelope<unknown>>(
      "/instructor/profile",
      buildUpdateBody(payload, { teacherExtras: true }),
    );
    return fetchOwnProfile("teacher");
  }

  if (role === "student") {
    await apiClient.put<ApiEnvelope<unknown>>(
      "/student/profile",
      buildUpdateBody(payload),
    );
    return fetchOwnProfile("student");
  }

  if (role === "admin") {
    await apiClient.put<ApiEnvelope<unknown>>(
      "/admin/profile",
      buildUpdateBody(payload),
    );
    return fetchOwnProfile("admin");
  }

  throw new ApiError("دور غير مدعوم لتعديل الملف الشخصي.", { status: 400 });
}

export async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("اختر ملف صورة صالحاً"));
      return;
    }
    if (file.size > 1.5 * 1024 * 1024) {
      reject(new Error("حجم الصورة يجب أن يكون أقل من 1.5 ميجابايت"));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("تعذر قراءة الصورة"));
    reader.readAsDataURL(file);
  });
}
