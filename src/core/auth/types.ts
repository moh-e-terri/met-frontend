export type UserRole = "admin" | "student" | "teacher";

export interface AuthUser {
  id: string;
  email: string;
  password: string;
  role: UserRole;
  firstName?: string;
  secondName?: string;
  middleName?: string;
  familyName?: string;
  lastName?: string;
  phone?: string;
  university?: string;
  universityId?: string;
}

export interface AuthSession {
  userId: string;
  role: UserRole;
  email: string;
  name: string;
  token?: string;
  universityId?: string;
  universityName?: string;
  metBalance?: number;
}

export interface AuthSignUpPayload {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  phone?: string;
  universityId: string;
}
