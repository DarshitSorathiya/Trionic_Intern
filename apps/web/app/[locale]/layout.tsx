import type { Metadata } from "next";
import { Geist, Noto_Sans_Devanagari, Noto_Sans_Gujarati, Noto_Sans_Tamil } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { notFound } from "next/navigation";
import { Toaster } from "@/components/ui/toaster";
import { LanguageSwitcher } from "@/components/language-switcher";
import "@/app/globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const devanagari = Noto_Sans_Devanagari({
  variable: "--font-devanagari",
  subsets: ["devanagari"],
  weight: ["300", "400", "500", "700"],
  display: "swap",
});

const gujarati = Noto_Sans_Gujarati({
  variable: "--font-gujarati",
  subsets: ["gujarati"],
  weight: ["300", "400", "500", "700"],
  display: "swap",
});

const tamil = Noto_Sans_Tamil({
  variable: "--font-tamil",
  subsets: ["tamil"],
  weight: ["300", "400", "500", "700"],
  display: "swap",
});

const fontMap: Record<string, string> = {
  en: geistSans.variable,
  hi: devanagari.variable,
  mr: devanagari.variable, // Marathi shares Devanagari font structures
  gu: gujarati.variable,
  ta: tamil.variable,
};

export const metadata: Metadata = {
  title: "Trionic Adalat",
  description: "AI legal drafting platform",
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Validate that the incoming locale is supported
  if (!routing.locales.includes(locale as typeof routing.locales[number])) {
    notFound();
  }

  // Fetch translation messages
  const messages = await getMessages();
  const fontVariable = fontMap[locale] || geistSans.variable;
  const isRtl = locale === "ur";
  const dir = isRtl ? "rtl" : "ltr";

  return (
    <html
      lang={locale}
      dir={dir}
      className={`${fontVariable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-sans relative">
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
        <Toaster />
      </body>
    </html>
  );
}

