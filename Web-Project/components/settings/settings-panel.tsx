"use client";

import { useState, useTransition } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";

type SensitiveData = {
  email: string | null;
  phone: string | null;
};

type RevealSensitiveDataResult =
  | {
      ok: true;
      data: SensitiveData;
    }
  | {
      ok: false;
      error: string;
    };

type SettingsPanelProps = {
  deleteAccountAction: (formData: FormData) => void | Promise<void>;
  hasEmail: boolean;
  revealSensitiveDataAction: (formData: FormData) => Promise<RevealSensitiveDataResult>;
  updateEmailAction: (formData: FormData) => void | Promise<void>;
  updatePasswordAction: (formData: FormData) => void | Promise<void>;
  updateProfileAction: (formData: FormData) => void | Promise<void>;
  user: {
    firstName: string | null;
    lastName: string | null;
    secretQuestion: string | null;
  };
};

type SensitiveFieldProps = {
  hiddenText: string;
  isPending: boolean;
  label: string;
  onToggle: () => void;
  value: string | null;
  visible: boolean;
};

function SensitiveField({
  hiddenText,
  isPending,
  label,
  onToggle,
  value,
  visible
}: SensitiveFieldProps) {
  const Icon = visible ? EyeOff : Eye;
  const buttonLabel = visible ? "Скрыть" : "Показать";

  return (
    <div className="grid gap-2 text-sm font-medium">
      <span>{label}</span>
      <div className="flex h-10 items-center rounded-md border border-[#cbd5e1] bg-[#f8fafc]">
        <span className="min-w-0 flex-1 truncate px-3 text-[#1f2937]">
          {visible ? value || "Не указан" : hiddenText}
        </span>
        <button
          aria-label={`${buttonLabel}: ${label}`}
          className="inline-flex h-10 w-10 cursor-pointer items-center justify-center border-l border-[#d8dee8] text-[#64748b] transition-colors hover:bg-[#eef2f6] hover:text-[#1f2937] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#256f6c] disabled:cursor-default disabled:opacity-60"
          disabled={isPending}
          onClick={onToggle}
          title={buttonLabel}
          type="button"
        >
          <Icon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export function SettingsPanel({
  deleteAccountAction,
  hasEmail,
  revealSensitiveDataAction,
  updateEmailAction,
  updatePasswordAction,
  updateProfileAction,
  user
}: SettingsPanelProps) {
  const [modal, setModal] = useState<"password" | "email" | "reveal" | "delete" | null>(null);
  const [sensitiveData, setSensitiveData] = useState<SensitiveData | null>(null);
  const [revealError, setRevealError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const sensitiveVisible = Boolean(sensitiveData);

  function toggleSensitiveData() {
    if (sensitiveVisible) {
      setSensitiveData(null);
      setRevealError(null);
      return;
    }

    setRevealError(null);
    setModal("reveal");
  }

  function revealSensitiveData(formData: FormData) {
    setRevealError(null);

    startTransition(() => {
      void revealSensitiveDataAction(formData).then((result) => {
        if (result.ok) {
          setSensitiveData(result.data);
          setModal(null);
          return;
        }

        setRevealError(result.error);
      });
    });
  }

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <form
          action={updateProfileAction}
          className="grid gap-4 rounded-lg border border-[#d8dee8] bg-white p-6"
        >
          <h2 className="text-lg font-semibold">Личные данные</h2>
          <label className="grid gap-2 text-sm font-medium">
            Имя
            <input
              className="rounded-md border border-[#cbd5e1] px-3 py-2"
              defaultValue={user.firstName ?? ""}
              name="firstName"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium">
            Фамилия
            <input
              className="rounded-md border border-[#cbd5e1] px-3 py-2"
              defaultValue={user.lastName ?? ""}
              name="lastName"
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <SensitiveField
              hiddenText={hasEmail ? "Скрыто" : "E-mail не указан"}
              isPending={isPending}
              label="E-mail"
              onToggle={toggleSensitiveData}
              value={sensitiveData?.email ?? null}
              visible={sensitiveVisible}
            />
            <SensitiveField
              hiddenText="Скрыто"
              isPending={isPending}
              label="Мобильный номер"
              onToggle={toggleSensitiveData}
              value={sensitiveData?.phone ?? null}
              visible={sensitiveVisible}
            />
          </div>
          <div className="flex justify-end">
            <Button>Сохранить изменения</Button>
          </div>
        </form>

        <section className="h-fit rounded-lg border border-[#d8dee8] bg-white p-6">
          <h2 className="text-lg font-semibold">Безопасность</h2>
          <p className="mt-1 text-sm text-[#64748b]">
            Пароль и E-mail меняются отдельно.
          </p>
          <div className="mt-5 grid gap-3">
            <Button type="button" variant="secondary" onClick={() => setModal("password")}>
              Сменить пароль
            </Button>
            <Button type="button" variant="secondary" onClick={() => setModal("email")}>
              Сменить E-mail
            </Button>
            <Button
              className="border-[#f3c2bd] text-[#b42318] hover:bg-[#fff5f5]"
              type="button"
              variant="secondary"
              onClick={() => setModal("delete")}
            >
              Удалить аккаунт
            </Button>
          </div>
        </section>
      </div>

      {modal === "password" ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4"
          onClick={() => setModal(null)}
        >
          <section
            aria-modal="true"
            className="w-full max-w-md rounded-lg border border-[#d8dee8] bg-white p-5 shadow-xl"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
          >
            <h3 className="text-lg font-semibold text-[#1f2937]">Смена пароля</h3>
            <form action={updatePasswordAction} className="mt-5 grid gap-4">
              <input
                className="rounded-md border border-[#cbd5e1] px-3 py-2"
                name="currentPassword"
                placeholder="Текущий пароль"
                required
                type="password"
              />
              <input
                className="rounded-md border border-[#cbd5e1] px-3 py-2"
                minLength={4}
                name="newPassword"
                placeholder="Новый пароль"
                required
                type="password"
              />
              <div className="flex justify-end gap-3">
                <Button type="button" variant="secondary" onClick={() => setModal(null)}>
                  Отмена
                </Button>
                <Button>Сохранить</Button>
              </div>
            </form>
          </section>
        </div>
      ) : null}

      {modal === "email" ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4"
          onClick={() => setModal(null)}
        >
          <section
            aria-modal="true"
            className="w-full max-w-md rounded-lg border border-[#d8dee8] bg-white p-5 shadow-xl"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
          >
            <h3 className="text-lg font-semibold text-[#1f2937]">Сменить E-mail</h3>
            <p className="mt-2 text-sm leading-6 text-[#64748b]">
              Введите текущий E-mail и новый E-mail.
            </p>
            <form action={updateEmailAction} className="mt-5 grid gap-4">
              <input
                className="rounded-md border border-[#cbd5e1] px-3 py-2"
                name="currentEmail"
                placeholder="Текущий E-mail"
                required={hasEmail}
                type="email"
              />
              <input
                className="rounded-md border border-[#cbd5e1] px-3 py-2"
                name="newEmail"
                placeholder="Новый E-mail"
                required
                type="email"
              />
              <div className="flex justify-end gap-3">
                <Button type="button" variant="secondary" onClick={() => setModal(null)}>
                  Отмена
                </Button>
                <Button>Сохранить</Button>
              </div>
            </form>
          </section>
        </div>
      ) : null}

      {modal === "delete" ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4"
          onClick={() => setModal(null)}
        >
          <section
            aria-modal="true"
            className="w-full max-w-md rounded-lg border border-[#d8dee8] bg-white p-5 shadow-xl"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
          >
            <h3 className="text-lg font-semibold text-[#1f2937]">Удаление аккаунта</h3>
            <p className="mt-2 text-sm leading-6 text-[#64748b]">
              Аккаунт, контакты, записи и активные сессии будут удалены. Это действие нельзя отменить через интерфейс.
            </p>
            <form action={deleteAccountAction} className="mt-5 grid gap-4">
              <div className="grid gap-2 rounded-md border border-[#d8dee8] bg-[#f8fafc] p-3 text-sm">
                <span className="font-medium text-[#1f2937]">Секретный вопрос</span>
                <p className="break-words text-[#475569]">
                  {user.secretQuestion ?? "Секретный вопрос не настроен"}
                </p>
              </div>
              <label className="grid gap-2 text-sm font-medium">
                Ответ на секретный вопрос
                <input
                  autoFocus
                  className="rounded-md border border-[#cbd5e1] px-3 py-2"
                  name="secretAnswer"
                  required
                  type="password"
                />
              </label>
              <label className="grid gap-2 text-sm font-medium">
                Подтверждение
                <input
                  className="rounded-md border border-[#cbd5e1] px-3 py-2"
                  name="confirmation"
                  placeholder="Введите УДАЛИТЬ АККАУНТ"
                  required
                />
              </label>
              <div className="flex justify-end gap-3">
                <Button type="button" variant="secondary" onClick={() => setModal(null)}>
                  Отмена
                </Button>
                <Button variant="destructive">Удалить аккаунт</Button>
              </div>
            </form>
          </section>
        </div>
      ) : null}

      {modal === "reveal" ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4"
          onClick={() => setModal(null)}
        >
          <section
            aria-modal="true"
            className="w-full max-w-md rounded-lg border border-[#d8dee8] bg-white p-5 shadow-xl"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
          >
            <h3 className="text-lg font-semibold text-[#1f2937]">Показать данные</h3>
            <form action={revealSensitiveData} className="mt-5 grid gap-4">
              <label className="grid gap-2 text-sm font-medium">
                Введите настоящий пароль:
                <input
                  autoFocus
                  className="rounded-md border border-[#cbd5e1] px-3 py-2"
                  name="currentPassword"
                  required
                  type="password"
                />
              </label>
              {revealError ? (
                <p className="rounded-md border border-[#f3c2bd] bg-[#fff5f5] px-3 py-2 text-sm text-[#b42318]">
                  {revealError}
                </p>
              ) : null}
              <div className="flex justify-end gap-3">
                <Button type="button" variant="secondary" onClick={() => setModal(null)}>
                  Отмена
                </Button>
                <Button disabled={isPending}>{isPending ? "Проверка..." : "Показать"}</Button>
              </div>
            </form>
          </section>
        </div>
      ) : null}
    </>
  );
}
