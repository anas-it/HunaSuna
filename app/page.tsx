import Link from "next/link";
import { logoutAction } from "@/app/actions";
import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/server/auth/session";

export default async function HomePage() {
  const user = await getCurrentUser();

  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-[#eef2f1] px-6 py-8 text-[#1f2937]">
      <div aria-hidden="true" className="home-background">
        <div className="home-grid-lines" />
        <div className="home-flow-track home-flow-track-one" />
        <div className="home-flow-track home-flow-track-two" />
        <div className="home-flow-track home-flow-track-three" />

        <div className="home-data-stack home-data-stack-primary">
          <span className="home-data-row">
            <span className="home-data-mark" />
            <span className="home-data-line" />
            <span className="home-data-line home-data-line-short" />
          </span>
          <span className="home-data-row">
            <span className="home-data-mark home-data-mark-warm" />
            <span className="home-data-line" />
            <span className="home-data-line home-data-line-short" />
          </span>
          <span className="home-data-row">
            <span className="home-data-mark" />
            <span className="home-data-line" />
            <span className="home-data-line home-data-line-short" />
          </span>
        </div>

        <div className="home-data-stack home-data-stack-secondary">
          <span className="home-data-row">
            <span className="home-data-mark home-data-mark-warm" />
            <span className="home-data-line" />
            <span className="home-data-line home-data-line-short" />
          </span>
          <span className="home-data-row">
            <span className="home-data-mark" />
            <span className="home-data-line" />
            <span className="home-data-line home-data-line-short" />
          </span>
        </div>

        <div className="home-network home-network-one">
          <span className="home-network-node home-network-node-one" />
          <span className="home-network-node home-network-node-two" />
          <span className="home-network-node home-network-node-three" />
          <span className="home-network-line home-network-line-one" />
          <span className="home-network-line home-network-line-two" />
          <span className="home-network-pulse home-network-pulse-one" />
          <span className="home-network-pulse home-network-pulse-two" />
        </div>

        <div className="home-network home-network-two">
          <span className="home-network-node home-network-node-one" />
          <span className="home-network-node home-network-node-two" />
          <span className="home-network-line home-network-line-one" />
          <span className="home-network-pulse home-network-pulse-one" />
        </div>
      </div>

      <section className="relative z-10 mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl flex-col justify-center gap-8">
        <div className="max-w-3xl">
          <Logo className="mb-4" />
          <h1 className="text-4xl font-semibold leading-tight md:text-6xl">
            Учет информации о переводах без хаоса
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-[#475569]">
            Сохраняйте контакты, записи, суммы, валюты, курс и историю в одном
            рабочем инструменте.
          </p>
        </div>

        {user ? (
          <div className="flex flex-col gap-4">
            <p className="text-sm font-medium text-[#256f6c]">
              Вы уже вошли как {user.login}
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/dashboard">Открыть кабинет</Link>
              </Button>
              <form action={logoutAction}>
                <Button type="submit" variant="secondary">
                  Выйти
                </Button>
              </form>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/login">Войти</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/register">Регистрация</Link>
            </Button>
          </div>
        )}
      </section>
    </main>
  );
}
