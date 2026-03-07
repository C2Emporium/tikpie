import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { put } from "@vercel/blob";
import { prisma } from "@/lib/prisma";
import { buildFeedWithAds } from "@/lib/feed";
import type { FeedItem } from "@/types/video";

const UPLOAD_DIR = path.join(process.cwd(), "public", "videos");
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB (local)
const MAX_FILE_SIZE_VERCEL = 4 * 1024 * 1024; // 4 MB (limite requête Vercel ~4.5 MB)
const ALLOWED_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-m4v",
  "video/x-msvideo",
  "video/3gpp",
  "video/3gpp2",
];
const ALLOWED_EXT = /\.(mp4|webm|mov|m4v|avi|3gp|3g2|jpg|jpeg|png|webp|gif)$/i;
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function GET() {
  try {
    const videos = await prisma.video.findMany({
      orderBy: { createdAt: "desc" },
    });
    const feed: FeedItem[] = buildFeedWithAds(
      videos.map((v) => ({
        id: v.id,
        url: v.url,
        title: v.title,
        likes: v.likes,
        mediaType: (v.mediaType as "video" | "image") || "video",
      }))
    );
    return NextResponse.json(feed);
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";

  // Option 1 : ajout par URL (JSON)
  if (contentType.includes("application/json")) {
    try {
      if (!process.env.DATABASE_URL) {
        return NextResponse.json(
          {
            error:
              "DATABASE_URL manquante. Vercel > Settings > Environment Variables : ajoutez DATABASE_URL (ex. URL Neon).",
          },
          { status: 500 }
        );
      }
      const body = await request.json();
      const url = typeof body.url === "string" ? body.url.trim() : "";
      const title = typeof body.title === "string" ? body.title.trim() : "";
      const likes = typeof body.likes === "number" ? body.likes : 0;

      if (!url || !title) {
        return NextResponse.json(
          { error: "URL et titre requis." },
          { status: 400 }
        );
      }

      if (!/^https?:\/\//i.test(url)) {
        return NextResponse.json(
          { error: "L’URL doit commencer par http:// ou https://" },
          { status: 400 }
        );
      }

      // Avertissement pour liens courants qui ne sont pas des liens directs vers le fichier
      if (/drive\.google\.com\/file\/d\//i.test(url) && !/\/uc\?export=download/i.test(url)) {
        return NextResponse.json(
          {
            error:
              "Lien Google Drive non direct. Ouvre le fichier sur Drive > ⋮ > Télécharger, ou partage le lien en « Lien de téléchargement direct » (format .../uc?export=download&id=...).",
          },
          { status: 400 }
        );
      }
      if (/youtube\.com|youtu\.be|vimeo\.com/i.test(url)) {
        return NextResponse.json(
          {
            error:
              "YouTube/Vimeo ne fournissent pas de lien direct. Uploade la vidéo sur Streamable.com, Cloudinary ou un hébergeur qui donne un lien direct (.mp4).",
          },
          { status: 400 }
        );
      }

      // Sur Vercel avec Blob : on récupère le fichier et on l'uploade sur notre Blob pour éviter CORS/écran gris
      // Sauf si l'URL vient déjà de notre Blob (upload client direct) → on enregistre tel quel
      let finalUrl = url;
      let mediaType: "video" | "image" =
        (typeof body.mediaType === "string" && (body.mediaType === "video" || body.mediaType === "image"))
          ? body.mediaType
          : /\.(jpg|jpeg|png|webp|gif)$/i.test(url) || /\/images\//i.test(url)
            ? "image"
            : "video";

      const isAlreadyBlob = /blob\.vercel-storage\.com/i.test(url);
      if (isAlreadyBlob) {
        // URL déjà sur notre Blob (upload client) → enregistrement direct
        mediaType = /\/images\//i.test(url) || /\.(jpg|jpeg|png|webp|gif)(\?|$)/i.test(url) ? "image" : "video";
      } else if (process.env.VERCEL && process.env.BLOB_READ_WRITE_TOKEN) {
        try {
          const res = await fetch(url, {
            signal: AbortSignal.timeout(30000),
            headers: { "User-Agent": "Tikpie/1.0" },
          });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const contentType = res.headers.get("content-type") || "";
          const isImage = /^image\//.test(contentType);
          mediaType = isImage ? "image" : "video";
          const ext = isImage
            ? contentType.includes("png")
              ? ".png"
              : contentType.includes("webp")
                ? ".webp"
                : contentType.includes("gif")
                  ? ".gif"
                  : ".jpg"
            : /\.(mp4|webm|mov|m4v)$/i.test(url)
              ? url.match(/\.(mp4|webm|mov|m4v)$/i)?.[0] || ".mp4"
              : ".mp4";
          const pathname = `${isImage ? "images" : "videos"}/url_${Date.now()}_${Math.random().toString(36).slice(2, 9)}${ext}`;
          const blob = await put(pathname, Buffer.from(await res.arrayBuffer()), {
            access: "public",
            addRandomSuffix: true,
            contentType: contentType || (isImage ? "image/jpeg" : "video/mp4"),
          });
          finalUrl = blob.url;
        } catch (fetchErr) {
          console.error("Fetch+upload URL error:", fetchErr);
          return NextResponse.json(
            {
              error:
                "Impossible de récupérer le fichier. Vérifiez que l’URL est un lien direct (pas une page). Certains hébergeurs bloquent les téléchargements externes.",
            },
            { status: 400 }
          );
        }
      }

      const video = await prisma.video.create({
        data: { url: finalUrl, title, likes, mediaType },
      });
      return NextResponse.json(video, { status: 201 });
    } catch (e) {
      console.error("Add by URL error:", e);
      const err = e as { message?: string; code?: string };
      let message = "Erreur inattendue.";
      if (typeof err?.message === "string") {
        if (/connect|ECONNREFUSED|timeout|getaddrinfo/i.test(err.message)) {
          message = "Base de données injoignable. Vérifiez DATABASE_URL sur Vercel (ex. Neon) et que la base est active.";
        } else if (/P1001|P1002|P1017/i.test(err.message) || err?.code === "P1001") {
          message = "Impossible de joindre la base. Vérifiez DATABASE_URL et que le projet Neon n’est pas en pause.";
        } else {
          message = err.message;
        }
      }
      return NextResponse.json(
        { error: message },
        { status: 500 }
      );
    }
  }

  // Option 2 : upload fichier (FormData) — local = disque, Vercel = Blob si BLOB_READ_WRITE_TOKEN
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const title = formData.get("title") as string | null;

    if (!file || !title?.trim()) {
      return NextResponse.json(
        { error: "Fichier et titre requis" },
        { status: 400 }
      );
    }

    const typeOk =
      !file.type || ALLOWED_TYPES.includes(file.type) || IMAGE_TYPES.includes(file.type);
    const extOk = ALLOWED_EXT.test(file.name);
    if (!typeOk && !extOk) {
      return NextResponse.json(
        { error: "Format non supporté. Vidéos : MP4, MOV, WebM. Images : JPG, PNG, WebP, GIF." },
        { status: 400 }
      );
    }

    const isImage =
      IMAGE_TYPES.includes(file.type) || /\.(jpg|jpeg|png|webp|gif)$/i.test(file.name);

    const isVercel = !!process.env.VERCEL;
    const maxSize = isVercel ? MAX_FILE_SIZE_VERCEL : MAX_FILE_SIZE;
    if (file.size > maxSize) {
      const sizeMo = (file.size / 1024 / 1024).toFixed(1);
      return NextResponse.json(
        {
          error: isVercel
            ? `Vidéo trop lourde (${sizeMo} Mo). Max 4 Mo en direct. Utilisez « Ajouter par URL » : uploadez la vidéo sur Streamable, Cloudinary ou Google Drive (lien direct), puis collez l’URL ci‑dessous.`
            : `Fichier trop volumineux (${sizeMo} Mo, max 100 Mo)`,
        },
        { status: 400 }
      );
    }

    const ext = path.extname(file.name) || (isImage ? ".jpg" : ".mp4");
    const folder = isImage ? "images" : "videos";
    const pathname = `${folder}/v_${Date.now()}_${Math.random().toString(36).slice(2, 9)}${ext}`;

    let url: string;

    if (isVercel && process.env.BLOB_READ_WRITE_TOKEN) {
      const blob = await put(pathname, file, {
        access: "public",
        addRandomSuffix: true,
        contentType: file.type || (isImage ? "image/jpeg" : "video/mp4"),
      });
      url = blob.url;
    } else if (isVercel) {
      return NextResponse.json(
        {
          error:
            "Upload en production : créez un Blob Store (Vercel > Storage > Blob) et ajoutez BLOB_READ_WRITE_TOKEN dans Environment Variables. Sinon utilisez « Ajouter par URL ».",
        },
        { status: 400 }
      );
    } else {
      await mkdir(UPLOAD_DIR, { recursive: true });
      const safeName = `v_${Date.now()}_${Math.random().toString(36).slice(2, 9)}${ext}`;
      const filePath = path.join(UPLOAD_DIR, safeName);
      const bytes = await file.arrayBuffer();
      await writeFile(filePath, Buffer.from(bytes));
      url = `/videos/${safeName}`;
    }

    const video = await prisma.video.create({
      data: { url, title: title.trim(), likes: 0, mediaType: isImage ? "image" : "video" },
    });

    return NextResponse.json(video, { status: 201 });
  } catch (e) {
    console.error("Upload error:", e);
    const err = e as { message?: string; code?: string };
    let msg = "Erreur lors de l'upload.";
    if (typeof err?.message === "string") {
      if (/BLOB|blob|401|403/i.test(err.message)) msg = "Blob : vérifiez BLOB_READ_WRITE_TOKEN sur Vercel.";
      else if (/P1001|P1002|connect|ECONNREFUSED|timeout/i.test(err.message)) msg = "Base injoignable : vérifiez DATABASE_URL.";
      else if (/413|payload|body/i.test(err.message)) msg = "Fichier trop lourd (max 4 Mo).";
      else msg = err.message;
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
