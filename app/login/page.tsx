import Link from "next/link";
import { loginAction } from "@/app/actions";
import { Notice } from "@/components/layout/notice";
import { Button } from "@/components/ui/button";

type LoginPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f8fa] px-6">
      <section className="w-full max-w-md rounded-lg border border-[#d8dee8] bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">Вход</h1>
        <p className="mt-2 text-sm leading-6 text-[#64748b]">
          Войдите в свой аккаунт, чтобы открыть контакты и записи.
        </p>

        <Notice error={params.error} />

        <form action={loginAction} className="mt-6 grid gap-4">
          <input
            className="rounded-md border border-[#cbd5e1] px-3 py-2"
            name="login"
            placeholder="Логин"
            required
          />
          <input
            className="rounded-md border border-[#cbd5e1] px-3 py-2"
            minLength={4}
            name="password"
            placeholder="Пароль"
            required
            type="password"
          />
          <Button>Войти</Button>
        </form>

        <div className="mt-5 flex gap-3">
          <Button asChild variant="secondary">
            <Link href="/forgot-password">Забыли пароль?</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/register">Регистрация</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}

