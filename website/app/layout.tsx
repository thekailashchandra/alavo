import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Outfit } from "next/font/google";
import { CookieConsent } from "@/components/cookie-consent";
import { JsonLd } from "@/components/json-ld";
import { DEFAULT_DESCRIPTION, DEFAULT_TITLE, SITE_URL } from "@/lib/site";
import "./globals.css";

const UMAMI_SCRIPT_URL =
  "https://umami-analytics-jspv.srv1293608.hstgr.cloud/script.js";
const UMAMI_RECORDER_URL =
  "https://umami-analytics-jspv.srv1293608.hstgr.cloud/recorder.js";
const UMAMI_WEBSITE_ID = "ed325112-1759-4fcf-81b5-d84e10049591";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: DEFAULT_TITLE,
    template: "%s · Alavo",
  },
  description: DEFAULT_DESCRIPTION,
  applicationName: "Alavo",
  keywords: [
    "Alavo",
    "free habit tracker",
    "habit tracker online",
    "daily habit tracker",
    "streak tracking",
    "habit heatmap",
    "journal",
  ],
  authors: [{ name: "Alavo", url: SITE_URL }],
  openGraph: {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    url: SITE_URL,
    siteName: "Alavo",
    type: "website",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
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
      <head>
        <Script
          defer
          src={UMAMI_SCRIPT_URL}
          data-website-id={UMAMI_WEBSITE_ID}
          strategy="afterInteractive"
        />
        <Script
          defer
          src={UMAMI_RECORDER_URL}
          data-website-id={UMAMI_WEBSITE_ID}
          strategy="afterInteractive"
        />
      </head>
      <body className={`${outfit.variable} antialiased`}>
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "Alavo",
            url: SITE_URL,
            description: DEFAULT_DESCRIPTION,
            publisher: {
              "@type": "Organization",
              name: "Alavo",
              url: SITE_URL,
            },
          }}
        />
        <CookieConsent />
        {children}
      </body>
    </html>
  );
}
