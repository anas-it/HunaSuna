import Link from "next/link";
import { cookies } from "next/headers";
import { requestPasswordRecoveryAction, resetPasswordAction } from "@/app/actions";
import { Notice } from "@/components/layout/notice";
import { Button } from "@/components/ui/button";

type ForgotPasswordPageProps = {
  searchParams: Promise<{ error?: string; step?: string; target?: string }>;
};

export default async function ForgotPasswordPage({ searchParams }: ForgotPasswordPageProps) {
  const params = await searchParams;
  const cookieStore = await cookies();
  const developmentCode = cookieStore.get("hunasuna_dev_recovery_code")?.value;
  const isResetStep = params.step === "reset";

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f8fa] px-6">
      <section className="w-full max-w-md rounded-lg border border-[#d8dee8] bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">Восстановление пароля</h1>
        <p className="mt-2 text-sm leading-6 text-[#64748b]">
          Код действует 5 минут. После 3 неправильных попыток нужен новый код.
        </p>

        <Notice error={params.error} />

        {developmentCode ? (
          <div className="mb-5 rounded-md border border-[#b6dfcb] bg-[#eefaf4] px-4 py-3 text-sm text-[#1f6b45]">
            Код восстановления для локальной разработки: <strong>{developmentCode}</strong>
          </div>
        ) : null}

        {!isResetStep ? (
          <form action={requestPasswordRecoveryAction} className="mt-6 grid gap-4">
            <input
              className="rounded-md border border-[#cbd5e1] px-3 py-2"
              name="target"
              placeholder="Телефон, email или логин"
              required
            />
            <Button>Получить код</Button>
          </form>
        ) : (
          <form action={resetPasswordAction} className="mt-6 grid gap-4">
            <input
              className="rounded-md border border-[#cbd5e1] px-3 py-2"
              defaultValue={params.target ?? ""}
              name="target"
              placeholder="Телефон, email или логин"
              required
            />
            <input
              className="rounded-md border border-[#cbd5e1] px-3 py-2"
              name="code"
              placeholder="Код"
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

