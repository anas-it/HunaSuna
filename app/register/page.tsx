import Link from "next/link";
import { registerAction } from "@/app/actions";
import { Notice } from "@/components/layout/notice";
import { Button } from "@/components/ui/button";

type RegisterPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
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
            minLength={4}
            name="password"
            placeholder="Пароль минимум 4 символа"
            required
            type="password"
          />
          <input
            className="rounded-md border border-[#cbd5e1] px-3 py-2"
            name="phone"
            placeholder="Мобильный номер с кодом страны"
            required
          />
          <input
            className="rounded-md border border-[#cbd5e1] px-3 py-2"
            name="email"
            placeholder="Email, если хотите"
            type="email"
          />
          <Button>Зарегистрироваться</Button>
        </form>

        <div className="mt-5">
          <Button asChild variant="secondary">
            <Link href="/login">Уже есть аккаунт</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}

