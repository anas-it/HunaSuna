import { API_BASE_URL } from "../config/api";
import type { ApiResponse } from "../types/api";

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: Record<string, unknown>;
  token?: string | null;
};

const REQUEST_TIMEOUT_MS = 15000;

let unauthorizedHandler: (() => void | Promise<void>) | null = null;

export function setUnauthorizedHandler(handler: (() => void | Promise<void>) | null) {
  unauthorizedHandler = handler;
}

function currentTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return undefined;
  }
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}) {
  const headers: Record<string, string> = {
    Accept: "application/json"
  };
  const timezone = currentTimezone();

  if (timezone) {
    headers["X-HunaSuna-Timezone"] = timezone;
  }

  if (options.body) {
    headers["Content-Type"] = "application/json";
  }

  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  let response: Response;
  const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
  const timeoutId = controller ? setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS) : null;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: options.method ?? "GET",
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
      signal: controller?.signal
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("Сайт не ответил за 15 секунд. Если приложение открыто через tunnel или телефон в другой сети, API должен быть доступен по публичному HTTPS-адресу.");
    }

    throw new Error("Не удалось подключиться к сайту. Проверьте адрес API, интернет на телефоне и что Next.js запущен.");
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }

  const contentType = response.headers.get("content-type") ?? "";
  let data: ApiResponse<T> | null = null;

  if (contentType.includes("application/json")) {
    try {
      data = (await response.json()) as ApiResponse<T>;
    } catch {
      data = null;
    }
  }

  if (response.status === 401) {
    await unauthorizedHandler?.();
    const message = data && "message" in data ? data.message : null;
    throw new Error(message || "Сессия завершена. Войдите снова.");
  }

  if (!data) {
    throw new Error(response.ok ? "Пустой ответ сервера" : `Ошибка сервера: ${response.status}`);
  }

  if (!data.ok) {
    throw new Error(data.message || "Ошибка запроса");
  }

  return data;
}
