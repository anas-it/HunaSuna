import type { Metadata } from "next";
import { cookies } from "next/headers";
import { THEME_COOKIE, themeFromCookie } from "@/lib/theme";
import "./globals.css";

export const metadata: Metadata = {
  title: "HunaSuna",
  description: "Инструмент учета информации о переводах"
};

export const preferredRegion = "fra1";
export const runtime = "nodejs";

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const theme = themeFromCookie(cookieStore.get(THEME_COOKIE)?.value);

  return (
    <html lang="ru" data-theme={theme} suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
