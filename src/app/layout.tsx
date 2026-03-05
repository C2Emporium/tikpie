import type { Metadata, Viewport } from "next";
import "./globals.css";
import ExoClickGlobal from "@/components/ExoClickGlobal";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Tikpie - Vidéos courtes verticales",
    template: "%s | Tikpie",
  },
  description:
    "Découvre des vidéos courtes en format vertical. Swipe, like, partage — la plateforme vidéo simple et addictive.",
  keywords: ["vidéo courte", "vertical", "Tikpie", "short-form", "mobile", "feed"],
  authors: [{ name: "Tikpie" }],
  creator: "Tikpie",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "/",
    siteName: "Tikpie",
    title: "Tikpie - Vidéos courtes verticales",
    description: "Découvre des vidéos courtes en format vertical. Swipe, like, partage.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Tikpie - Vidéos courtes verticales",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tikpie - Vidéos courtes verticales",
    description: "Découvre des vidéos courtes en format vertical.",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0a0a0a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="dark">
      <body className="min-h-screen bg-black text-white antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded focus:bg-white focus:px-3 focus:py-2 focus:text-black focus:outline-none"
        >
          Aller au contenu
        </a>
        {children}
        <ExoClickGlobal />
      </body>
    </html>
  );
}
