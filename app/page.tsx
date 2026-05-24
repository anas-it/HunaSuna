import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#f7f8fa] px-6 py-8 text-[#1f2937]">
      <section className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl flex-col justify-center gap-8">
        <div className="max-w-3xl">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-[#256f6c]">
            HunaSuna
          </p>
          <h1 className="text-4xl font-semibold leading-tight md:text-6xl">
            Учет информации о переводах без хаоса
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-[#475569]">
            Сохраняйте контакты, записи, суммы, валюты, курс и историю в одном
            рабочем инструменте. HunaSuna не переводит и не хранит деньги.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/login">Войти</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/register">Регистрация</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
