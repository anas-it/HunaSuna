import Link from "next/link";
import { requestPasswordRecoveryAction, resetPasswordAction } from "@/app/actions";
import { Notice } from "@/components/layout/notice";
import { Button } from "@/components/ui/button";
import { redirectAuthenticatedUser } from "@/server/auth/session";

type ForgotPasswordPageProps = {
  searchParams: Promise<{
    error?: string;
    question?: string;
    step?: string;
    target?: string;
  }>;
};

export default async function ForgotPasswordPage({
  searchParams
}: ForgotPasswordPageProps) {
  await redirectAuthenticatedUser();

  const params = await searchParams;
  const isResetStep = params.step === "reset";

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f8fa] px-6">
      <section className="w-full max-w-md rounded-lg border border-[#d8dee8] bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">Восстановление пароля</h1>
        <p className="mt-2 text-sm leading-6 text-[#64748b]">
          Введите логин, ответьте на секретный вопрос и задайте новый пароль.
        </p>

        <Notice error={params.error} />

        {!isResetStep ? (
          <form action={requestPasswordRecoveryAction} className="mt-6 grid gap-4">
            <input
              className="rounded-md border border-[#cbd5e1] px-3 py-2"
              name="target"
              placeholder="Логин"
              required
            />
            <Button>Продолжить</Button>
          </form>
        ) : (
          <form action={resetPasswordAction} className="mt-6 grid gap-4">
            <input
              className="rounded-md border border-[#cbd5e1] px-3 py-2"
              defaultValue={params.target ?? ""}
              name="target"
              placeholder="Логин"
              required
            />
            <input
              defaultValue={params.question ?? ""}
              name="secretQuestion"
              type="hidden"
            />
            <div className="rounded-md border border-[#d8dee8] bg-[#f8fafc] px-3 py-2 text-sm text-[#1f2937]">
              <span className="block text-xs font-semibold uppercase text-[#64748b]">
                Секретный вопрос
              </span>
              <span className="mt-1 block">{params.question}</span>
            </div>
            <input
              className="rounded-md border border-[#cbd5e1] px-3 py-2"
              name="secretAnswer"
              placeholder="Секретный ответ"
              required
            />
            <input
              className="rounded-md border border-[#cbd5e1] px-3 py-2"
              minLength={4}
              name="newPassword"
              placeholder="Новый пароль"
              required
              type="password"
            />
            <input
              className="rounded-md border border-[#cbd5e1] px-3 py-2"
              minLength={4}
              name="confirmPassword"
              placeholder="Подтверждение нового пароля"
              required
              type="password"
            />
            <Button>Сменить пароль</Button>
          </form>
        )}

        <div className="mt-5">
          <Button asChild variant="secondary">
            <Link href="/login">Вернуться ко входу</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
