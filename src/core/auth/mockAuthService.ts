import type { AuthSession, AuthUser } from "./types";

const USERS_KEY = "met_auth_users";
const SESSION_KEY = "met_auth_session";

const defaultAdmin: AuthUser = {
  id: "admin-1",
  email: "admin",
  password: "admin",
  role: "admin",
  firstName: "سارة",
  lastName: "أحمد",
};

const defaultTeacher: AuthUser = {
  id: "teacher-1",
  email: "teacher@gmail.com",
  password: "123456",
  role: "teacher",
  firstName: "أحمد",
  lastName: "خالد",
};

function ensureDefaultUsers(users: AuthUser[]): AuthUser[] {
  let next = [...users];

  if (!next.some((user) => user.email === "admin" && user.role === "admin")) {
    next = [defaultAdmin, ...next];
  }

  if (
    !next.some(
      (user) =>
        user.email.toLowerCase() === defaultTeacher.email && user.role === "teacher",
    )
  ) {
    next = [...next, defaultTeacher];
  }

  localStorage.setItem(USERS_KEY, JSON.stringify(next));
  return next;
}

function readUsers(): AuthUser[] {
  const raw = localStorage.getItem(USERS_KEY);
  if (!raw) {
    return ensureDefaultUsers([]);
  }

  try {
    const users = JSON.parse(raw) as AuthUser[];
    return ensureDefaultUsers(users);
  } catch {
    return ensureDefaultUsers([]);
  }
}

function writeUsers(users: AuthUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function toSession(user: AuthUser): AuthSession {
  const name = [user.firstName, user.middleName, user.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();

  if (user.role === "admin") {
    return {
      userId: user.id,
      role: user.role,
      email: user.email,
      name: name || "مدير النظام",
    };
  }

  if (user.role === "teacher") {
    return {
      userId: user.id,
      role: user.role,
      email: user.email,
      name: name ? `د. ${name}` : user.email,
    };
  }

  return {
    userId: user.id,
    role: user.role,
    email: user.email,
    name: name || user.email,
  };
}

export function getSession(): AuthSession | null {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    return null;
  }
}

export function signIn(identifier: string, password: string): AuthSession {
  const users = readUsers();
  const user = users.find(
    (item) =>
      item.email.toLowerCase() === identifier.trim().toLowerCase() &&
      item.password === password,
  );

  if (!user) {
    throw new Error("البريد الإلكتروني أو كلمة المرور غير صحيحة");
  }

  const session = toSession(user);
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export function signUp(payload: Omit<AuthUser, "id" | "role">): AuthSession {
  const users = readUsers();
  const email = payload.email.trim().toLowerCase();

  if (users.some((user) => user.email.toLowerCase() === email)) {
    throw new Error("هذا البريد الإلكتروني مستخدم بالفعل");
  }

  const user: AuthUser = {
    ...payload,
    id: crypto.randomUUID(),
    email,
    role: "student",
  };

  writeUsers([...users, user]);
  const session = toSession(user);
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export function signOut() {
  localStorage.removeItem(SESSION_KEY);
}
