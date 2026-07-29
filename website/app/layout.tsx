import type { Metadata, Viewport } from "next";
import { Literata, Outfit } from "next/font/google";
import { GoogleAnalytics } from "@/components/google-analytics";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const literata = Literata({
  variable: "--font-literata",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Alavo",
    template: "%s · Alavo",
  },
  description:
    "Alavo is a habit tracking app for building daily routines, keeping streaks, and reflecting in a simple journal.",
  applicationName: "Alavo",
  keywords: [
    "Alavo",
    "habit tracker",
    "habits",
    "streaks",
    "daily habits",
    "journal",
  ],
  authors: [{ name: "Alavo", url: "https://alavo.cc" }],
  openGraph: {
    title: "Alavo",
    description:
      "Alavo is a habit tracking app for daily routines, streaks, and journaling.",
    url: "https://alavo.cc",
    siteName: "Alavo",
    type: "website",
  },
  icons: {
    icon: [{ url: "/Logo.png", type: "image/png" }],
  },
  ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? {
        verification: {
          google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
        },
      }
    : {}),
};

export const viewport: Viewport = {
  themeColor: "#5B6B9A",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.variable} ${literata.variable} antialiased`}>
        <GoogleAnalytics />
        {children}
      </body>
    </html>
  );
}
