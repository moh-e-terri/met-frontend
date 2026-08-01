/**
 * Per-tab auth tokens only (access + refresh).
 *
 * - sessionStorage: survives refresh inside the same tab
 * - tab-scoped localStorage backup: recovers if sessionStorage glitches
 * - never write a shared token/session blob (that caused admin/teacher/student clashes)
 * - never persist API payloads or full user profiles
 */
const TAB_ID_KEY = "met_tab_id";
const ACCESS_KEY = "met_auth_token";
const REFRESH_KEY = "met_auth_refresh";
const ACCESS_BACKUP_PREFIX = "met_auth_token__";
const REFRESH_BACKUP_PREFIX = "met_auth_refresh__";

const SHARED_LOCAL_KEYS = ["met_auth_token", "met_auth_session", "token", "met_auth_users", "met_auth_refresh"] as const;
const SHARED_SESSION_KEYS = ["met_auth_session", "token"] as const;

type AuthClearedListener = () => void;
const clearedListeners = new Set<AuthClearedListener>();

/** Ref-count so overlapping bootstraps (React Strict Mode) stay safe. */
let suppressUnauthorizedLogoutCount = 0;

let memoryAccessToken: string | null = null;
let memoryRefreshToken: string | null = null;

export function onAuthTokenCleared(listener: AuthClearedListener) {
  clearedListeners.add(listener);
  return () => {
    clearedListeners.delete(listener);
  };
}

function notifyAuthCleared() {
  clearedListeners.forEach((listener) => listener());
}

function safeGet(storage: Storage, key: string): string | null {
  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(storage: Storage, key: string, value: string) {
  try {
    storage.setItem(key, value);
  } catch {
    // Private mode / blocked storage
  }
}

function safeRemove(storage: Storage, key: string) {
  try {
    storage.removeItem(key);
  } catch {
    // ignore
  }
}

function getTabId(): string {
  const existing = safeGet(sessionStorage, TAB_ID_KEY);
  if (existing) return existing;

  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `tab-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  safeSet(sessionStorage, TAB_ID_KEY, id);
  return id;
}

function accessBackupKey(tabId: string) {
  return `${ACCESS_BACKUP_PREFIX}${tabId}`;
}

function refreshBackupKey(tabId: string) {
  return `${REFRESH_BACKUP_PREFIX}${tabId}`;
}

/** Remove only legacy shared keys that caused cross-tab account collisions. */
export function clearLegacyAuthStorage() {
  for (const key of SHARED_LOCAL_KEYS) {
    safeRemove(localStorage, key);
  }
  for (const key of SHARED_SESSION_KEYS) {
    safeRemove(sessionStorage, key);
  }
}

function readPersistedAccessToken(): string | null {
  const fromSession = safeGet(sessionStorage, ACCESS_KEY);
  if (fromSession) return fromSession;

  const tabId = safeGet(sessionStorage, TAB_ID_KEY);
  if (!tabId) return null;

  const fromBackup = safeGet(localStorage, accessBackupKey(tabId));
  if (fromBackup) {
    safeSet(sessionStorage, ACCESS_KEY, fromBackup);
    return fromBackup;
  }

  return null;
}

function readPersistedRefreshToken(): string | null {
  const fromSession = safeGet(sessionStorage, REFRESH_KEY);
  if (fromSession) return fromSession;

  const tabId = safeGet(sessionStorage, TAB_ID_KEY);
  if (!tabId) return null;

  const fromBackup = safeGet(localStorage, refreshBackupKey(tabId));
  if (fromBackup) {
    safeSet(sessionStorage, REFRESH_KEY, fromBackup);
    return fromBackup;
  }

  return null;
}

/** Hydrate in-memory tokens once per page load (before React mounts). */
function hydrateMemoryFromStorage() {
  if (memoryAccessToken === null) {
    memoryAccessToken = readPersistedAccessToken();
  }
  if (memoryRefreshToken === null) {
    memoryRefreshToken = readPersistedRefreshToken();
  }
}

hydrateMemoryFromStorage();

export function getAuthToken(): string | null {
  hydrateMemoryFromStorage();
  if (memoryAccessToken) return memoryAccessToken;
  const persisted = readPersistedAccessToken();
  memoryAccessToken = persisted;
  return persisted;
}

export function getRefreshToken(): string | null {
  hydrateMemoryFromStorage();
  if (memoryRefreshToken) return memoryRefreshToken;
  const persisted = readPersistedRefreshToken();
  memoryRefreshToken = persisted;
  return persisted;
}

export function setAuthTokens(options: {
  accessToken?: string | null;
  refreshToken?: string | null;
}) {
  const tabId = getTabId();
  const { accessToken, refreshToken } = options;

  if (accessToken !== undefined) {
    memoryAccessToken = accessToken || null;
    if (accessToken) {
      safeSet(sessionStorage, ACCESS_KEY, accessToken);
      safeSet(localStorage, accessBackupKey(tabId), accessToken);
    } else {
      safeRemove(sessionStorage, ACCESS_KEY);
      safeRemove(localStorage, accessBackupKey(tabId));
    }
  }

  if (refreshToken !== undefined) {
    memoryRefreshToken = refreshToken || null;
    if (refreshToken) {
      safeSet(sessionStorage, REFRESH_KEY, refreshToken);
      safeSet(localStorage, refreshBackupKey(tabId), refreshToken);
    } else {
      safeRemove(sessionStorage, REFRESH_KEY);
      safeRemove(localStorage, refreshBackupKey(tabId));
    }
  }

  clearLegacyAuthStorage();
}

/** @deprecated Prefer setAuthTokens — kept for call-site compatibility. */
export function setAuthToken(token: string | null | undefined) {
  setAuthTokens({ accessToken: token ?? null });
}

export function clearAuthToken() {
  const tabId = safeGet(sessionStorage, TAB_ID_KEY);
  memoryAccessToken = null;
  memoryRefreshToken = null;
  safeRemove(sessionStorage, ACCESS_KEY);
  safeRemove(sessionStorage, REFRESH_KEY);
  if (tabId) {
    safeRemove(localStorage, accessBackupKey(tabId));
    safeRemove(localStorage, refreshBackupKey(tabId));
  }
  clearLegacyAuthStorage();
  notifyAuthCleared();
}

export function runWithUnauthorizedLogoutSuppressed<T>(fn: () => Promise<T>): Promise<T> {
  suppressUnauthorizedLogoutCount += 1;
  return fn().finally(() => {
    suppressUnauthorizedLogoutCount = Math.max(0, suppressUnauthorizedLogoutCount - 1);
  });
}

export function shouldClearTokenOnUnauthorized(): boolean {
  return suppressUnauthorizedLogoutCount === 0;
}

export function getApiBaseUrl(): string {
  return import.meta.env.VITE_API_URL || "https://met-efgo.onrender.com/api/v1";
}

/**
 * Renew access token for THIS tab only using its refresh token.
 * Uses raw fetch to avoid axios interceptor recursion.
 */
export async function renewAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  try {
    const response = await fetch(`${getApiBaseUrl()}/auth/refresh-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    const payload = (await response.json().catch(() => null)) as {
      data?: { accessToken?: string; refreshToken?: string; token?: string };
    } | null;

    if (!response.ok) return null;

    const accessToken =
      payload?.data?.accessToken || payload?.data?.token || null;
    if (!accessToken) return null;

    setAuthTokens({
      accessToken,
      refreshToken: payload?.data?.refreshToken || refreshToken,
    });
    return accessToken;
  } catch {
    return null;
  }
}
