import Link from "next/link";
import { registerAction } from "@/app/actions";
import { Notice } from "@/components/layout/notice";
import { Button } from "@/components/ui/button";
import { redirectAuthenticatedUser } from "@/server/auth/session";

type RegisterPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  await redirectAuthenticatedUser();

  const params = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f8fa] px-6">
      <section className="w-full max-w-md rounded-lg border border-[#d8dee8] bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">Регистрация</h1>
        <p className="mt-2 text-sm leading-6 text-[#64748b]">
          Создайте аккаунт HunaSuna для учета своих контактов и записей.
        </p>

        <Notice error={params.error} />

        <form action={registerAction} className="mt-6 grid gap-4">
          <input
            className="rounded-md border border-[#cbd5e1] px-3 py-2"
            name="login"
            placeholder="Логин"
            required
          />
          <input
            className="rounded-md border border-[#cbd5e1] px-3 py-2"
            name="phone"
            placeholder="Телефон, если есть"
          />
          <input
            className="rounded-md border border-[#cbd5e1] px-3 py-2"
            name="email"
            placeholder="Email, если есть"
            type="email"
          />
          <input
            className="rounded-md border border-[#cbd5e1] px-3 py-2"
            minLength={4}
            name="password"
            placeholder="Пароль минимум 4 символа"
            required
            type="password"
          />
          <input
            className="rounded-md border border-[#cbd5e1] px-3 py-2"
            minLength={4}
            name="confirmPassword"
            placeholder="Подтверждение пароля"
            required
            type="password"
          />
          <input
            className="rounded-md border border-[#cbd5e1] px-3 py-2"
            name="secretQuestion"
            placeholder="Секретный вопрос"
            required
          />
          <input
            className="rounded-md border border-[#cbd5e1] px-3 py-2"
            name="secretAnswer"
            placeholder="Секретный ответ"
            required
          />
          <Button>Зарегистрироваться</Button>
        </form>

        <div className="mt-5">
          <Button asChild variant="secondary">
            <Link href="/login" prefetch={false}>Уже есть аккаунт</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
