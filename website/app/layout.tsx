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
    default: "Alavo — calm habit tracker",
    template: "%s · Alavo",
  },
  description:
    "Alavo is a calm habit tracker for daily rituals, honest streaks, and quiet reflection. Track habits on your phone and stay consistent without noise.",
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
    title: "Alavo — calm habit tracker",
    description:
      "Alavo helps you build consistent habits — log daily rituals, keep streaks, and reflect without the noise.",
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
