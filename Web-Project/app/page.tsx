import {
  Clock,
  FileText,
  Search,
  ShieldCheck,
  Users
} from "lucide-react";
import { cookies } from "next/headers";
import { HomeAuthModal } from "@/components/auth/home-auth-modal";
import { Logo } from "@/components/layout/logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { THEME_COOKIE, themeFromCookie } from "@/lib/theme";

const homeBenefits = [
  {
    description: "сумма, курс и время в одном месте",
    icon: FileText,
    title: "Записи"
  },
  {
    description: "имена и телефоны всегда рядом",
    icon: Users,
    title: "Контакты"
  },
  {
    description: "по контакту или номеру телефона",
    icon: Search,
    title: "Быстрый поиск"
  },
  {
    description: "автосохранение дата и времени",
    icon: Clock,
    title: "История"
  },
  {
    description: "удаленные записи можно вернуть 7 дней",
    icon: ShieldCheck,
    title: "Спокойствие"
  }
];

type HomePageProps = {
  searchParams: Promise<{
    auth?: string;
    error?: string;
    message?: string;
  }>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const cookieStore = await cookies();
  const theme = themeFromCookie(cookieStore.get(THEME_COOKIE)?.value);
  const authMode =
    params.auth === "login" || params.auth === "register" ? params.auth : null;

  return (
    <main className="home-page relative isolate min-h-screen overflow-hidden bg-[#f4f6f5] px-6 py-8 text-[#1f2937]">
      <div aria-hidden="true" className="home-background">
        <div className="home-paper-field" />
        <svg
          className="home-ambient-lines"
          preserveAspectRatio="none"
          viewBox="0 0 1440 900"
        >
          <path
            className="home-ambient-path home-ambient-path-one"
            d="M-120 188C142 78 308 206 522 154C777 92 926 66 1138 146C1266 194 1380 174 1560 102"
          />
          <path
            className="home-ambient-path home-ambient-path-two"
            d="M-100 494C116 424 276 506 474 450C656 398 824 328 1034 396C1212 454 1348 432 1540 360"
          />
          <path
            className="home-ambient-path home-ambient-path-three"
            d="M-140 718C88 662 260 722 462 680C702 630 850 568 1084 626C1262 670 1398 640 1560 586"
          />
        </svg>
        <div className="home-ambient-sheets" />

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

      <div className="home-shell relative z-10 mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl flex-col">
        <header className="home-topbar">
          <Logo className="home-corner-logo" />
          <div className="home-topbar-actions">
            <ThemeToggle compact initialTheme={theme} />
            <HomeAuthModal
              error={params.error}
              initialMode={authMode}
              key={`${authMode ?? "home"}-${params.error ?? ""}-${params.message ?? ""}`}
              message={params.message}
            />
          </div>
        </header>

        <section className="home-hero">
          <div className="home-intro">
            <h1 className="home-title">
              Учет информации о переводах
            </h1>
            <p className="home-lead">
              HunaSuna помогает хранить записи, контакты и историю в одном
              спокойном рабочем журнале.
            </p>

            <div className="home-benefits" aria-label="Возможности HunaSuna">
              {homeBenefits.map((benefit) => {
                const Icon = benefit.icon;

                return (
                  <div className="home-benefit-item" key={benefit.title}>
                    <span className="home-benefit-icon">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="home-benefit-copy">
                      <strong>{benefit.title}</strong>
                      <span>{benefit.description}</span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <aside className="home-preview" aria-label="Пример рабочего журнала">
            <div className="home-preview-top">
              <span>Рабочий журнал</span>
              <strong>Сегодня</strong>
            </div>

            <div className="home-preview-search">
              <Search className="h-4 w-4" />
              <span>Поиск по контакту или телефону</span>
            </div>

            <div className="home-preview-list">
              <div className="home-preview-row">
                <span className="home-preview-avatar">АМ</span>
                <span>
                  <strong>Абдул М.</strong>
                  <small>Запись сохранена в 12:40</small>
                </span>
                <em>курс указан</em>
              </div>

              <div className="home-preview-row">
                <span className="home-preview-avatar">СР</span>
                <span>
                  <strong>Самира Р.</strong>
                  <small>Контакт и телефон привязаны</small>
                </span>
                <em>история</em>
              </div>

              <div className="home-preview-row">
                <span className="home-preview-avatar">НК</span>
                <span>
                  <strong>Новая запись</strong>
                  <small>Сумма, валюта, дата и время</small>
                </span>
                <em>черновик</em>
              </div>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
