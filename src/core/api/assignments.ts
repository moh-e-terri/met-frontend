import { apiClient, type ApiEnvelope } from "./client";
import { asArray, asRecord, pickId, pickNumber, pickString } from "./utils";

export type AssignmentStatus =
  | "pending"
  | "submitted"
  | "graded"
  | "draft"
  | "overdue";

export type AssignmentSubmissionType = "any" | "pdf" | "image" | "text";

export interface CourseAssignment {
  id: string;
  title: string;
  description?: string;
  category: string;
  categoryClassName: string;
  status: AssignmentStatus;
  statusLabel: string;
  statusClassName: string;
  points: number;
  deadline: string;
  /** Raw ISO due date for deadline checks. */
  dueDateIso?: string;
  isDeadlineOpen: boolean;
  type: string;
  score?: number;
  letterGrade?: string;
  letterGradeClassName?: string;
  draftInfo?: string;
  draftProgress?: number;
  submittedAt?: string;
  overdueNote?: string;
  feedbackPreview?: string;
  actionLabel: string;
  actionClassName: string;
  actionIcon?: string;
  submissionType: AssignmentSubmissionType;
  submissionId?: string;
  submittedFileName?: string;
  submittedText?: string;
  feedback?: string;
  attemptsUsed?: number;
}

/** Backend currently allows a single submit (409 on resubmit). */
export const ASSIGNMENT_MAX_ATTEMPTS = 3;


export interface AssignmentStats {
  submitted: number;
  averageGrade: string;
  pending: number;
}

export interface CreateAssignmentPayload {
  title: string;
  description?: string;
  submissionType?: AssignmentSubmissionType;
  dueDate?: string;
  maxScore?: number;
}

export interface SubmitAssignmentPayload {
  submissionType: "text" | "pdf" | "image";
  textAnswer?: string;
  fileUrl?: string;
}

const STATUS_STYLES: Record<
  AssignmentStatus,
  { label: string; className: string }
> = {
  pending: { label: "قيد الانتظار", className: "bg-[#fff7ed] text-[#f5a524]" },
  submitted: { label: "تم التسليم", className: "bg-[#ecfdf5] text-[#14b8a6]" },
  graded: { label: "تم التقييم", className: "bg-[#ecfdf5] text-[#14b8a6]" },
  draft: { label: "مسودة", className: "bg-[#eff6ff] text-[#3b82f6]" },
  overdue: { label: "متأخر", className: "bg-[#fef2f2] text-[#ef4444]" },
};

const SUBMISSION_TYPE_LABELS: Record<AssignmentSubmissionType, string> = {
  any: "أي نوع",
  pdf: "ملف PDF",
  image: "صورة",
  text: "نص",
};

function normalizeSubmissionType(value: string): AssignmentSubmissionType {
  const normalized = value.toLowerCase();
  if (normalized === "pdf") return "pdf";
  if (normalized === "image" || normalized === "img") return "image";
  if (normalized === "text" || normalized === "written") return "text";
  return "any";
}

const MAX_PDF_BYTES = 5 * 1024 * 1024;
const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

export function assignmentFileAccept(
  submissionType: AssignmentSubmissionType,
): string {
  if (submissionType === "pdf") return "application/pdf,.pdf";
  if (submissionType === "image") return "image/png,image/jpeg,image/jpg,image/webp,.png,.jpg,.jpeg,.webp";
  return "application/pdf,.pdf,image/png,image/jpeg,image/jpg,image/webp,.png,.jpg,.jpeg,.webp";
}

export function resolveFileSubmissionType(
  file: File,
): "pdf" | "image" {
  const mime = file.type.toLowerCase();
  const name = file.name.toLowerCase();
  if (mime === "application/pdf" || name.endsWith(".pdf")) return "pdf";
  if (mime.startsWith("image/") || /\.(png|jpe?g|webp)$/.test(name)) return "image";
  throw new Error("نوع الملف غير مدعوم. استخدم PDF أو صورة.");
}

export async function readAssignmentFileAsDataUrl(
  file: File,
  expected: AssignmentSubmissionType,
): Promise<{ submissionType: "pdf" | "image"; fileUrl: string }> {
  const detected = resolveFileSubmissionType(file);

  if (expected === "pdf" && detected !== "pdf") {
    throw new Error("هذا التكليف يتطلب ملف PDF فقط.");
  }
  if (expected === "image" && detected !== "image") {
    throw new Error("هذا التكليف يتطلب صورة فقط.");
  }

  const maxBytes = detected === "pdf" ? MAX_PDF_BYTES : MAX_IMAGE_BYTES;
  if (file.size > maxBytes) {
    const maxMb = maxBytes / (1024 * 1024);
    throw new Error(`حجم الملف يجب أن يكون أقل من ${maxMb} ميجابايت`);
  }

  const fileUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("تعذر قراءة الملف"));
    reader.readAsDataURL(file);
  });

  return { submissionType: detected, fileUrl };
}

