export function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

export function resolveMediaUrl(url?: string): string | undefined {
  const trimmed = pickString(url);
  if (!trimmed) return undefined;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;

  const apiBase =
    (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) ||
    "https://met-efgo.onrender.com/api/v1";
  const mediaOrigin =
    (typeof import.meta !== "undefined" && import.meta.env?.VITE_MEDIA_ORIGIN) ||
    apiBase.replace(/\/api\/v1\/?$/, "");

  if (trimmed.startsWith("/")) return `${mediaOrigin}${trimmed}`;
  return `${mediaOrigin}/${trimmed}`;
}

export function asArray<T = unknown>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

export function pickNumber(...values: unknown[]): number {
  for (const value of values) {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim() !== "") {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) return parsed;
    }
  }
  return 0;
}

export function pickString(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

export function pickId(record: Record<string, unknown>): string {
  const userId = record.userId;
  const userIdString = typeof userId === "string" ? userId : "";
  return pickString(record._id, record.id, userIdString, record.instructorId);
}

export function pickNestedUser(raw: Record<string, unknown>): Record<string, unknown> {
  const userIdValue = raw.userId;
  const userIdObject =
    userIdValue && typeof userIdValue === "object" && !Array.isArray(userIdValue)
      ? (userIdValue as Record<string, unknown>)
      : {};

  if (pickId(userIdObject) || pickString(userIdObject.email, userIdObject.fullName, userIdObject.firstName)) {
    return userIdObject;
  }

  return asRecord(raw.user ?? raw.instructor ?? raw.teacher ?? raw.profile);
}

export function extractApiList(
  raw: unknown,
  collectionKeys: string[],
): Record<string, unknown>[] {
  if (Array.isArray(raw)) {
    return raw as Record<string, unknown>[];
  }

  const data = asRecord(raw);

  for (const key of collectionKeys) {
    const value = data[key];
    if (Array.isArray(value)) {
      return value as Record<string, unknown>[];
    }

    const nested = asRecord(value);
    const docs = asArray<Record<string, unknown>>(
      nested.docs ?? nested.items ?? nested.data ?? nested.results,
    );
    if (docs.length) return docs;
  }

  return asArray<Record<string, unknown>>(data.items ?? data.docs ?? data.data);
}
