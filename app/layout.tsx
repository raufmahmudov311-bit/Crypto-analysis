import type { Metadata } from "next";
import "./globals.css";
import { I18nProvider } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Nexus Terminal — AI Crypto Analytics & Trading Signals",
  description:
    "Institutional-grade crypto analytics, AI trading signals, and portfolio intelligence terminal.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  );
}
