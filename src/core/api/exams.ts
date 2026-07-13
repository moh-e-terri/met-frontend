import { apiClient, type ApiEnvelope } from "./client";
import { asArray, asRecord, pickId, pickNumber, pickString } from "./utils";

export type ExamStatus = "available" | "completed" | "in-progress";

export interface CourseExam {
  id: string;
  title: string;
  category: string;
  categoryClassName: string;
  status: ExamStatus;
  statusLabel: string;
  statusClassName: string;
  questions: number;
  duration: string;
  difficulty: string;
  score?: number;
  letterGrade?: string;
  letterGradeClassName?: string;
  requiredGrade?: number;
  actionLabel: string;
  actionClassName: string;
  passingScore?: number;
  isPublished?: boolean;
  rawQuestions?: unknown[];
}

export interface ExamStats {
  completed: number;
  averageGrade: string;
  rank: string;
}

export interface CreateExamPayload {
  title: string;
  duration?: number;
  passingScore?: number;
  isPublished?: boolean;
  startTime?: string;
  endTime?: string;
  showGradesImmediately?: boolean;
  questions?: unknown[];
}

export interface SubmitExamPayload {
  timeTaken?: number;
  answers: Array<{ mcqAnswer?: number; writtenAnswer?: string }>;
}

export interface ExamResult {
  score?: number;
  grade?: string;
  gradeVisible?: boolean;
  gradeNote?: string;
  passed?: boolean;
}

const EXAM_STATUS_STYLES: Record<ExamStatus, { label: string; className: string }> = {
  available: { label: "متاح", className: "bg-[#fff7ed] text-[#f5a524]" },
  completed: { label: "مكتمل", className: "bg-[#ecfdf5] text-[#14b8a6]" },
  "in-progress": { label: "قيد التنفيذ", className: "bg-[#eff6ff] text-[#3b82f6]" },
};

function formatDuration(minutes?: number): string {
  if (!minutes || minutes <= 0) return "—";
  if (minutes < 60) return `${minutes} دقيقة`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours} س ${rest} د` : `${hours} س`;
}

function resolveExamStatus(item: Record<string, unknown>): ExamStatus {
  const status = pickString(item.status, item.examStatus, item.studentStatus).toLowerCase();
  const score = pickNumber(item.score, item.myScore, asRecord(item.result).score);

  if (score > 0 || status.includes("complete") || status.includes("مكتمل")) {
    return "completed";
  }
  if (status.includes("progress") || status.includes("جاري")) return "in-progress";
  return "available";
}

function buildExamAction(status: ExamStatus) {
  if (status === "completed") {
    return {
      actionLabel: "مراجعة النتيجة",
      actionClassName:
        "border border-[#e2e8f0] bg-white text-[#475569] hover:bg-[#f8fafc]",
    };
  }
  if (status === "in-progress") {
    return {
      actionLabel: "متابعة الاختبار",
      actionClassName: "bg-[#3b82f6] text-white hover:bg-[#2563eb]",
    };
  }
  return {
    actionLabel: "ابدأ الاختبار",
    actionClassName: "bg-[#0f172a] text-white hover:bg-[#1e293b]",
  };
}

export function mapCourseExams(raw: unknown): CourseExam[] {
  const data = asRecord(raw);
  const items = asArray<Record<string, unknown>>(
    data.exams ?? data.items ?? (Array.isArray(raw) ? raw : []),
  );

  return items
    .map((item) => {
      const id = pickId(item);
      const title = pickString(item.title, item.name);
      if (!id || !title) return null;

      const status = resolveExamStatus(item);
      const statusStyle = EXAM_STATUS_STYLES[status];
      const questions = asArray(item.questions);
      const passingScore = pickNumber(item.passingScore, item.passScore) || undefined;
      const score = pickNumber(item.score, item.myScore, asRecord(item.result).score) || undefined;
      const action = buildExamAction(status);

      return {
        id,
        title,
        category: pickString(item.category, item.type) || "اختبار",
        categoryClassName: "bg-[#f5f3ff] text-[#8b5cf6]",
        status,
        statusLabel: statusStyle.label,
        statusClassName: statusStyle.className,
        questions: questions.length || pickNumber(item.questionsCount, item.questionCount) || 0,
        duration: formatDuration(pickNumber(item.duration, item.durationMinutes)),
        difficulty: pickString(item.difficulty, item.level) || "متوسط",
        score,
        requiredGrade: passingScore,
        passingScore,
        isPublished: item.isPublished !== false,
        rawQuestions: questions.length ? questions : undefined,
        ...action,
      };
    })
    .filter((item) => item !== null) as CourseExam[];
}

export function buildExamStats(exams: CourseExam[]): ExamStats {
  const completed = exams.filter((exam) => exam.status === "completed").length;
  const scored = exams.filter((exam) => exam.score !== undefined);
  const average =
    scored.length > 0
      ? Math.round(scored.reduce((sum, exam) => sum + (exam.score ?? 0), 0) / scored.length)
      : 0;

  return {
    completed,
    averageGrade: scored.length ? `${average}%` : "—",
    rank: "—",
  };
}

export function mapExamResult(raw: unknown): ExamResult {
  const data = asRecord(raw);
  const result = asRecord(data.result ?? data);

  return {
    score: pickNumber(result.score, data.score) || undefined,
    grade: pickString(result.grade, data.grade) || undefined,
    gradeVisible: Boolean(result.gradeVisible ?? data.gradeVisible ?? true),
    gradeNote: pickString(result.gradeNote, data.gradeNote) || undefined,
    passed: Boolean(result.passed ?? data.passed),
  };
}

export async function fetchCourseExams(courseId: string): Promise<CourseExam[]> {
  const response = await apiClient.get<ApiEnvelope<unknown>>(
    `/courses/${courseId}/exams`,
  );
  return mapCourseExams(response.data.data);
}

export async function createCourseExam(courseId: string, payload: CreateExamPayload) {
  const response = await apiClient.post<ApiEnvelope<unknown>>(
    `/courses/${courseId}/exams`,
    payload,
  );
  const mapped = mapCourseExams(response.data.data);
  return mapped[0] ?? null;
}

export async function submitCourseExam(
  courseId: string,
  examId: string,
  payload: SubmitExamPayload,
) {
  const response = await apiClient.post<ApiEnvelope<unknown>>(
    `/courses/${courseId}/exams/${examId}/submit`,
    payload,
  );
  return mapExamResult(response.data.data);
}

export async function fetchMyExamResult(courseId: string, examId: string): Promise<ExamResult> {
  const response = await apiClient.get<ApiEnvelope<unknown>>(
    `/courses/${courseId}/exams/${examId}/my-result`,
  );
  return mapExamResult(response.data.data);
}

export const examQueryKeys = {
  list: (courseId: string) => ["courses", courseId, "exams"] as const,
  result: (courseId: string, examId: string) =>
    ["courses", courseId, "exams", examId, "my-result"] as const,
};
