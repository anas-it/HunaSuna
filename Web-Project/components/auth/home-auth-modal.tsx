"use client";

import Link from "next/link";
import { KeyRound, LogIn, UserPlus, X } from "lucide-react";
import { useEffect, useId, useState, type InputHTMLAttributes } from "react";
import { useFormStatus } from "react-dom";
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
              <div>
                <h2 id={titleId} className="home-auth-title">
                  {title}
                </h2>
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
      <form action={registerAction} autoComplete="off" className="home-auth-form">
        <RequiredRegisterInput
          autoComplete="username"
          emptyMessage="Введите логин"
          name="login"
          placeholder="Логин *"
        />
        <input
          autoComplete="tel"
          className="home-auth-input"
          name="phone"
          placeholder="Телефон"
        />
        <input
          autoComplete="email"
          className="home-auth-input"
          name="email"
          placeholder="Email"
          type="email"
        />
        <RequiredRegisterInput
          autoComplete="new-password"
          emptyMessage="Введите пароль"
          minLength={4}
          name="password"
          placeholder="Пароль * (минимум 4 символа)"
          type="password"
        />
        <RequiredRegisterInput
          autoComplete="new-password"
          emptyMessage="Подтвердите пароль"
          minLength={4}
          name="confirmPassword"
          placeholder="Подтверждение пароля *"
          type="password"
        />
        <RequiredRegisterInput
          autoComplete="off"
          emptyMessage="Введите секретный вопрос"
          minLength={3}
          name="secretQuestion"
          placeholder="Секретный вопрос *"
        />
        <RequiredRegisterInput
          autoComplete="new-password"
          emptyMessage="Введите секретный ответ"
          minLength={2}
          name="secretAnswer"
          placeholder="Секретный ответ *"
        />
        <RegisterSubmitButton />
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

type RequiredRegisterInputProps = InputHTMLAttributes<HTMLInputElement> & {
  emptyMessage: string;
};

function RequiredRegisterInput({
  emptyMessage,
  minLength,
  ...props
}: RequiredRegisterInputProps) {
  const [error, setError] = useState("");

  return (
    <div className="home-auth-field">
      <input
        {...props}
        aria-invalid={Boolean(error)}
        className={`home-auth-input${error ? " home-auth-input-error" : ""}`}
        minLength={minLength}
        onInput={(event) => {
          if (event.currentTarget.validity.valid) {
            setError("");
          }
        }}
        onInvalid={(event) => {
          event.preventDefault();
          setError(
            event.currentTarget.validity.valueMissing
              ? emptyMessage
              : `Минимум ${minLength} символа`
          );
        }}
        required
      />
      {error ? <span className="home-auth-field-error">{error}</span> : null}
    </div>
  );
}

function RegisterSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button className="w-full" disabled={pending} type="submit">
      <UserPlus className="mr-2 h-4 w-4" />
      {pending ? "Регистрация..." : "Зарегистрироваться"}
    </Button>
  );
}
