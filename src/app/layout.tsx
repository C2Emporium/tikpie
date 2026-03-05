import type { Metadata } from "next";
import "./globals.css";
import ExoClickGlobal from "@/components/ExoClickGlobal";

export const metadata: Metadata = {
  title: "Tikpie - Short-Form Video",
  description: "Plateforme vidéo verticale style TikTok",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="dark">
      <body className="min-h-screen bg-black text-white antialiased">
        {children}
        <ExoClickGlobal />
      </body>
    </html>
  );
}
