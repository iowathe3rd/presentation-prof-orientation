import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI в банке — интерактивная презентация",
  description:
    "Как AI-технологии превращаются в работающие банковские системы. Educational demo.",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
  },
  openGraph: {
    title: "AI в банке",
    description: "Как технологии превращаются в работающие системы",
    type: "website",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "AI в банке — интерактивная презентация",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI в банке",
    description: "Интерактивная презентация внутри AI_BANK_OS",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