function formatDueDate(value?: string): string {
  if (!value) return "بدون موعد";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("ar-SA", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function resolveAssignmentStatus(
  item: Record<string, unknown>,
): AssignmentStatus {
  const status = pickString(item.status, item.state).toLowerCase();
  const submission = asRecord(item.submission ?? item.mySubmission);
  const grade = item.grade ?? item.score ?? submission.grade ?? submission.score;
  const hasGrade = typeof grade === "number" && Number.isFinite(grade);

  if (hasGrade || status.includes("graded") || status.includes("مقيّم")) {
    return "graded";
  }
  if (
    submission.id ||
    pickString(submission.submittedAt, item.submittedAt) ||
    status.includes("submitted") ||
    status.includes("مسلّم")
  ) {
    return "submitted";
  }
  if (status.includes("draft") || status.includes("مسودة")) return "draft";

  const due = pickString(item.dueDate, item.dueAt);
  if (due) {
    const dueDate = new Date(due);
    if (!Number.isNaN(dueDate.getTime()) && dueDate < new Date()) {
      return status.includes("overdue") || status.includes("متأخر") ? "overdue" : "overdue";
    }
  }

  if (status.includes("overdue") || status.includes("متأخر")) return "overdue";
  return "pending";
}

function isDeadlineOpen(dueIso?: string): boolean {
  if (!dueIso) return true;
  const dueDate = new Date(dueIso);
  if (Number.isNaN(dueDate.getTime())) return true;
  return dueDate.getTime() >= Date.now();
}

function buildAction(
  status: AssignmentStatus,
  deadlineOpen: boolean,
) {
  switch (status) {
    case "graded":
      return {
        actionLabel: "عرض التقييم",
        actionClassName:
          "border border-[#e2e8f0] bg-white text-[#475569] hover:bg-[#f8fafc]",
        actionIcon: "/images/student/icon-eye.svg",
      };
    case "submitted":
      return {
        actionLabel: deadlineOpen ? "مراجعة التسليم" : "تم التسليم",
        actionClassName:
          "border border-[#e2e8f0] bg-white text-[#475569] hover:bg-[#f8fafc]",
        actionIcon: "/images/student/icon-eye.svg",
      };
    case "overdue":
      return {
        actionLabel: "تسليم متأخر",
        actionClassName: "bg-[#ef4444] text-white hover:bg-[#dc2626]",
        actionIcon: "/images/student/icon-upload.svg",
      };
    case "draft":
      return {
        actionLabel: "متابعة المسودة",
        actionClassName: "bg-[#3b82f6] text-white hover:bg-[#2563eb]",
      };
    default:
      return {
        actionLabel: "رفع الحل",
        actionClassName: "bg-[#0f172a] text-white hover:bg-[#1e293b]",
        actionIcon: "/images/student/icon-upload.svg",
      };
  }
}

export function mapCourseAssignments(raw: unknown): CourseAssignment[] {
  const data = asRecord(raw);
  const items = asArray<Record<string, unknown>>(
    data.assignments ?? data.items ?? (Array.isArray(raw) ? raw : []),
  );

  return items
    .map((item) => {
      const id = pickId(item);
      const title = pickString(item.title, item.name);
      if (!id || !title) return null;

      const status = resolveAssignmentStatus(item);
      const statusStyle = STATUS_STYLES[status];
      const submissionType = normalizeSubmissionType(
        pickString(item.submissionType, item.type) || "any",
      );
      const due = pickString(item.dueDate, item.dueAt);
      const deadlineOpen = isDeadlineOpen(due || undefined);
      const action = buildAction(status, deadlineOpen);
      const submission = asRecord(item.submission ?? item.mySubmission);
      const scoreRaw = item.grade ?? item.score ?? submission.score;
      const score =
        typeof scoreRaw === "number" && Number.isFinite(scoreRaw)
          ? scoreRaw
          : undefined;

      return {
        id,
        title,
        description: pickString(item.description, item.details) || undefined,
        category: pickString(item.category, item.tag) || "تكليف",
        categoryClassName: "bg-[#fff7ed] text-[#f5a524]",
        status,
        statusLabel: statusStyle.label,
        statusClassName: statusStyle.className,
        points: pickNumber(item.maxScore, item.points, item.totalScore) || 100,
        deadline: formatDueDate(due),
        dueDateIso: due || undefined,
        isDeadlineOpen: deadlineOpen,
        type: SUBMISSION_TYPE_LABELS[submissionType] ?? submissionType,
        score,
        submittedAt: pickString(submission.submittedAt, item.submittedAt)
          ? `تم التسليم ${formatDueDate(pickString(submission.submittedAt, item.submittedAt))}`
          : undefined,
        overdueNote:
          status === "overdue"
            ? "تأخرت عن الموعد النهائي — يمكنك التسليم المتأخر"
            : undefined,
        feedbackPreview:
          pickString(item.description, item.instructions) || undefined,
        feedback: pickString(submission.feedback, item.feedback) || undefined,
        submissionType,
        submissionId: pickId(submission) || undefined,
        ...action,
      };
    })
    .filter((item) => item !== null) as CourseAssignment[];
}

export function buildAssignmentStats(assignments: CourseAssignment[]): AssignmentStats {
  const submitted = assignments.filter(
    (item) => item.status === "submitted" || item.status === "graded",
  ).length;
  const pending = assignments.filter(
    (item) => item.status === "pending" || item.status === "overdue" || item.status === "draft",
  ).length;
  const graded = assignments.filter((item) => item.score !== undefined);
  const average =
    graded.length > 0
      ? Math.round(
          graded.reduce((sum, item) => sum + (item.score ?? 0), 0) / graded.length,
        )
      : 0;

  return {
    submitted,
    pending,
    averageGrade: graded.length ? `${average}%` : "—",
  };
}

export async function fetchCourseAssignments(courseId: string): Promise<CourseAssignment[]> {
  const response = await apiClient.get<ApiEnvelope<unknown>>(
    `/courses/${courseId}/assignments`,
  );
  return mapCourseAssignments(response.data.data);
}

export async function createCourseAssignment(
  courseId: string,
  payload: CreateAssignmentPayload,
) {
  const response = await apiClient.post<ApiEnvelope<unknown>>(
    `/courses/${courseId}/assignments`,
    payload,
  );
  const mapped = mapCourseAssignments(response.data.data);
  return mapped[0] ?? null;
}

export async function submitCourseAssignment(
  courseId: string,
  assignmentId: string,
  payload: SubmitAssignmentPayload,
) {
  const response = await apiClient.post<ApiEnvelope<unknown>>(
    `/courses/${courseId}/assignments/${assignmentId}/submit`,
    payload,
  );
  return response.data;
}

export interface AssignmentSubmissionRow {
  id: string;
  studentName: string;
  studentEmail?: string;
  submissionType: string;
  fileUrl?: string;
  textAnswer?: string;
  score?: number | null;
  feedback?: string;
  submittedAt?: string;
  isLate?: boolean;
  gradedAt?: string | null;
}

export interface AssignmentSubmissionsBundle {
  assignmentId: string;
  assignmentTitle: string;
  maxScore: number;
  early: AssignmentSubmissionRow[];
  late: AssignmentSubmissionRow[];
  notSubmittedCount: number;
  summary?: Record<string, unknown>;
}

function mapSubmissionRow(raw: Record<string, unknown>): AssignmentSubmissionRow | null {
  const id = pickId(raw);
  if (!id) return null;

  const student = asRecord(raw.studentId ?? raw.student);
  const user = asRecord(student.userId ?? student.user);
  const studentName =
    pickString(user.fullName, user.name, student.name) ||
    [pickString(user.firstName), pickString(user.familyName), pickString(user.lastName)]
      .filter(Boolean)
      .join(" ") ||
    "طالب";

  const scoreRaw = raw.score ?? raw.grade;
  const score =
    typeof scoreRaw === "number" && Number.isFinite(scoreRaw) ? scoreRaw : null;

  return {
    id,
    studentName,
    studentEmail: pickString(user.email, student.email) || undefined,
    submissionType: pickString(raw.submissionType, raw.type) || "—",
    fileUrl: pickString(raw.fileUrl) || undefined,
    textAnswer: pickString(raw.textAnswer, raw.answer) || undefined,
    score,
    feedback: pickString(raw.feedback) || undefined,
    submittedAt: pickString(raw.submittedAt) || undefined,
    isLate: Boolean(raw.isLate),
    gradedAt: pickString(raw.gradedAt) || null,
  };
}

export async function fetchAssignmentSubmissions(
  courseId: string,
  assignmentId: string,
): Promise<AssignmentSubmissionsBundle> {
  const response = await apiClient.get<ApiEnvelope<unknown>>(
    `/courses/${courseId}/assignments/${assignmentId}/submissions`,
  );
  const data = asRecord(response.data.data);
  const assignment = asRecord(data.assignment);

  return {
    assignmentId: pickId(assignment) || assignmentId,
    assignmentTitle: pickString(assignment.title) || "تكليف",
    maxScore: pickNumber(assignment.maxScore) || 100,
    early: asArray<Record<string, unknown>>(data.early)
      .map(mapSubmissionRow)
      .filter((item): item is AssignmentSubmissionRow => item !== null),
    late: asArray<Record<string, unknown>>(data.late)
      .map(mapSubmissionRow)
      .filter((item): item is AssignmentSubmissionRow => item !== null),
    notSubmittedCount: asArray(data.notSubmitted).length,
    summary: asRecord(data.summary),
  };
}

export async function gradeAssignmentSubmission(
  courseId: string,
  assignmentId: string,
  submissionId: string,
  payload: { score: number; feedback?: string },
) {
  const response = await apiClient.patch<ApiEnvelope<unknown>>(
    `/courses/${courseId}/assignments/${assignmentId}/submissions/${submissionId}/grade`,
    payload,
  );
  return response.data;
}

export interface LocalAssignmentSubmission {
  assignmentId: string;
  submissionId?: string;
  submittedAt: string;
  submissionType: "text" | "pdf" | "image";
  fileName?: string;
  textAnswer?: string;
  score?: number | null;
  feedback?: string;
  attemptsUsed: number;
}

function localSubmissionKey(userId: string) {
  return `met_assignment_submissions:${userId}`;
}

export function readLocalAssignmentSubmissions(
  userId: string,
): Record<string, LocalAssignmentSubmission> {
  if (!userId || typeof localStorage === "undefined") return {};
  try {
    const raw = localStorage.getItem(localSubmissionKey(userId));
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, LocalAssignmentSubmission>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function saveLocalAssignmentSubmission(
  userId: string,
  entry: LocalAssignmentSubmission,
) {
  if (!userId || typeof localStorage === "undefined") return;
  const all = readLocalAssignmentSubmissions(userId);
  all[entry.assignmentId] = entry;
  localStorage.setItem(localSubmissionKey(userId), JSON.stringify(all));
}

export function applyLocalSubmissionState(
  assignments: CourseAssignment[],
  userId?: string,
): CourseAssignment[] {
  if (!userId) return assignments;
  const local = readLocalAssignmentSubmissions(userId);

  return assignments.map((assignment) => {
    const cached = local[assignment.id];
    if (!cached) return assignment;

    const hasGrade =
      typeof cached.score === "number" ||
      assignment.score !== undefined ||
      Boolean(cached.feedback);
    const status: AssignmentStatus = hasGrade && cached.score != null
      ? "graded"
      : "submitted";
    const statusStyle = STATUS_STYLES[status];
    const action = buildAction(status, assignment.isDeadlineOpen !== false);

    return {
      ...assignment,
      status,
      statusLabel: statusStyle.label,
      statusClassName: statusStyle.className,
      submissionId: cached.submissionId || assignment.submissionId,
      submittedFileName: cached.fileName,
      submittedText: cached.textAnswer,
      submittedAt: `تم التسليم ${formatDueDate(cached.submittedAt)}`,
      score: typeof cached.score === "number" ? cached.score : assignment.score,
      feedback: cached.feedback || assignment.feedback,
      attemptsUsed: cached.attemptsUsed || 1,
      ...action,
    };
  });
}

export function extractSubmissionFromSubmitResponse(raw: unknown): {
  submissionId?: string;
  submittedAt?: string;
  score?: number | null;
  feedback?: string;
} {
  const envelope = asRecord(raw);
  const data = asRecord(envelope.data ?? envelope);
  const submission = asRecord(data.submission ?? data);
  const scoreRaw = submission.score;
  return {
    submissionId: pickId(submission) || undefined,
    submittedAt: pickString(submission.submittedAt) || new Date().toISOString(),
    score:
      typeof scoreRaw === "number" && Number.isFinite(scoreRaw) ? scoreRaw : null,
    feedback: pickString(submission.feedback) || undefined,
  };
}

export const assignmentQueryKeys = {
  list: (courseId: string) => ["courses", courseId, "assignments"] as const,
  submissions: (courseId: string, assignmentId: string) =>
    ["courses", courseId, "assignments", assignmentId, "submissions"] as const,
};
