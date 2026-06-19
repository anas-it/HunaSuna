"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileText,
  Home,
  LogOut,
  MoreHorizontal,
  Settings,
  Trash2,
  Users,
  X
} from "lucide-react";
import { useState } from "react";
import { Logo } from "@/components/layout/logo";
import { cn } from "@/lib/utils";

const primaryNavItems = [
  { href: "/dashboard", icon: Home, label: "Главная" },
  { href: "/records", icon: FileText, label: "Записи" },
  { href: "/contacts", icon: Users, label: "Контакты" },
  { href: "/deleted", icon: Trash2, label: "Удаленные" }
];

const secondaryNavItems = [
  { href: "/settings", icon: Settings, label: "Настройки" }
];

type AppNavigationProps = {
  logoutAction: () => void | Promise<void>;
};

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppNavigation({ logoutAction }: AppNavigationProps) {
  const pathname = usePathname();
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  return (
    <>
      <aside className="hidden min-h-screen w-64 shrink-0 border-r border-[#d8dee8] bg-white px-4 py-5 lg:sticky lg:top-0 lg:flex lg:flex-col">
        <Link
          className="mb-8 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#256f6c]"
          href="/dashboard"
          prefetch={false}
        >
          <Logo />
        </Link>

        <nav className="grid gap-1 text-sm">
          {primaryNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActivePath(pathname, item.href);

            return (
              <Link
                className={cn(
                  "inline-flex h-11 items-center gap-3 rounded-md px-3 font-medium text-[#475569] transition-colors hover:bg-[#eef7f6] hover:text-[#1f5d5a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#256f6c]",
                  active && "bg-[#eef7f6] text-[#1f5d5a]"
                )}
                href={item.href}
                key={item.href}
                prefetch={false}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto grid gap-1 border-t border-[#e5eaf1] pt-4 text-sm">
          {secondaryNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActivePath(pathname, item.href);

            return (
              <Link
                className={cn(
                  "inline-flex h-11 items-center gap-3 rounded-md px-3 font-medium text-[#475569] transition-colors hover:bg-[#eef2f6] hover:text-[#1f2937] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#256f6c]",
                  active && "bg-[#eef2f6] text-[#1f2937]"
                )}
                href={item.href}
                key={item.href}
                prefetch={false}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
          <form action={logoutAction}>
            <button className="inline-flex h-11 w-full cursor-pointer items-center gap-3 rounded-md px-3 text-sm font-medium text-[#b42318] transition-colors hover:bg-[#fff1f1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b42318]">
              <LogOut className="h-4 w-4" />
              Выйти
            </button>
          </form>
        </div>
      </aside>

      <header className="sticky top-0 z-30 border-b border-[#d8dee8] bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
        <Link
          className="inline-flex rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#256f6c]"
          href="/dashboard"
          prefetch={false}
        >
          <Logo />
        </Link>
      </header>

      {isMoreOpen ? (
        <div
          className="fixed inset-0 z-40 bg-black/20 lg:hidden"
          onClick={() => setIsMoreOpen(false)}
        >
          <section
            aria-modal="true"
            className="absolute inset-x-3 bottom-20 rounded-lg border border-[#d8dee8] bg-white p-3 shadow-xl"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
          >
            <div className="mb-2 flex items-center justify-between px-1">
              <h2 className="text-sm font-semibold text-[#1f2937]">Еще</h2>
              <button
                aria-label="Закрыть меню"
                className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-md text-[#64748b] transition-colors hover:bg-[#eef2f6] hover:text-[#1f2937] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#256f6c]"
                onClick={() => setIsMoreOpen(false)}
                type="button"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid gap-1">
              {secondaryNavItems.map((item) => {
                const Icon = item.icon;
                const active = isActivePath(pathname, item.href);

                return (
                  <Link
                    className={cn(
                      "inline-flex h-11 items-center gap-3 rounded-md px-3 text-sm font-medium text-[#475569] transition-colors hover:bg-[#eef2f6] hover:text-[#1f2937]",
                      active && "bg-[#eef2f6] text-[#1f2937]"
                    )}
                    href={item.href}
                    key={item.href}
                    onClick={() => setIsMoreOpen(false)}
                    prefetch={false}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
              <form action={logoutAction}>
                <button className="inline-flex h-11 w-full cursor-pointer items-center gap-3 rounded-md px-3 text-sm font-medium text-[#b42318] transition-colors hover:bg-[#fff1f1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b42318]">
                  <LogOut className="h-4 w-4" />
                  Выйти
                </button>
              </form>
            </div>
          </section>
        </div>
      ) : null}

      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-[#d8dee8] bg-white px-2 pb-[calc(env(safe-area-inset-bottom)+0.35rem)] pt-2 shadow-[0_-8px_24px_rgba(17,24,39,0.08)] lg:hidden">
        {primaryNavItems.map((item) => {
          const Icon = item.icon;
          const active = isActivePath(pathname, item.href);

          return (
            <Link
              className={cn(
                "flex min-h-12 flex-col items-center justify-center gap-1 rounded-md px-1 text-[11px] font-medium text-[#64748b] transition-colors hover:bg-[#eef7f6] hover:text-[#1f5d5a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#256f6c]",
                active && "bg-[#eef7f6] text-[#1f5d5a]"
              )}
              href={item.href}
              key={item.href}
              onClick={() => setIsMoreOpen(false)}
              prefetch={false}
            >
              <Icon className="h-5 w-5" />
              <span className="leading-none">{item.label}</span>
            </Link>
          );
        })}

        <button
          className={cn(
            "flex min-h-12 cursor-pointer flex-col items-center justify-center gap-1 rounded-md px-1 text-[11px] font-medium text-[#64748b] transition-colors hover:bg-[#eef2f6] hover:text-[#1f2937] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#256f6c]",
            (isMoreOpen || isActivePath(pathname, "/settings")) &&
              "bg-[#eef2f6] text-[#1f2937]"
          )}
          onClick={() => setIsMoreOpen((current) => !current)}
          type="button"
        >
          <MoreHorizontal className="h-5 w-5" />
          <span className="leading-none">Еще</span>
        </button>
      </nav>
    </>
  );
}
