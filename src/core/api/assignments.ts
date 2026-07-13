import { apiClient, type ApiEnvelope } from "./client";
import { asArray, asRecord, pickId, pickNumber, pickString } from "./utils";

export type AssignmentStatus =
  | "pending"
  | "submitted"
  | "graded"
  | "draft"
  | "overdue";

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
  submissionType?: string;
}

export interface AssignmentStats {
  submitted: number;
  averageGrade: string;
  pending: number;
}

export interface CreateAssignmentPayload {
  title: string;
  description?: string;
  submissionType?: "any" | "pdf" | "image" | "text";
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

const SUBMISSION_TYPE_LABELS: Record<string, string> = {
  any: "أي نوع",
  pdf: "ملف PDF",
  image: "صورة",
  text: "نص",
};

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
  const grade = pickNumber(item.grade, item.score, submission.grade, submission.score);

  if (grade > 0 || status.includes("graded") || status.includes("مقيّم")) {
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

function buildAction(status: AssignmentStatus) {
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
        actionLabel: "تم التسليم",
        actionClassName:
          "border border-[#e2e8f0] bg-white text-[#475569] hover:bg-[#f8fafc]",
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
      const submissionType = pickString(item.submissionType, item.type) || "any";
      const action = buildAction(status);
      const score = pickNumber(item.grade, item.score, asRecord(item.submission).score);
      const due = pickString(item.dueDate, item.dueAt);

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
        type: SUBMISSION_TYPE_LABELS[submissionType] ?? submissionType,
        score: score || undefined,
        submittedAt: pickString(
          asRecord(item.submission).submittedAt,
          item.submittedAt,
        )
          ? `تم التسليم ${formatDueDate(pickString(asRecord(item.submission).submittedAt, item.submittedAt))}`
          : undefined,
        overdueNote:
          status === "overdue"
            ? "تأخرت عن الموعد النهائي — يمكنك التسليم المتأخر"
            : undefined,
        feedbackPreview:
          pickString(item.description, item.instructions) || undefined,
        submissionType,
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

export const assignmentQueryKeys = {
  list: (courseId: string) => ["courses", courseId, "assignments"] as const,
};
