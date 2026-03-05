"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface VideoRow {
  id: string;
  url: string;
  title: string;
  likes: number;
}

export default function AdminPage() {
  const [videos, setVideos] = useState<VideoRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");

  const loadVideos = async () => {
    try {
      const res = await fetch("/api/videos");
      const feed = await res.json();
      const list = feed
        .filter((item: { type: string }) => item.type === "video")
        .map((item: { data: VideoRow }) => item.data);
      setVideos(list);
    } catch {
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVideos();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const input = form.querySelector('input[type="file"]') as HTMLInputElement;
    const file = input?.files?.[0];

    if (!file || !title.trim()) {
      setError("Fichier et titre requis.");
      return;
    }

    setError(null);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.set("file", file);
      formData.set("title", title.trim());

      const res = await fetch("/api/videos", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Échec de l’envoi");
      }

      setTitle("");
      input.value = "";
      await loadVideos();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cette vidéo ?")) return;
    try {
      const res = await fetch(`/api/videos/${id}`, { method: "DELETE" });
      if (res.ok) await loadVideos();
    } catch {
      setError("Erreur suppression");
    }
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Header discret, style back-office */}
      <header className="sticky top-0 z-10 border-b border-zinc-800 bg-zinc-950/95 backdrop-blur">
        <div className="mx-auto flex h-12 max-w-3xl items-center justify-between px-4">
          <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">Contenu</span>
          <Link
            href="/"
            className="text-xs text-zinc-500 hover:text-zinc-400 transition-colors"
          >
            Retour au site
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 py-8">
        <form
          onSubmit={handleSubmit}
          className="mb-10 rounded-xl border border-zinc-800 bg-zinc-900/50 p-5"
        >
          <h2 className="mb-4 text-sm font-semibold text-zinc-300">Nouvelle vidéo</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="mb-1 block text-xs text-zinc-500">
                Titre
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Titre"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-zinc-600 focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="file" className="mb-1 block text-xs text-zinc-500">
                Fichier (MP4, WebM, MOV — max 100 Mo)
              </label>
              <input
                id="file"
                type="file"
                accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov"
                className="block w-full text-xs text-zinc-400 file:mr-3 file:rounded file:border-0 file:bg-zinc-600 file:px-3 file:py-1.5 file:text-zinc-200 file:cursor-pointer hover:file:bg-zinc-500"
              />
            </div>
            {error && (
              <p className="text-xs text-red-400">{error}</p>
            )}
            <button
              type="submit"
              disabled={uploading}
              className="rounded-lg bg-zinc-700 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? "Envoi…" : "Enregistrer"}
            </button>
          </div>
        </form>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-zinc-400">Catalogue</h2>
          {loading ? (
            <p className="text-xs text-zinc-500">Chargement…</p>
          ) : videos.length === 0 ? (
            <p className="text-xs text-zinc-500">Aucune vidéo.</p>
          ) : (
            <ul className="space-y-2">
              {videos.map((v) => (
                <li
                  key={v.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-zinc-800 bg-zinc-900/30 px-4 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-zinc-200">{v.title}</p>
                    <p className="truncate text-xs text-zinc-600">{v.url}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDelete(v.id)}
                    className="shrink-0 rounded px-2 py-1 text-xs text-zinc-500 hover:bg-zinc-800 hover:text-red-400 transition-colors"
                  >
                    Supprimer
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
