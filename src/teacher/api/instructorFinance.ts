import { apiClient, type ApiEnvelope } from "@/core/api/client";
import { mapInstructorFinance } from "./mappers";
import type { InstructorFinanceData } from "./types";

export async function fetchInstructorFinance(): Promise<InstructorFinanceData> {
  const response = await apiClient.get<ApiEnvelope<unknown>>("/instructor/finance");
  return mapInstructorFinance(response.data.data);
}
