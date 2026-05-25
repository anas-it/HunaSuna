import Link from "next/link";
import { FileText, Home, LogOut, Settings, Trash2, Users } from "lucide-react";
import { logoutAction } from "@/app/actions";
import { Logo } from "@/components/layout/logo";

const navItems = [
  { href: "/dashboard", icon: Home, label: "Главная" },
  { href: "/records", icon: FileText, label: "Записи" },
  { href: "/contacts", icon: Users, label: "Контакты" },
  { href: "/deleted", icon: Trash2, label: "Удаленные" },
  { href: "/settings", icon: Settings, label: "Настройки" }
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
          <Link
            className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#256f6c]"
            href="/dashboard"
          >
            <Logo />
          </Link>
          <nav className="flex flex-wrap gap-2 text-sm">
            {navItems.map((item) => (
              <Link
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-[#cfe3e1] bg-[#eef7f6] px-3.5 font-medium text-[#1f5d5a] transition-colors hover:border-[#9fc9c5] hover:bg-[#dff0ee] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#256f6c]"
                href={item.href}
                key={item.href}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
            <form action={logoutAction}>
              <button className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-md border border-[#f3c2bd] bg-[#fff5f5] px-3.5 font-medium text-[#b42318] transition-colors hover:border-[#e08a82] hover:bg-[#ffe8e6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b42318]">
                <LogOut className="h-4 w-4" />
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
