import Link from "next/link";
import { Clock, FileText, Home, Settings, Users } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";

const homeBenefits = [
  {
    description: "быстро, спокойно, без лишних экранов",
    icon: FileText,
    title: "Удобный интерфейс"
  },
  {
    description: "главные данные видны сразу после входа",
    icon: Home,
    title: "Легкий дашборд"
  },
  {
    description: "имена, телефоны и история под рукой",
    icon: Users,
    title: "Контакты"
  },
  {
    description: "дата, время и курс сохраняются в записи",
    icon: Clock,
    title: "Курсы и время"
  },
  {
    description: "учет в нужной валюте без лишних настроек",
    icon: Settings,
    title: "Разные валюты"
  }
];

export default function HomePage() {
  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-[#f4f6f5] px-6 py-8 text-[#1f2937]">
      <div aria-hidden="true" className="home-background">
        <div className="home-paper-field" />

        <div className="home-left-motion">
          <span className="home-left-line home-left-line-one" />
          <span className="home-left-line home-left-line-two" />
          <span className="home-left-line home-left-line-three" />
          <span className="home-left-fold home-left-fold-one" />
          <span className="home-left-fold home-left-fold-two" />
          <span className="home-left-scan" />
        </div>

        <div className="home-journal-animation">
          <span className="home-journal-sweep" />
          <span className="home-journal-line home-journal-line-one" />
          <span className="home-journal-line home-journal-line-two" />
          <span className="home-journal-line home-journal-line-three" />
          <span className="home-journal-line home-journal-line-four" />
          <span className="home-journal-line home-journal-line-five" />
          <span className="home-journal-line home-journal-line-six" />
          <span className="home-history-tick home-history-tick-one" />
          <span className="home-history-tick home-history-tick-two" />
          <span className="home-history-tick home-history-tick-three" />
          <span className="home-current-line" />
        </div>
      </div>

      <section className="relative z-10 mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl flex-col justify-center gap-8">
        <div className="max-w-4xl">
          <Logo className="home-logo-3d mb-5" />
          <h1 className="text-3xl font-semibold leading-tight sm:text-4xl md:text-5xl">
            <span className="block">
              Рабочий журнал для учёта и хранения информации о переводах
            </span>
            <span className="mt-3 block text-[#256f6c]">
              История без хаоса!
            </span>
          </h1>
        </div>

        <div className="home-benefits" aria-label="Почему удобно пользоваться HunaSuna">
          {homeBenefits.map((benefit) => {
            const Icon = benefit.icon;

            return (
              <div
                className="home-benefit-item"
                key={benefit.title}
              >
                <span className="home-benefit-icon">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="home-benefit-copy">
                  <strong>
                    {benefit.title}
                  </strong>
                  <span>
                    {benefit.description}
                  </span>
                </span>
              </div>
            );
          })}
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
