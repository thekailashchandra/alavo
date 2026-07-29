import type { Metadata, Viewport } from "next";
import { Literata, Outfit } from "next/font/google";
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
  description: "A calm habit tracker for streaks, reflection, and consistency.",
  applicationName: "Alavo",
  icons: {
    icon: [{ url: "/Logo.png", type: "image/png" }],
  },
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
        {children}
      </body>
    </html>
  );
}
