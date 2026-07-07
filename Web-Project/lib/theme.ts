export type Theme = "light" | "dark";

export const THEME_COOKIE = "hunasuna_theme";

export function themeFromCookie(value: string | undefined): Theme {
  return value === "dark" ? "dark" : "light";
}
