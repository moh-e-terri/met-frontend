import { apiClient, isApiError, type ApiEnvelope } from "./client";
import { asArray, asRecord, pickId, pickNumber, pickString } from "./utils";

export type ExamStatus = "available" | "completed" | "in-progress";
export type ExamQuestionType = "mcq" | "written";

export interface ExamQuestionDetail {
  id: string;
  questionText: string;
  questionType: ExamQuestionType;
  options: string[];
  points: number;
}

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
  /** Duration in minutes from the API (used for countdown). */
  durationMinutes: number;
  difficulty: string;
  score?: number;
  letterGrade?: string;
  letterGradeClassName?: string;
  requiredGrade?: number;
  actionLabel: string;
  actionClassName: string;
  passingScore?: number;
  isPublished?: boolean;
  description?: string;
  questionDetails: ExamQuestionDetail[];
  rawQuestions?: unknown[];
}

export interface ExamStats {
  completed: number;
  averageGrade: string;
  rank: string;
}

/** Shape expected by POST /courses/:courseId/exams */
export interface ExamQuestionInput {
  questionText: string;
  questionType: ExamQuestionType;
  options?: string[];
  correctAnswer?: number | null;
  points?: number;
}

export interface CreateExamPayload {
  title: string;
  duration?: number;
  passingScore?: number;
  isPublished?: boolean;
  startTime?: string;
  endTime?: string;
  showGradesImmediately?: boolean;
  questions: ExamQuestionInput[];
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
  isFullyGraded?: boolean;
  timeTaken?: number;
  submittedAt?: string;
  message?: string;
  exists: boolean;
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

function pickOptionalScore(...values: unknown[]): number | undefined {
  for (const value of values) {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim() !== "") {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) return parsed;
    }
  }
  return undefined;
}

function resolveExamStatus(item: Record<string, unknown>): ExamStatus {
  const status = pickString(item.status, item.examStatus, item.studentStatus).toLowerCase();
  const result = asRecord(item.result ?? item.myResult ?? item.submission);
  const score = pickOptionalScore(item.score, item.myScore, result.score);
  const submittedAt = pickString(result.submittedAt, item.submittedAt);
  const hasSubmission = Boolean(
    pickId(result) ||
      submittedAt ||
      result.isFullyGraded === true ||
      result.isFullyGraded === false ||
      score !== undefined,
  );

  if (
    hasSubmission ||
    status.includes("complete") ||
    status.includes("submitted") ||
    status.includes("مكتمل")
  ) {
    return "completed";
  }
  if (status.includes("progress") || status.includes("جاري")) return "in-progress";
  return "available";
}

export function mapExamQuestions(raw: unknown): ExamQuestionDetail[] {
  return asArray<Record<string, unknown>>(raw)
    .map((item, index) => {
      const questionText = pickString(item.questionText, item.question, item.text);
      if (!questionText) return null;

      const typeRaw = pickString(item.questionType, item.type).toLowerCase();
      const questionType: ExamQuestionType =
        typeRaw === "written" || typeRaw === "essay" || typeRaw === "مقالي"
          ? "written"
          : "mcq";

      return {
        id: pickId(item) || `q-${index}`,
        questionText,
        questionType,
        options: asArray<unknown>(item.options)
          .map((option) => String(option ?? "").trim())
          .filter(Boolean),
        points: pickNumber(item.points) || 1,
      } satisfies ExamQuestionDetail;
    })
    .filter((item): item is ExamQuestionDetail => item !== null);
}

