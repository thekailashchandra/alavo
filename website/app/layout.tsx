import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import { CookieConsent } from "@/components/cookie-consent";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Alavo",
    template: "%s · Alavo",
  },
  description:
    "Build habits that actually stick. Track daily routines, keep streaks, and reflect in a simple journal with Alavo.",
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
      "Build habits that actually stick — daily routines, streaks, and a simple journal.",
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
  themeColor: "#7B08E0",
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
      <body className={`${outfit.variable} antialiased`}>
        <CookieConsent />
        {children}
      </body>
    </html>
  );
}
