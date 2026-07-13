import { apiClient, type ApiEnvelope } from "@/core/api/client";
import { asArray, asRecord } from "@/core/api/utils";
import { mapAdminFinancePayments, type AdminFinancePayment } from "./mappers";

export interface ReleaseInstructorPaymentPayload {
  amount: number;
  note?: string;
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

export async function releaseInstructorPayment(
  instructorId: string,
  payload: ReleaseInstructorPaymentPayload,
) {
  const response = await apiClient.post<ApiEnvelope<unknown>>(
    `/admin/finance/instructors/${instructorId}/release`,
    payload,
  );
  return response.data;
}
