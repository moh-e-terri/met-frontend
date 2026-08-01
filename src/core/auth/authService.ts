import { apiClient, isApiError, type ApiEnvelope } from "@/core/api/client";
import { asRecord, pickString, resolveMediaUrl } from "@/core/api/utils";
import {
  clearAuthToken,
  getAuthToken,
  getRefreshToken,
  onAuthTokenCleared,
  renewAccessToken,
  runWithUnauthorizedLogoutSuppressed,
  setAuthTokens,
} from "./tokenStorage";
import type { AuthSession, AuthSignUpPayload, UserRole } from "./types";

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
  profileImage?: string;
  avatar?: string;
}

interface AuthResponseData {
  accessToken?: string;
  refreshToken?: string;
  token?: string;
  user?: ApiUser;
  university?: {
    id?: string;
    _id?: string;
    name?: string;
  };
}

/** In-tab session only — never written as a full profile blob to shared storage. */
let memorySession: AuthSession | null = null;

onAuthTokenCleared(() => {
  memorySession = null;
});

function normalizeRole(role?: ApiRole): UserRole {
  if (role === "admin" || role === "teacher" || role === "student") return role;
  if (role === "instructor") return "teacher";
  return "student";
}

function normalizeSession(data: AuthResponseData | ApiUser): AuthSession {
  const user = "user" in data && data.user ? data.user : (data as ApiUser);
  const token =
    pickString(
      "accessToken" in data ? (data as AuthResponseData).accessToken : undefined,
      "token" in data ? (data as AuthResponseData).token : undefined,
    ) || undefined;
  const role = normalizeRole(user.role);
  const firstName = pickString(user.firstName) || undefined;
  const secondName = pickString(user.secondName, user.middleName) || undefined;
  const familyName = pickString(user.familyName, user.lastName) || undefined;
  const name =
    user.name ||
    user.fullName ||
    [firstName, secondName, familyName].filter(Boolean).join(" ").trim() ||
    user.email ||
    "مستخدم";

  return {
    userId: user._id || user.id || "",
    role,
    email: user.email || "",
    name: role === "teacher" && !name.startsWith("د.") ? `د. ${name}` : name,
    token,
    firstName,
    secondName,
    familyName,
    avatar:
      resolveMediaUrl(pickString(user.profileImage, user.avatar)) || undefined,
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

function rememberSession(session: AuthSession, refreshToken?: string | null) {
  memorySession = session;
  setAuthTokens({
    accessToken: session.token || null,
    refreshToken: refreshToken === undefined ? undefined : refreshToken,
  });
}

function extractMeUser(raw: unknown): ApiUser {
  const data = asRecord(raw);
  const nestedUser = asRecord(data.user);
  if (pickString(nestedUser.id, nestedUser._id, nestedUser.email, nestedUser.role)) {
    return nestedUser as ApiUser;
  }
  return data as ApiUser;
}

async function fetchCurrentUser(token: string): Promise<AuthSession> {
  const response = await apiClient.get<ApiEnvelope<ApiUser | { user: ApiUser } | null>>(
    "/auth/me",
  );
  const rawData = response.data.data ?? response.data;
  const session = enrichStudentSession(
    { ...normalizeSession(extractMeUser(rawData)), token },
    undefined,
    memorySession?.universityId,
  );
  return {
    ...session,
    universityName: session.universityName || memorySession?.universityName,
    metBalance: session.metBalance ?? memorySession?.metBalance,
    // Keep a previously known real photo if /auth/me omits profileImage.
    avatar: session.avatar || memorySession?.avatar,
  };
}

export function getSession(): AuthSession | null {
  return memorySession;
}

/** Merge fields into the in-memory session without hitting the network. */
export function patchMemorySession(partial: Partial<AuthSession>): AuthSession | null {
  if (!memorySession) return null;
  memorySession = { ...memorySession, ...partial };
  return memorySession;
}

export async function signIn(email: string, password: string): Promise<AuthSession> {
  const response = await apiClient.post<ApiEnvelope<AuthResponseData>>("/auth/login", {
    email: email.trim(),
    password,
  });
  const data = response.data.data;
  const session = enrichStudentSession(normalizeSession(data), data);
  if (!session.token) {
    throw new Error("لم يُرجع الخادم رمز دخول صالحاً");
  }
  rememberSession(session, pickString(data.refreshToken) || null);
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
  let refreshToken = pickString(registerData.refreshToken) || null;

  if (!session.token) {
    session = await signIn(payload.email, payload.password);
    return session;
  }

  session = enrichStudentSession(session, registerData, payload.universityId);
  rememberSession(session, refreshToken);
  return session;
}

export async function refreshCurrentUser(): Promise<AuthSession | null> {
  let token = getAuthToken() || memorySession?.token || null;

  // Access expired / missing — try this tab's refresh token first.
  if (!token && getRefreshToken()) {
    token = await renewAccessToken();
  }

  if (!token) {
    memorySession = null;
    return null;
  }

  // Re-assert persistence for this tab before calling the API.
  setAuthTokens({ accessToken: token });

  return runWithUnauthorizedLogoutSuppressed(async () => {
    try {
      const nextSession = await fetchCurrentUser(token!);
      rememberSession(nextSession);
      return nextSession;
    } catch (error) {
      if (!isApiError(error) || error.status !== 401) {
        throw error;
      }

      const renewed = await renewAccessToken();
      if (!renewed) {
        throw error;
      }

      const nextSession = await fetchCurrentUser(renewed);
      rememberSession(nextSession);
      return nextSession;
    }
  });
}

export async function signOut() {
  try {
    await apiClient.post("/auth/logout");
  } catch {
    // Ignore logout failures; local token is cleared below.
  } finally {
    memorySession = null;
    clearAuthToken();
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
