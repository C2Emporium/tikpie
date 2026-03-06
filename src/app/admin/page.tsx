"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { upload } from "@vercel/blob/client";

interface VideoRow {
  id: string;
  url: string;
  title: string;
  likes: number;
  mediaType?: "video" | "image";
}

export default function AdminPage() {
  const [videos, setVideos] = useState<VideoRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [addingByUrl, setAddingByUrl] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [titleByUrl, setTitleByUrl] = useState("");

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
      const pathname = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const blob = await upload(pathname, file, {
        access: "public",
        handleUploadUrl: "/api/upload",
      });

      const isImage = /\.(jpg|jpeg|png|webp|gif)$/i.test(file.name) || file.type.startsWith("image/");
      const res = await fetch("/api/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: blob.url,
          title: title.trim(),
          mediaType: isImage ? "image" : "video",
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(typeof data?.error === "string" ? data.error : "Échec lors de l’enregistrement.");
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

  const handleAddByUrl = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!videoUrl.trim() || !titleByUrl.trim()) {
      setError("URL et titre requis.");
      return;
    }
    setError(null);
    setAddingByUrl(true);
    try {
      const res = await fetch("/api/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: videoUrl.trim(), title: titleByUrl.trim() }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const msg =
          typeof data?.error === "string"
            ? data.error
            : res.status === 500
              ? "Erreur serveur. Vérifiez /api/health et DATABASE_URL sur Vercel."
              : "L’URL doit être un lien direct vers le fichier (vidéo ou image).";
        throw new Error(msg);
      }
      setVideoUrl("");
      setTitleByUrl("");
      await loadVideos();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erreur";
      setError(
        /fetch|network|failed to fetch/i.test(msg)
          ? "Problème de connexion. Vérifiez internet et réessaiez."
          : msg
      );
    } finally {
      setAddingByUrl(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce contenu ?")) return;
    try {
      const res = await fetch(`/api/videos/${id}`, { method: "DELETE" });
      if (res.ok) await loadVideos();
    } catch {
      setError("Erreur suppression");
    }
  };

  return (
    <main id="main-content" className="min-h-screen bg-zinc-950 text-zinc-100" role="main">
      <header className="sticky top-0 z-10 border-b border-zinc-800 bg-zinc-950/95 backdrop-blur">
        <div className="mx-auto flex h-12 max-w-3xl items-center justify-between px-4">
          <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">Contenu</span>
          <Link href="/" className="text-xs text-zinc-500 hover:text-zinc-400 transition-colors">
            Retour au site
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 py-8">
        <form
          onSubmit={handleSubmit}
          className="mb-6 rounded-xl border border-zinc-800 bg-zinc-900/50 p-5"
        >
          <h2 className="mb-4 text-sm font-semibold text-zinc-300">Upload vidéo ou image</h2>
          <p className="mb-4 text-xs text-zinc-500">
            Depuis ta galerie ou ton ordinateur. Vidéos jusqu’à 100 Mo, images jusqu’à 10 Mo. Compatible portable.
          </p>
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="mb-1 block text-xs text-zinc-500">Titre</label>
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
                Fichier (vidéo ou image)
              </label>
              <input
                id="file"
                type="file"
                accept="video/*,image/*"
                className="block w-full text-xs text-zinc-400 file:mr-3 file:rounded file:border-0 file:bg-zinc-600 file:px-3 file:py-1.5 file:text-zinc-200 file:cursor-pointer hover:file:bg-zinc-500"
              />
            </div>
            {error && <p className="text-xs text-red-400">{error}</p>}
            <button
              type="submit"
              disabled={uploading}
              className="rounded-lg bg-zinc-700 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? "Envoi…" : "Publier"}
            </button>
          </div>
        </form>

        <form
          onSubmit={handleAddByUrl}
          className="mb-10 rounded-xl border border-zinc-800 bg-zinc-900/50 p-5"
        >
          <h2 className="mb-4 text-sm font-semibold text-zinc-300">Ajouter par URL</h2>
          <p className="mb-4 text-xs text-zinc-500">
            Colle un lien direct vers une vidéo ou une image. En production, le fichier sera copié sur notre Blob pour un affichage sans erreur.
          </p>
          <div className="space-y-4">
            <div>
              <label htmlFor="videoUrl" className="mb-1 block text-xs text-zinc-500">URL</label>
              <input
                id="videoUrl"
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://..."
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-zinc-600 focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="titleByUrl" className="mb-1 block text-xs text-zinc-500">Titre</label>
              <input
                id="titleByUrl"
                type="text"
                value={titleByUrl}
                onChange={(e) => setTitleByUrl(e.target.value)}
                placeholder="Titre"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-zinc-600 focus:outline-none"
              />
            </div>
            {error && <p className="text-xs text-red-400">{error}</p>}
            <button
              type="submit"
              disabled={addingByUrl}
              className="rounded-lg bg-zinc-700 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {addingByUrl ? "Ajout…" : "Ajouter"}
            </button>
          </div>
        </form>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-zinc-400">Catalogue</h2>
          {loading ? (
            <p className="text-xs text-zinc-500">Chargement…</p>
          ) : videos.length === 0 ? (
            <p className="text-xs text-zinc-500">Aucun contenu.</p>
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
                    {v.mediaType && (
                      <span className="text-[10px] text-zinc-500 capitalize">{v.mediaType}</span>
                    )}
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
