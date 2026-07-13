import { fetchCourseLessons } from "@/core/api/lessons";
import { fetchCourseAssignments } from "@/core/api/assignments";
import { fetchCourseExams } from "@/core/api/exams";
import { apiClient, type ApiEnvelope } from "@/core/api/client";
import { asArray, asRecord, pickId, pickNumber, pickString } from "@/core/api/utils";
import type { ApiLesson } from "@/core/api/lessons.types";
import { mapApiLessons } from "@/core/api/lessons.types";
import type { CourseLesson, LessonStatus } from "@/student/modules/courses/data/mockCourse";
import type { MyCourseAssignment, MyCourseQuiz } from "@/student/modules/my-courses/data/mockMyCourse";

export interface StudentCourseContent {
  courseId: string;
  title: string;
  instructor?: string;
  progressPercent: number;
  completedLessons: number;
  totalLessons: number;
  lessons: CourseLesson[];
  apiLessons: ApiLesson[];
  assignments: MyCourseAssignment[];
  quizzes: MyCourseQuiz[];
  pendingAssignments: number;
  activeLesson: {
    id: string;
    title: string;
    duration: string;
    description: string;
    videoUrl?: string;
    videoProgress: number;
  };
}

function mapAssignments(raw: unknown): MyCourseAssignment[] {
  return asArray<Record<string, unknown>>(raw).map((item, index) => ({
    id: pickId(item) || `assignment-${index}`,
    title: pickString(item.title, item.name) || "تكليف",
    status: pickString(item.status, item.state) || "قيد الانتظار",
    deadline: pickString(item.deadline, item.dueDate, item.dueAt) || null,
    primaryAction: pickString(item.primaryAction) || "ابدأ الآن",
    secondaryAction: pickString(item.secondaryAction) || null,
  }));
}

function mapQuizzes(raw: unknown): MyCourseQuiz[] {
  return asArray<Record<string, unknown>>(raw).map((item, index) => {
    const score = pickString(item.score, item.grade, item.result);
    const isCompleted = Boolean(item.isCompleted ?? item.completed ?? score);

    return {
      id: pickId(item) || `quiz-${index}`,
      title: pickString(item.title, item.name) || "اختبار",
      score: score || undefined,
      status: isCompleted ? ("completed" as const) : ("not-started" as const),
      action: isCompleted ? "مراجعة الإجابات" : "ابدأ الاختبار",
    };
  });
}

function mapLessonStatus(
  lesson: ApiLesson,
  index: number,
  activeId: string,
): LessonStatus {
  if (lesson.isCompleted) return "completed";
  if (lesson.id === activeId) return "active";
  if (!lesson.isPublished) return "locked";
  if (index > 0) return "upcoming";
  return "active";
}

export function buildStudentCourseContent(
  courseId: string,
  apiLessons: ApiLesson[],
  meta?: {
    title?: string;
    instructor?: string;
    progressPercent?: number;
    assignments?: MyCourseAssignment[];
    quizzes?: MyCourseQuiz[];
  },
): StudentCourseContent {
  const publishedLessons = apiLessons.filter((lesson) => lesson.isPublished);
  const totalLessons = publishedLessons.length || apiLessons.length;
  const completedLessons = apiLessons.filter((lesson) => lesson.isCompleted).length;

  const activeApiLesson =
    apiLessons.find((lesson) => lesson.progress && lesson.progress > 0 && !lesson.isCompleted) ??
    apiLessons.find((lesson) => !lesson.isCompleted && lesson.isPublished) ??
    apiLessons[0];

  const activeId = activeApiLesson?.id ?? "";

  const lessons: CourseLesson[] = apiLessons.map((lesson, index) => ({
    id: lesson.id,
    title: lesson.title,
    status: mapLessonStatus(lesson, index, activeId),
    order: lesson.order,
    progress: lesson.progress,
  }));

  const assignments = meta?.assignments ?? [];
  const quizzes = meta?.quizzes ?? [];
  const pendingAssignments = assignments.filter((item) =>
    !item.status.toLowerCase().includes("مكتمل") &&
    !item.status.toLowerCase().includes("complete"),
  ).length;

  return {
    courseId,
    title: meta?.title || "محتوى الدورة",
    instructor: meta?.instructor,
    progressPercent:
      meta?.progressPercent ??
      (totalLessons ? Math.round((completedLessons / totalLessons) * 100) : 0),
    completedLessons,
    totalLessons,
    lessons,
    apiLessons,
    assignments,
    quizzes,
    pendingAssignments,
    activeLesson: {
      id: activeApiLesson?.id ?? "",
      title: activeApiLesson?.title ?? "لا يوجد درس متاح",
      duration: activeApiLesson?.duration
        ? `${Math.round(activeApiLesson.duration / 60)} دقيقة`
        : "—",
      description: activeApiLesson?.description || "لا يوجد وصف لهذا الدرس حالياً.",
      videoUrl: activeApiLesson?.videoUrl,
      videoProgress: activeApiLesson?.progress ?? 0,
    },
  };
}

