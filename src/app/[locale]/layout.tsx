import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ServiceWorkerRegistration } from "@/components/service-worker-registration";
import { DevScripts } from "@/components/dev-scripts";
import { routing, rtlLocales, type Locale } from "@/i18n/routing";
import "../globals.css";

const shubbak = localFont({
  src: [
    { path: "../fonts/Shubbak-ExtraLight.woff2", weight: "200", style: "normal" },
    { path: "../fonts/Shubbak-Light.woff2", weight: "300", style: "normal" },
    { path: "../fonts/Shubbak-Regular.woff2", weight: "400", style: "normal" },
    { path: "../fonts/Shubbak-Medium.woff2", weight: "500", style: "normal" },
    { path: "../fonts/Shubbak-SemiBold.woff2", weight: "600", style: "normal" },
    { path: "../fonts/Shubbak-Bold.woff2", weight: "700", style: "normal" },
    { path: "../fonts/Shubbak-ExtraBold.woff2", weight: "800", style: "normal" },
    { path: "../fonts/Shubbak-Black.woff2", weight: "900", style: "normal" },
  ],
  variable: "--font-shubbak",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Arabic Era - Find Your University in Malaysia",
  description: "Browse Malaysian universities and programs. We help students find and register in the right university.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Arabic Era",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#285b50",
  width: "device-width",
  initialScale: 1,
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function RootLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Enables static rendering for this locale's request-config lookups.
  setRequestLocale(locale);
  const dir = rtlLocales.includes(locale as Locale) ? "rtl" : "ltr";

  return (
    <html
      lang={locale}
      dir={dir}
      className={`${shubbak.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <NextIntlClientProvider>
          <DevScripts />
          <ServiceWorkerRegistration />
          <div className="relative flex-1">
            <SiteHeader />
            {children}
          </div>
          <SiteFooter />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
