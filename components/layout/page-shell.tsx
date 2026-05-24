import Link from "next/link";
import { logoutAction } from "@/app/actions";

const navItems = [
  { href: "/dashboard", label: "Главная" },
  { href: "/records", label: "Записи" },
  { href: "/contacts", label: "Контакты" },
  { href: "/deleted", label: "Удаленные" },
  { href: "/settings", label: "Настройки" }
];

type PageShellProps = {
  title: string;
  description?: string;
  children?: React.ReactNode;
};

export function PageShell({ title, description, children }: PageShellProps) {
  return (
    <main className="min-h-screen bg-[#f7f8fa] text-[#1f2937]">
      <header className="border-b border-[#d8dee8] bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <Link className="text-lg font-semibold text-[#256f6c]" href="/dashboard">
            HunaSuna
          </Link>
          <nav className="flex flex-wrap gap-2 text-sm text-[#475569]">
            {navItems.map((item) => (
              <Link
                className="rounded-md px-3 py-2 hover:bg-[#eef2f6] hover:text-[#1f2937]"
                href={item.href}
                key={item.href}
              >
                {item.label}
              </Link>
            ))}
            <form action={logoutAction}>
              <button className="rounded-md px-3 py-2 hover:bg-[#eef2f6] hover:text-[#1f2937]">
                Выйти
              </button>
            </form>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold">{title}</h1>
          {description ? (
            <p className="mt-2 max-w-3xl text-base leading-7 text-[#64748b]">
              {description}
            </p>
          ) : null}
        </div>
        {children}
      </section>
    </main>
  );
}