export async function fetchStudentCourseContent(courseId: string): Promise<StudentCourseContent> {
  const [contentResult, lessonsResult] = await Promise.allSettled([
    apiClient.get<ApiEnvelope<unknown>>(`/student/courses/${courseId}/content`),
    fetchCourseLessons(courseId),
  ]);

  if (contentResult.status === "rejected") {
    throw contentResult.reason;
  }

  const response = contentResult.value;
  const data = asRecord(response.data.data);
  const course = asRecord(data.course ?? data);

  const lessonsFromEndpoint =
    lessonsResult.status === "fulfilled" ? lessonsResult.value : [];
  const lessonsFromContent = mapApiLessons(data.lessons ?? course.lessons ?? data);
  const apiLessons = lessonsFromEndpoint.length ? lessonsFromEndpoint : lessonsFromContent;

  let assignments = mapAssignments(data.assignments ?? course.assignments);
  let quizzes = mapQuizzes(data.exams ?? data.quizzes ?? course.exams ?? course.quizzes);

  try {
    const [assignmentsFromApi, examsFromApi] = await Promise.all([
      fetchCourseAssignments(courseId),
      fetchCourseExams(courseId),
    ]);

    if (assignmentsFromApi.length) {
      assignments = assignmentsFromApi.map((item) => ({
        id: item.id,
        title: item.title,
        status: item.statusLabel,
        deadline: item.deadline === "بدون موعد" ? null : item.deadline,
        primaryAction: item.actionLabel,
        secondaryAction: null,
      }));
    }

    if (examsFromApi.length) {
      quizzes = examsFromApi.map((item) => ({
        id: item.id,
        title: item.title,
        score: item.score !== undefined ? `${item.score}%` : undefined,
        status: item.status === "completed" ? ("completed" as const) : ("not-started" as const),
        action: item.actionLabel,
      }));
    }
  } catch {
    // content endpoint may already include assignments/exams
  }

  return buildStudentCourseContent(courseId, apiLessons, {
    title: pickString(course.title, course.name, data.title),
    instructor: pickString(
      asRecord(course.instructor).name,
      course.instructorName,
      data.instructorName,
    ),
    progressPercent: pickNumber(course.progress, course.progressPercent, data.progress),
    assignments,
    quizzes,
  });
}

export const studentCourseQueryKeys = {
  content: (courseId: string) => ["student", "courses", courseId, "content"] as const,
};

function formatLessonDuration(seconds?: number): string {
  if (!seconds || seconds <= 0) return "—";
  return `${Math.round(seconds / 60)} دقيقة`;
}

export function getLessonView(content: StudentCourseContent, lessonId: string) {
  const lesson = content.apiLessons.find((item) => item.id === lessonId);
  if (!lesson) {
    return {
      id: content.activeLesson.id,
      title: content.activeLesson.title,
      duration: content.activeLesson.duration,
      views: "—",
      description: content.activeLesson.description,
      videoUrl: content.activeLesson.videoUrl,
      videoCurrent: "00:00",
      videoTotal: content.activeLesson.duration,
      videoProgress: content.activeLesson.videoProgress,
    };
  }

  return {
    id: lesson.id,
    title: lesson.title,
    duration: formatLessonDuration(lesson.duration),
    views: "—",
    description: lesson.description || "لا يوجد وصف لهذا الدرس حالياً.",
    videoUrl: lesson.videoUrl,
    videoCurrent: "00:00",
    videoTotal: formatLessonDuration(lesson.duration),
    videoProgress: lesson.progress ?? 0,
  };
}

export function getLessonsForSidebar(
  content: StudentCourseContent,
  selectedLessonId: string,
): CourseLesson[] {
  return content.lessons.map((lesson) => {
    if (lesson.id === selectedLessonId) {
      return { ...lesson, status: "active" as const };
    }
    if (lesson.status === "active") {
      return { ...lesson, status: "upcoming" as const };
    }
    return lesson;
  });
}
