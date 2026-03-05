"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";
import SearchBar from "@/components/SearchBar";
import type { VideoItem } from "@/types/video";

function SearchContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") ?? "";
  const [results, setResults] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(!!q);

  useEffect(() => {
    if (!q.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch("/api/videos")
      .then((res) => res.json())
      .then((feed: { type: string; data?: VideoItem }[]) => {
        const videos = feed.filter((i) => i.type === "video").map((i) => i.data!);
        const lower = q.toLowerCase();
        const filtered = videos.filter(
          (v) => v.title.toLowerCase().includes(lower)
        );
        setResults(filtered);
      })
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }, [q]);

  return (
    <div className="min-h-screen pt-14 pb-20 px-4">
      <div className="max-w-xl mx-auto pt-4">
        <SearchBar placeholder="Rechercher vidéos..." className="flex sm:hidden mb-6" />
        {!q.trim() ? (
          <p className="text-zinc-500 text-sm mb-4">
            Saisis un mot-clé dans la barre de recherche pour trouver des vidéos.
          </p>
        ) : (
          <p className="text-zinc-500 text-sm mb-4" aria-live="polite">
            {loading ? "Recherche..." : results.length === 0 ? "Aucun résultat pour cette recherche." : `${results.length} vidéo(s) trouvée(s).`}
          </p>
        )}
        <ul className="space-y-3">
          {results.map((v) => (
            <li key={v.id}>
              <Link
                href={`/?highlight=${v.id}`}
                className="block p-4 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-600 transition-colors"
              >
                <p className="font-medium text-white">{v.title}</p>
                <p className="text-zinc-500 text-sm">{v.likes} likes</p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <main id="main-content" className="min-h-screen bg-black" role="main">
      <AppHeader />
      <Suspense fallback={<div className="min-h-screen pt-14 pb-20" />}>
        <SearchContent />
      </Suspense>
      <BottomNav />
    </main>
  );
}
