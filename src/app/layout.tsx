import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "latin-ext"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  title: "Conformité paie 2026 : testez vos obligations | PayFit SEO Copilot",
  description:
    "SMIC 2026, RGDU, transparence salariale, congés maladie… Les règles de paie changent. Testez votre conformité en 3 minutes avec notre quiz gratuit.",
  keywords: [
    "conformité paie 2026",
    "SMIC 2026",
    "RGDU",
    "transparence salariale",
    "gestion de paie",
    "bulletin de paie 2026",
    "quiz conformité paie",
  ],
  openGraph: {
    title: "Conformité paie 2026 : testez vos obligations",
    description:
      "Testez votre conformité paie en 3 minutes. Quiz gratuit, sans inscription.",
    type: "website",
    locale: "fr_FR",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
