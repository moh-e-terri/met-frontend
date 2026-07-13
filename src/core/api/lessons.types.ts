import { asArray, asRecord, pickId, pickNumber, pickString, resolveMediaUrl } from "./utils";

export interface ApiLesson {
  id: string;
  title: string;
  videoUrl?: string;
  duration?: number;
  order: number;
  isPublished: boolean;
  description?: string;
  progress?: number;
  isCompleted?: boolean;
}

export interface CreateLessonPayload {
  title: string;
  videoFile: File;
  duration?: number;
  order?: number;
  isPublished?: boolean;
}

export function formatLessonDuration(seconds?: number): string {
  if (!seconds || seconds <= 0) return "—";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} دقيقة`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours} س ${rest} د` : `${hours} س`;
}

function pickLessonVideoUrl(raw: Record<string, unknown>): string | undefined {
  const videoRecord = asRecord(raw.video);
  const rawUrl = pickString(
    raw.videoUrl,
    raw.video,
    raw.url,
    raw.fileUrl,
    raw.mediaUrl,
    videoRecord.url,
    videoRecord.path,
    videoRecord.secureUrl,
  );
  return resolveMediaUrl(rawUrl);
}

function mapSingleLesson(raw: Record<string, unknown>, index: number): ApiLesson | null {
  const id = pickId(raw);
  const title = pickString(raw.title, raw.name);
  if (!id || !title) return null;

  return {
    id,
    title,
    videoUrl: pickLessonVideoUrl(raw),
    duration: pickNumber(raw.duration, raw.durationSeconds) || undefined,
    order: pickNumber(raw.order, raw.sortOrder, index + 1),
    isPublished: raw.isPublished !== false,
    description: pickString(raw.description, raw.summary) || undefined,
    progress: pickNumber(raw.progress, raw.progressPercent, raw.watchProgress) || undefined,
    isCompleted: Boolean(raw.isCompleted ?? raw.completed ?? raw.watched),
  };
}

export function mapApiLessons(raw: unknown): ApiLesson[] {
  const data = asRecord(raw);
  const lessons = asArray<Record<string, unknown>>(
    data.lessons ?? data.items ?? (Array.isArray(raw) ? raw : []),
  );

  return lessons
    .map(mapSingleLesson)
    .filter((lesson): lesson is ApiLesson => lesson !== null)
    .sort((a, b) => a.order - b.order);
}

export const lessonQueryKeys = {
  list: (courseId: string) => ["courses", courseId, "lessons"] as const,
};
