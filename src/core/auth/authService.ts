import { apiClient, type ApiEnvelope } from "@/core/api/client";
import { asRecord, pickString } from "@/core/api/utils";
import type { AuthSession, AuthSignUpPayload, UserRole } from "./types";

const TOKEN_KEY = "met_auth_token";
const SESSION_KEY = "met_auth_session";

type ApiRole = UserRole | "instructor";

interface ApiUser {
  _id?: string;
  id?: string;
  email?: string;
  role?: ApiRole;
  firstName?: string;
  secondName?: string;
  middleName?: string;
  familyName?: string;
  lastName?: string;
  name?: string;
  fullName?: string;
}

interface AuthResponseData {
  accessToken?: string;
  token?: string;
  user?: ApiUser;
  university?: {
    id?: string;
    _id?: string;
    name?: string;
  };
}

function normalizeRole(role?: ApiRole): UserRole {
  if (role === "admin" || role === "teacher" || role === "student") return role;
  if (role === "instructor") return "teacher";
  return "student";
}

function normalizeSession(data: AuthResponseData | ApiUser): AuthSession {
  const user = "user" in data && data.user ? data.user : (data as ApiUser);
  const token = "accessToken" in data ? data.accessToken || data.token : undefined;
  const role = normalizeRole(user.role);
  const name =
    user.name ||
    user.fullName ||
    [user.firstName, user.secondName || user.middleName, user.familyName || user.lastName]
      .filter(Boolean)
      .join(" ")
      .trim() ||
    user.email ||
    "مستخدم";

  return {
    userId: user._id || user.id || "",
    role,
    email: user.email || "",
    name: role === "teacher" && !name.startsWith("د.") ? `د. ${name}` : name,
    token,
  };
}

function enrichStudentSession(
  session: AuthSession,
  data?: AuthResponseData,
  universityId?: string,
): AuthSession {
  if (session.role !== "student") return session;

  const university = asRecord(data?.university);

  return {
    ...session,
    universityId: pickString(university.id, university._id, session.universityId, universityId),
    universityName: pickString(university.name, session.universityName),
    metBalance: session.metBalance ?? 250,
  };
}

function persistSession(session: AuthSession) {
  if (session.token) {
    localStorage.setItem(TOKEN_KEY, session.token);
    localStorage.setItem("token", session.token);
  }
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function getSession(): AuthSession | null {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
}

export async function signIn(email: string, password: string): Promise<AuthSession> {
  const response = await apiClient.post<ApiEnvelope<AuthResponseData>>("/auth/login", {
    email: email.trim(),
    password,
  });
  const session = enrichStudentSession(normalizeSession(response.data.data), response.data.data);
  persistSession(session);
  return session;
}

export async function signUp(payload: AuthSignUpPayload): Promise<AuthSession> {
  const response = await apiClient.post<ApiEnvelope<AuthResponseData>>("/auth/register", {
    firstName: payload.firstName,
    secondName: payload.middleName || payload.firstName,
    familyName: payload.lastName,
    email: payload.email.trim().toLowerCase(),
    password: payload.password,
    confirmPassword: payload.confirmPassword,
    universityId: payload.universityId,
  });

  const registerData = response.data.data;
  let session = normalizeSession(registerData);

  if (!session.token) {
    session = await signIn(payload.email, payload.password);
  }

  session = enrichStudentSession(session, registerData, payload.universityId);
  persistSession(session);
  return session;
}

export async function refreshCurrentUser(): Promise<AuthSession | null> {
  const token = localStorage.getItem(TOKEN_KEY) || localStorage.getItem("token");
  const existingSession = getSession();
  if (!token) return existingSession;

  const response = await apiClient.get<ApiEnvelope<ApiUser | { user: ApiUser }>>("/auth/me");
  const rawData = response.data.data;
  const session = enrichStudentSession(
    { ...normalizeSession("user" in rawData ? rawData.user : rawData), token },
    undefined,
    existingSession?.universityId,
  );
  const nextSession = {
    ...session,
    universityName: session.universityName || existingSession?.universityName,
    metBalance: session.metBalance ?? existingSession?.metBalance,
  };
  persistSession(nextSession);
  return nextSession;
}

export async function signOut() {
  try {
    await apiClient.post("/auth/logout");
  } catch {
    // Ignore logout failures; local session is cleared below.
  } finally {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem("token");
    localStorage.removeItem(SESSION_KEY);
  }
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export async function changePassword(payload: ChangePasswordPayload): Promise<void> {
  const response = await apiClient.post<ApiEnvelope<unknown>>("/auth/change-password", {
    currentPassword: payload.currentPassword,
    newPassword: payload.newPassword,
    confirmNewPassword: payload.confirmNewPassword,
  });

  if (response.data.status === "fail") {
    throw new Error(response.data.message || "تعذر تغيير كلمة المرور");
  }
}
