import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { DM_Sans, Fraunces } from "next/font/google";
import { Toaster } from "sonner";
import { THEME_BOOTSTRAP_SCRIPT } from "@alavo/brand";
import { AuthProvider } from "@/components/providers/auth-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { ServiceWorkerRegister } from "@/components/providers/sw-register";
import { PwaInstallPrompt } from "@/components/pwa-install-prompt";
import { PWA_INSTALL_BOOTSTRAP_SCRIPT } from "@/lib/pwa-install";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Alavo",
    template: "%s · Alavo",
  },
  description:
    "A calm, mobile-first habit tracker for building streaks, reflecting daily, and staying consistent.",
  applicationName: "Alavo",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: ["/icon-192.png"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Alavo",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
  formatDetection: {
    telephone: false,
  },
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#7B08E0",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${dmSans.variable} ${fraunces.variable} antialiased`}>
        <Script id="alavo-theme" strategy="beforeInteractive">
          {THEME_BOOTSTRAP_SCRIPT}
        </Script>
        <Script id="alavo-pwa" strategy="beforeInteractive">
          {PWA_INSTALL_BOOTSTRAP_SCRIPT}
        </Script>
        <ThemeProvider>
          <AuthProvider>
            {children}
            <Toaster
              position="top-center"
              toastOptions={{
                classNames: {
                  toast: "rounded-xl border border-border shadow-lg",
                },
              }}
              richColors
              closeButton
            />
            <ServiceWorkerRegister />
            <PwaInstallPrompt />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
