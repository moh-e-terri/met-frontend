import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import {
  clearAuthToken,
  getAuthToken,
  renewAccessToken,
  shouldClearTokenOnUnauthorized,
} from "@/core/auth/tokenStorage";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://met-efgo.onrender.com/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

export interface ApiEnvelope<T> {
  status?: string;
  message?: string;
  data: T;
  code?: string;
  errors?: unknown[];
}

export class ApiError extends Error {
  status?: number;
  code?: string;

  constructor(message: string, options?: { status?: number; code?: string }) {
    super(message);
    this.name = "ApiError";
    this.status = options?.status;
    this.code = options?.code;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

let refreshPromise: Promise<string | null> | null = null;

function queueTokenRenewal() {
  if (!refreshPromise) {
    refreshPromise = renewAccessToken().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

apiClient.interceptors.request.use(
  (config) => {
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const requestUrl = String(error.config?.url || "");
    const isAuthCredentialRequest =
      requestUrl.includes("/auth/login") ||
      requestUrl.includes("/auth/register") ||
      requestUrl.includes("/auth/refresh-token");

    const original = error.config as RetriableConfig | undefined;
    const status = error.response?.status;

    if (
      status === 401 &&
      original &&
      !original._retry &&
      !isAuthCredentialRequest &&
      shouldClearTokenOnUnauthorized()
    ) {
      original._retry = true;
      const renewed = await queueTokenRenewal();
      if (renewed) {
        original.headers = original.headers ?? {};
        original.headers.Authorization = `Bearer ${renewed}`;
        return apiClient.request(original);
      }
      clearAuthToken();
    }

    const data = error.response?.data as
      | { message?: string; error?: string; code?: string; errorCode?: string }
      | undefined;
    const message =
      data?.message || data?.error || error.message || "تعذر الاتصال بالخادم";
    const messageText = String(message);
    const explicitCode =
      data?.code ||
      data?.errorCode ||
      (typeof data?.error === "string" && data.error.length < 64 ? data.error : undefined);
    const code =
      explicitCode ||
      (messageText.includes("REFUND_WINDOW") ||
      messageText.includes("انتهت مدة الاسترداد") ||
      messageText.includes("مدة الاسترداد")
        ? "REFUND_WINDOW_EXPIRED"
        : undefined);

    return Promise.reject(
      new ApiError(messageText, {
        status,
        code: code ? String(code) : undefined,
      }),
    );
  },
);
