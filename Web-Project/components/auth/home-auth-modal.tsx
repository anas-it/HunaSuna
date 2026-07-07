"use client";

import Link from "next/link";
import { KeyRound, LogIn, UserPlus, X } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { loginAction, registerAction } from "@/app/actions";
import { Notice } from "@/components/layout/notice";
import { Button } from "@/components/ui/button";

type AuthMode = "login" | "register";

type HomeAuthModalProps = {
  error?: string;
  initialMode?: AuthMode | null;
  message?: string;
};

function modeFromUrl() {
  if (typeof window === "undefined") {
    return null;
  }

  const auth = new URLSearchParams(window.location.search).get("auth");

  return auth === "login" || auth === "register" ? auth : null;
}

export function HomeAuthModal({
  error,
  initialMode = null,
  message
}: HomeAuthModalProps) {
  const titleId = useId();
  const [mode, setMode] = useState<AuthMode | null>(initialMode);

  useEffect(() => {
    function handlePopState() {
      setMode(modeFromUrl());
    }

    window.addEventListener("popstate", handlePopState);

    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    if (!mode) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMode(null);
        window.history.pushState(null, "", "/");
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [mode]);

  function updateUrl(nextMode: AuthMode | null) {
    const nextUrl = nextMode ? `/?auth=${nextMode}` : "/";
    window.history.pushState(null, "", nextUrl);
  }

  function openModal(nextMode: AuthMode) {
    setMode(nextMode);
    updateUrl(nextMode);
  }

  function closeModal() {
    setMode(null);
    updateUrl(null);
  }

  const isLogin = mode === "login";
  const shouldShowModalNotice = Boolean(mode && mode === initialMode);
  const shouldShowHomeNotice = !mode && Boolean(error || message);
  const title = isLogin ? "Вход в профиль" : "Регистрация";
  const description = isLogin
    ? null
    : "Создайте аккаунт для учета своих записей.";
  const HeaderIcon = isLogin ? null : UserPlus;

  return (
    <>
      <div className="home-auth-shell">
        <div className="home-actions flex flex-wrap gap-3">
          <Button onClick={() => openModal("login")} type="button">
            <LogIn className="mr-2 h-4 w-4" />
            Войти
          </Button>
          <Button
            onClick={() => openModal("register")}
            type="button"
            variant="secondary"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Регистрация
          </Button>
        </div>

        {shouldShowHomeNotice ? (
          <div className="home-auth-status">
            <Notice error={error} message={message} />
          </div>
        ) : null}
      </div>

      {mode ? (
        <div
          className="home-auth-overlay"
          onMouseDown={closeModal}
          role="presentation"
        >
          <section
            aria-labelledby={titleId}
            aria-modal="true"
            className="home-auth-card"
            onMouseDown={(event) => event.stopPropagation()}
            role="dialog"
          >
            <div className={`home-auth-header${isLogin ? " home-auth-header-plain" : ""}`}>
              {HeaderIcon ? (
                <span className="home-auth-icon" aria-hidden="true">
                  <HeaderIcon className="h-5 w-5" />
                </span>
              ) : null}
              <div>
                <h2 id={titleId} className="home-auth-title">
                  {title}
                </h2>
                {description ? (
                  <p className="home-auth-description">{description}</p>
                ) : null}
              </div>
              <button
                aria-label="Закрыть окно"
                className="home-auth-close"
                onClick={closeModal}
                type="button"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {shouldShowModalNotice ? (
              <Notice error={error} message={message} />
            ) : null}

            {isLogin ? (
              <LoginForm onSwitch={() => openModal("register")} />
            ) : (
              <RegisterForm onSwitch={() => openModal("login")} />
            )}
          </section>
        </div>
      ) : null}
    </>
  );
}

function LoginForm({ onSwitch }: { onSwitch: () => void }) {
  return (
    <>
      <form action={loginAction} className="home-auth-form">
        <input
          autoComplete="username"
          className="home-auth-input"
          name="login"
          placeholder="Логин"
          required
        />
        <input
          autoComplete="current-password"
          className="home-auth-input"
          minLength={4}
          name="password"
          placeholder="Пароль"
          required
          type="password"
        />
        <label className="home-auth-check">
          <input name="remember" type="checkbox" />
          <span>Сохранить вход</span>
        </label>
        <Button className="w-full">
          <LogIn className="mr-2 h-4 w-4" />
          Войти
        </Button>
      </form>

      <div className="home-auth-footer">
        <Link className="home-auth-link" href="/forgot-password">
          Забыли пароль?
        </Link>
        <button className="home-auth-link-button" onClick={onSwitch} type="button">
          Регистрация
        </button>
      </div>
    </>
  );
}

function RegisterForm({ onSwitch }: { onSwitch: () => void }) {
  return (
    <>
      <form action={registerAction} className="home-auth-form">
        <input
          autoComplete="username"
          className="home-auth-input"
          name="login"
          placeholder="Логин"
          required
        />
        <input
          autoComplete="tel"
          className="home-auth-input"
          name="phone"
          placeholder="Телефон, если есть"
        />
        <input
          autoComplete="email"
          className="home-auth-input"
          name="email"
          placeholder="Email, если есть"
          type="email"
        />
        <input
          autoComplete="new-password"
          className="home-auth-input"
          minLength={4}
          name="password"
          placeholder="Пароль минимум 4 символа"
          required
          type="password"
        />
        <input
          autoComplete="new-password"
          className="home-auth-input"
          minLength={4}
          name="confirmPassword"
          placeholder="Подтверждение пароля"
          required
          type="password"
        />
        <input
          className="home-auth-input"
          name="secretQuestion"
          placeholder="Секретный вопрос"
          required
        />
        <input
          className="home-auth-input"
          name="secretAnswer"
          placeholder="Секретный ответ"
          required
        />
        <Button className="w-full">
          <UserPlus className="mr-2 h-4 w-4" />
          Зарегистрироваться
        </Button>
      </form>

      <div className="home-auth-footer">
        <span className="home-auth-muted">
          <KeyRound className="h-4 w-4" />
          Секретный вопрос нужен для восстановления пароля.
        </span>
        <button className="home-auth-link-button" onClick={onSwitch} type="button">
          Уже есть аккаунт
        </button>
      </div>
    </>
  );
}
