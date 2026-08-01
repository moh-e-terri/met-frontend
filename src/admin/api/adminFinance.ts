import { apiClient, type ApiEnvelope } from "@/core/api/client";
import { asArray, asRecord, pickId, pickNumber, pickString } from "@/core/api/utils";
import { buildPaginatedResult, type PaginatedResult } from "@/core/api/pagination";
import { mapAdminFinancePayments, type AdminFinancePayment } from "./mappers";

export interface ReleaseInstructorPaymentPayload {
  amount: number;
  note?: string;
  /** يُضمَّن في الملاحظة فقط — الـ API لا يقبل courseId في الجسم. */
  courseId?: string;
}

export interface CancelInstructorPaymentPayload {
  amount: number;
  note?: string;
  /** يُضمَّن في الملاحظة فقط — الـ API لا يقبل courseId في الجسم. */
  courseId?: string;
}

function buildFinanceNote(note: string | undefined, courseId: string | undefined): string | undefined {
  const base = note?.trim() || "";
  if (!courseId) return base || undefined;
  const tagged = base ? `${base} [courseId:${courseId}]` : `courseId:${courseId}`;
  return tagged;
}

export interface AdminInstructorFinanceCourse {
  courseId: string;
  title: string;
  enrolledCount: number;
  totalIncome: number;
  earnedMET: number;
  reservedMET: number;
  releasedMET: number;
}

export interface AdminInstructorFinanceRow {
  instructorId: string;
  name: string;
  email?: string;
  paypalAccount?: string;
  coursesCount: number;
  totalEarnedMET: number;
  totalEarnedUSD: number;
  totalReservedMET: number;
  totalReservedUSD: number;
  totalReleasedMET: number;
  courses: AdminInstructorFinanceCourse[];
}

export interface FetchAdminInstructorFinanceParams {
  page?: number;
  limit?: number;
}

export const FINANCE_INSTRUCTORS_PAGE_SIZE = 10;

function personName(raw: Record<string, unknown>): string {
  const built = [raw.firstName, raw.secondName, raw.middleName, raw.familyName, raw.lastName]
    .map((part) => pickString(part))
    .filter(Boolean)
    .join(" ");
  return pickString(raw.fullName, raw.name) || built || pickString(raw.email) || "مدرّس";
}

export function mapAdminInstructorFinanceRows(raw: unknown): AdminInstructorFinanceRow[] {
  const items = Array.isArray(raw)
    ? (raw as Record<string, unknown>[])
    : asArray<Record<string, unknown>>(
        asRecord(raw).payments ??
          asRecord(raw).items ??
          asRecord(raw).instructorPayments ??
          asRecord(raw).data,
      );

  return items.map((item, index) => {
    const instructor = asRecord(item.instructor ?? item.lecturer);
    const instructorId =
      pickString(item.instructorId) || pickId(instructor) || `instructor-${index}`;
    const courses = asArray<Record<string, unknown>>(item.courses).map((course, courseIndex) => {
      const earned = pickNumber(course.earnedMET, course.earned);
      const reserved = pickNumber(course.reservedMET, course.reserved);
      return {
        courseId: pickString(course.courseId) || pickId(course) || `course-${index}-${courseIndex}`,
        title: pickString(course.title, course.name) || "مقرر",
        enrolledCount: pickNumber(course.enrolledCount, course.students),
        totalIncome: pickNumber(course.totalIncome, course.totalIncomeMET),
        earnedMET: earned,
        reservedMET: reserved,
        releasedMET: pickNumber(course.releasedMET, Math.max(earned - reserved, 0)),
      };
    });

    return {
      instructorId,
      name: personName(instructor) || pickString(item.instructorName) || "مدرّس",
      email: pickString(instructor.email) || undefined,
      paypalAccount: pickString(item.paypalAccount) || undefined,
      coursesCount: courses.length || pickNumber(item.coursesCount),
      totalEarnedMET: pickNumber(item.totalEarnedMET, item.totalEarnedUSD, item.amount),
      totalEarnedUSD: pickNumber(item.totalEarnedUSD),
      totalReservedMET: pickNumber(item.totalReservedMET, item.reservedMET),
      totalReservedUSD: pickNumber(item.totalReservedUSD),
      totalReleasedMET: pickNumber(item.totalReleasedMET),
      courses,
    };
  });
}

