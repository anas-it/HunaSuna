import { API_BASE_URL } from "../config/api";
import type { ApiResponse } from "../types/api";

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: Record<string, unknown>;
  token?: string | null;
};

export async function apiRequest<T>(path: string, options: RequestOptions = {}) {
  const headers: Record<string, string> = {
    Accept: "application/json"
  };

  if (options.body) {
    headers["Content-Type"] = "application/json";
  }

  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: options.method ?? "GET",
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined
    });
  } catch {
    throw new Error("Не удалось подключиться к сайту. Проверьте, что Next.js запущен и телефон в той же сети.");
  }

  const data = (await response.json()) as ApiResponse<T>;

  if (!data.ok) {
    throw new Error(data.message || "Ошибка запроса");
  }

  return data;
}
