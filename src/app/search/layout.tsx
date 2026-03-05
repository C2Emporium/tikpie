import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Recherche",
  description: "Rechercher des vidéos sur Tikpie.",
  robots: { index: true, follow: true },
};

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
