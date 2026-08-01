import { apiClient, type ApiEnvelope } from "@/core/api/client";
import { asArray, asRecord, pickId, pickNumber, pickString } from "@/core/api/utils";

export type MetTransactionType = "credit" | "debit" | "refund" | "purchase" | "unknown";

export interface MetTransaction {
  id: string;
  title: string;
  date: string;
  amount: string;
  amountValue: number;
  type: MetTransactionType;
  status: "completed" | "pending" | "failed";
}

export interface MetHistoryResult {
  currentMet: number;
  currentUsd?: number;
  transactions: MetTransaction[];
}

function mapTransactionType(raw: string): MetTransactionType {
  const value = raw.toLowerCase();
  if (value.includes("refund") || value.includes("استرداد")) return "refund";
  if (value.includes("credit") || value.includes("add") || value.includes("شحن")) return "credit";
  if (value.includes("debit") || value.includes("deduct") || value.includes("خصم")) return "debit";
  if (value.includes("purchase") || value.includes("enroll") || value.includes("اشتراك")) return "purchase";
  return "unknown";
}

function formatMetAmount(value: number, type: MetTransactionType): string {
  const prefix = type === "credit" || type === "refund" ? "+" : "-";
  return `${prefix}${Math.abs(value)} MET`;
}

function mapTransaction(raw: Record<string, unknown>, index: number): MetTransaction | null {
  const id = pickId(raw) || `tx-${index}`;
  const signedAmount = pickNumber(raw.amount, raw.metAmount, raw.points, raw.value);
  const amountValue = Math.abs(signedAmount);
  let type = mapTransactionType(
    pickString(raw.type, raw.operation, raw.action, raw.category),
  );

  // Prefer API type; fall back to signed amount when type is missing/unknown
  if (type === "unknown" && signedAmount !== 0) {
    type = signedAmount < 0 ? "debit" : "credit";
  }

  const course = asRecord(raw.courseId ?? raw.course);
  const title =
    pickString(
      raw.title,
      raw.description,
      course.title,
      raw.courseTitle,
      raw.courseName,
      raw.reason,
    ) || "عملية MET";

  const dateRaw = pickString(raw.createdAt, raw.date, raw.timestamp);
  const date = dateRaw
    ? new Date(dateRaw).toLocaleDateString("ar-SA", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "—";

  const statusRaw = pickString(raw.status).toLowerCase();
  const status: MetTransaction["status"] =
    statusRaw.includes("pending") || statusRaw.includes("قيد")
      ? "pending"
      : statusRaw.includes("fail") || statusRaw.includes("فشل")
        ? "failed"
        : "completed";

  return {
    id,
    title,
    date,
    amount: amountValue ? formatMetAmount(amountValue, type) : "—",
    amountValue,
    type,
    status,
  };
}

export async function fetchMetHistory(): Promise<MetHistoryResult> {
  const response = await apiClient.get<ApiEnvelope<unknown>>("/student/met/history");
  const data = asRecord(response.data.data);

  const transactions = asArray<Record<string, unknown>>(
    data.transactions ?? data.history ?? data.items,
  )
    .map(mapTransaction)
    .filter((item): item is MetTransaction => item !== null);

  return {
    currentMet: pickNumber(data.currentMet, data.metBalance, data.balance, data.metPoints),
    currentUsd: pickNumber(data.currentUSD, data.currentUsd, data.usdBalance) || undefined,
    transactions,
  };
}

export const metHistoryQueryKeys = {
  all: (userId?: string) => ["student", "met", "history", userId ?? "guest"] as const,
};
