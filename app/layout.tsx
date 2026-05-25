import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HunaSuna",
  description: "Инструмент учета информации о переводах"
};

export const preferredRegion = "fra1";

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