function buildExamAction(status: ExamStatus) {
  if (status === "completed") {
    return {
      actionLabel: "عرض درجتك",
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

function mapExamItem(item: Record<string, unknown>): CourseExam | null {
  const id = pickId(item);
  const title = pickString(item.title, item.name);
  if (!id || !title) return null;

  const status = resolveExamStatus(item);
  const statusStyle = EXAM_STATUS_STYLES[status];
  const questions = asArray(item.questions);
  const questionDetails = mapExamQuestions(questions);
  const durationMinutes = pickNumber(item.duration, item.durationMinutes) || 0;
  const passingScore = pickNumber(item.passingScore, item.passScore) || undefined;
  const result = asRecord(item.result ?? item.myResult ?? item.submission);
  const score = pickOptionalScore(item.score, item.myScore, result.score);
  const action = buildExamAction(status);

  return {
    id,
    title,
    category: pickString(item.category, item.type) || "اختبار",
    categoryClassName: "bg-[#f5f3ff] text-[#8b5cf6]",
    status,
    statusLabel: statusStyle.label,
    statusClassName: statusStyle.className,
    questions:
      questionDetails.length ||
      pickNumber(item.questionsCount, item.questionCount) ||
      0,
    duration: formatDuration(durationMinutes),
    durationMinutes,
    difficulty: pickString(item.difficulty, item.level) || "متوسط",
    score,
    requiredGrade: passingScore,
    passingScore,
    isPublished: item.isPublished !== false,
    description: pickString(item.description) || undefined,
    questionDetails,
    rawQuestions: questions.length ? questions : undefined,
    ...action,
  };
}

export function mapCourseExams(raw: unknown): CourseExam[] {
  const data = asRecord(raw);
  const single = asRecord(data.exam);
  if (pickId(single)) {
    const mapped = mapExamItem(single);
    return mapped ? [mapped] : [];
  }

  // GET /exams/:id may return the exam object directly under data
  if (pickId(data) && !Array.isArray(data.exams) && !Array.isArray(data.items)) {
    const mapped = mapExamItem(data);
    return mapped ? [mapped] : [];
  }

  const items = asArray<Record<string, unknown>>(
    data.exams ?? data.items ?? (Array.isArray(raw) ? raw : []),
  );

  return items
    .map((item) => mapExamItem(item))
    .filter((item): item is CourseExam => item !== null);
}

export function buildExamStats(exams: CourseExam[]): ExamStats {
  const total = exams.length;
  const completed = exams.filter((exam) => exam.status === "completed").length;
  const scored = exams.filter((exam) => typeof exam.score === "number");
  const average =
    scored.length > 0
      ? Math.round(scored.reduce((sum, exam) => sum + (exam.score ?? 0), 0) / scored.length)
      : null;

  let rank = "—";
  if (average !== null) {
    if (average >= 90) rank = "متفوق";
    else if (average >= 75) rank = "متقدم";
    else if (average >= 60) rank = "جيد";
    else rank = "يحتاج تحسين";
  } else if (completed > 0) {
    rank = "قيد التقييم";
  } else if (total > 0) {
    rank = `0/${total}`;
  }

  return {
    completed,
    averageGrade:
      average !== null ? `${average}%` : completed > 0 ? "قيد التقييم" : "—",
    rank,
  };
}

export function applyStudentExamResult(
  exam: CourseExam,
  result: ExamResult,
): CourseExam {
  if (!result.exists) return exam;

  const status: ExamStatus = "completed";
  const statusStyle = EXAM_STATUS_STYLES[status];
  const action = buildExamAction(status);

  return {
    ...exam,
    status,
    statusLabel: statusStyle.label,
    statusClassName: statusStyle.className,
    score: result.score,
    ...action,
  };
}

export async function fetchCourseExamsWithStudentResults(
  courseId: string,
): Promise<CourseExam[]> {
  const exams = await fetchCourseExams(courseId);
  if (exams.length === 0) return exams;

  const results = await Promise.all(
    exams.map(async (exam) => {
      try {
        return await fetchMyExamResult(courseId, exam.id);
      } catch {
        return { exists: false, gradeVisible: true } satisfies ExamResult;
      }
    }),
  );

  return exams.map((exam, index) => applyStudentExamResult(exam, results[index]));
}

export function mapExamResult(raw: unknown): ExamResult {
  const data = asRecord(raw);
  const result = asRecord(data.result ?? data);
  const scoreRaw = result.score ?? data.score;
  const score =
    typeof scoreRaw === "number" && Number.isFinite(scoreRaw) ? scoreRaw : undefined;
  const hasResult = Boolean(
    pickId(result) ||
      pickString(result.submittedAt, data.submittedAt) ||
      score !== undefined ||
      result.isFullyGraded === true,
  );

  return {
    score,
    grade: pickString(result.grade, data.grade) || undefined,
    gradeVisible: Boolean(result.gradeVisible ?? data.gradeVisible ?? true),
    gradeNote: pickString(result.gradeNote, data.gradeNote) || undefined,
    passed: Boolean(result.isPassed ?? result.passed ?? data.passed),
    isFullyGraded:
      typeof result.isFullyGraded === "boolean" ? result.isFullyGraded : undefined,
    timeTaken: pickNumber(result.timeTaken, data.timeTaken) || undefined,
    submittedAt: pickString(result.submittedAt, data.submittedAt) || undefined,
    message: pickString(data.message, result.message) || undefined,
    exists: hasResult,
  };
}

/** Normalize questions to the backend contract before POST. */
export function normalizeExamQuestions(questions: ExamQuestionInput[]): ExamQuestionInput[] {
  return questions.map((question, index) => {
    const questionText = question.questionText.trim();
    const questionType: ExamQuestionType =
      question.questionType === "written" ? "written" : "mcq";

    if (!questionText) {
      throw new Error(`نص السؤال ${index + 1} مطلوب`);
    }

    if (questionType === "written") {
      return {
        questionText,
        questionType: "written",
        points: question.points && question.points > 0 ? question.points : 1,
      };
    }

    const options = (question.options ?? [])
      .map((option) => option.trim())
      .filter(Boolean);

    if (options.length < 4 || options.length > 7) {
      throw new Error(`السؤال ${index + 1}: الاختيار المتعدد يتطلب بين 4 و 7 خيارات`);
    }

    const correctAnswer =
      typeof question.correctAnswer === "number" ? question.correctAnswer : 0;

    if (correctAnswer < 0 || correctAnswer >= options.length) {
      throw new Error(`السؤال ${index + 1}: حدّد الإجابة الصحيحة`);
    }

    return {
      questionText,
      questionType: "mcq",
      options,
      correctAnswer,
      points: question.points && question.points > 0 ? question.points : 1,
    };
  });
}

export async function fetchCourseExams(courseId: string): Promise<CourseExam[]> {
  const response = await apiClient.get<ApiEnvelope<unknown>>(
    `/courses/${courseId}/exams`,
  );
  return mapCourseExams(response.data.data);
}

export async function fetchCourseExam(
  courseId: string,
  examId: string,
): Promise<CourseExam | null> {
  const response = await apiClient.get<ApiEnvelope<unknown>>(
    `/courses/${courseId}/exams/${examId}`,
  );
  const mapped = mapCourseExams(response.data.data);
  return mapped[0] ?? null;
}

export async function createCourseExam(courseId: string, payload: CreateExamPayload) {
  const body = {
    title: payload.title.trim(),
    duration: payload.duration,
    passingScore: payload.passingScore,
    isPublished: payload.isPublished,
    startTime: payload.startTime,
    endTime: payload.endTime,
    showGradesImmediately: payload.showGradesImmediately,
    questions: normalizeExamQuestions(payload.questions),
  };

  const response = await apiClient.post<ApiEnvelope<unknown>>(
    `/courses/${courseId}/exams`,
    body,
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
  const mapped = mapExamResult(response.data.data ?? response.data);
  if (!mapped.message && response.data.message) {
    mapped.message = response.data.message;
  }
  mapped.exists = true;
  return mapped;
}

export async function fetchMyExamResult(courseId: string, examId: string): Promise<ExamResult> {
  try {
    const response = await apiClient.get<ApiEnvelope<unknown>>(
      `/courses/${courseId}/exams/${examId}/my-result`,
    );
    return mapExamResult(response.data.data ?? response.data);
  } catch (error) {
    if (isApiError(error) && error.status === 404) {
      return { exists: false, gradeVisible: true };
    }
    throw error;
  }
}

export const examQueryKeys = {
  list: (courseId: string) => ["courses", courseId, "exams"] as const,
  detail: (courseId: string, examId: string) =>
    ["courses", courseId, "exams", examId] as const,
  result: (courseId: string, examId: string) =>
    ["courses", courseId, "exams", examId, "my-result"] as const,
};
