import type { Metadata } from "next";
import { IBM_Plex_Sans_Arabic, Manrope } from "next/font/google";
import { Providers } from "@/components/providers";
import { Navbar } from "@/components/navbar";
import "./globals.css";

const ibmPlexArabic = IBM_Plex_Sans_Arabic({
  variable: "--font-arabic",
  subsets: ["arabic", "latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-latin",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "سِمَة — SEMAH AI Brand Studio", template: "%s | سِمَة" },
  description: "من فكرة إلى هوية تُعرَف. منصة الذكاء الاصطناعي لبناء أنظمة هوية بصرية متكاملة.",
  keywords: ["هوية بصرية", "تصميم شعار", "Brand Book", "SEMAH", "سِمَة", "استراتيجية علامة تجارية"],
  openGraph: { type: "website", locale: "ar_SA", title: "سِمَة — SEMAH AI Brand Studio", description: "من فكرة إلى هوية تُعرَف", siteName: "SEMAH" },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning className={`${ibmPlexArabic.variable} ${manrope.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground font-arabic">
        <Providers>
          <Navbar />
          <main className="flex-1">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
