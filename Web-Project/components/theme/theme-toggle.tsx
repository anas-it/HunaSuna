"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { THEME_COOKIE, type Theme } from "@/lib/theme";
import { cn } from "@/lib/utils";

type ThemeToggleProps = {
  className?: string;
  compact?: boolean;
  initialTheme?: Theme;
};

const THEME_CHANGE_EVENT = "hunasuna-theme-change";

function saveTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.cookie = `${THEME_COOKIE}=${theme}; Path=/; Max-Age=31536000; SameSite=Lax`;
  window.localStorage.setItem(THEME_COOKIE, theme);
  window.dispatchEvent(
    new CustomEvent<Theme>(THEME_CHANGE_EVENT, {
      detail: theme
    })
  );
}

export function ThemeToggle({
  className,
  compact = false,
  initialTheme = "light"
}: ThemeToggleProps) {
  const [theme, setTheme] = useState<Theme>(initialTheme);

  useEffect(() => {
    function handleThemeChange(event: Event) {
      const nextTheme = (event as CustomEvent<Theme>).detail;

      if (nextTheme === "light" || nextTheme === "dark") {
        setTheme(nextTheme);
      }
    }

    window.addEventListener(THEME_CHANGE_EVENT, handleThemeChange);

    return () => window.removeEventListener(THEME_CHANGE_EVENT, handleThemeChange);
  }, []);

  function chooseTheme(nextTheme: Theme) {
    setTheme(nextTheme);
    saveTheme(nextTheme);
  }

  return (
    <div
      aria-label="Тема сайта"
      className={cn("theme-toggle", compact && "theme-toggle-compact", className)}
      role="group"
    >
      <button
        aria-pressed={theme === "light"}
        className="theme-toggle-button"
        onClick={() => chooseTheme("light")}
        type="button"
      >
        <Sun className="h-4 w-4" />
        <span>Светлая</span>
      </button>
      <button
        aria-pressed={theme === "dark"}
        className="theme-toggle-button"
        onClick={() => chooseTheme("dark")}
        type="button"
      >
        <Moon className="h-4 w-4" />
        <span>Темная</span>
      </button>
    </div>
  );
}