export function matchesFinanceInstructor(
  row: AdminInstructorFinanceRow,
  focus: {
    instructorId?: string | null;
    userId?: string | null;
    email?: string | null;
    name?: string | null;
  },
): boolean {
  const instructorId = focus.instructorId?.trim();
  const userId = focus.userId?.trim();
  const email = focus.email?.trim().toLowerCase();
  const name = focus.name?.trim().toLowerCase();

  if (instructorId && row.instructorId === instructorId) return true;
  if (userId && row.instructorId === userId) return true;
  if (email && row.email?.toLowerCase() === email) return true;
  if (name && row.name.trim().toLowerCase() === name) return true;
  return false;
}

export async function fetchAdminFinancePayments(): Promise<AdminFinancePayment[]> {
  const response = await apiClient.get<ApiEnvelope<unknown>>("/admin/finance/payments");
  const body = response.data.data ?? response.data;
  return mapAdminFinancePayments(body);
}

export async function fetchAdminFinancePaymentsRaw(): Promise<Array<Record<string, unknown>>> {
  const response = await apiClient.get<ApiEnvelope<unknown>>("/admin/finance/payments");
  const body = asRecord(response.data.data ?? response.data);
  return asArray(
    body.payments ?? body.items ?? (Array.isArray(response.data.data) ? response.data.data : []),
  );
}

export async function fetchAdminInstructorFinance(
  params: FetchAdminInstructorFinanceParams = {},
): Promise<PaginatedResult<AdminInstructorFinanceRow>> {
  const page = params.page ?? 1;
  const limit = params.limit ?? FINANCE_INSTRUCTORS_PAGE_SIZE;
  const response = await apiClient.get<ApiEnvelope<unknown>>("/admin/finance/payments", {
    params: { page, limit },
  });
  const body = response.data.data ?? response.data;
  const items = mapAdminInstructorFinanceRows(body);
  return buildPaginatedResult(items, response.data, page, limit);
}

/** Scan finance pages until the focused instructor is found. */
export async function locateAdminInstructorFinancePage(
  focus: {
    instructorId?: string | null;
    userId?: string | null;
    email?: string | null;
    name?: string | null;
  },
  limit = FINANCE_INSTRUCTORS_PAGE_SIZE,
): Promise<{ page: number; row: AdminInstructorFinanceRow } | null> {
  const first = await fetchAdminInstructorFinance({ page: 1, limit });
  const firstMatch = first.items.find((row) => matchesFinanceInstructor(row, focus));
  if (firstMatch) return { page: 1, row: firstMatch };

  for (let page = 2; page <= first.pagination.totalPages; page += 1) {
    const result = await fetchAdminInstructorFinance({ page, limit });
    const match = result.items.find((row) => matchesFinanceInstructor(row, focus));
    if (match) return { page, row: match };
  }

  return null;
}

export async function releaseInstructorPayment(
  instructorId: string,
  payload: ReleaseInstructorPaymentPayload,
) {
  const response = await apiClient.post<ApiEnvelope<unknown>>(
    `/admin/finance/instructors/${instructorId}/release`,
    {
      amount: payload.amount,
      note: buildFinanceNote(payload.note, payload.courseId),
    },
  );
  return response.data;
}

export async function cancelInstructorPayment(
  instructorId: string,
  payload: CancelInstructorPaymentPayload,
) {
  const response = await apiClient.post<ApiEnvelope<unknown>>(
    `/admin/finance/instructors/${instructorId}/cancel`,
    {
      amount: payload.amount,
      note: buildFinanceNote(payload.note, payload.courseId),
    },
  );
  return response.data;
}
