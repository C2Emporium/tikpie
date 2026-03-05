import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";
import { buildFeedWithAds } from "@/lib/feed";
import type { FeedItem } from "@/types/video";

const UPLOAD_DIR = path.join(process.cwd(), "public", "videos");
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB
const ALLOWED_TYPES = ["video/mp4", "video/webm", "video/quicktime"];

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
      }))
    );
    return NextResponse.json(feed);
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";

  // Option 1 : ajout par URL (JSON) — pour contenu hébergé ailleurs (Cloudinary, Bunny, etc.)
  if (contentType.includes("application/json")) {
    try {
      if (!process.env.DATABASE_URL) {
        return NextResponse.json(
          {
            error:
              "DATABASE_URL manquante. Sur Vercel : Settings > Environment Variables > ajoutez DATABASE_URL (URL Neon).",
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
          { error: "URL et titre requis" },
          { status: 400 }
        );
      }

      if (!/^https?:\/\//i.test(url)) {
        return NextResponse.json(
          { error: "URL doit commencer par http:// ou https://" },
          { status: 400 }
        );
      }

      const video = await prisma.video.create({
        data: { url, title, likes },
      });
      return NextResponse.json(video, { status: 201 });
    } catch (e) {
      console.error("Add by URL error:", e);
      const message =
        e && typeof (e as { message?: string }).message === "string"
          ? (e as { message: string }).message
          : "Erreur lors de l’ajout. Vérifiez que DATABASE_URL est bien configurée sur Vercel.";
      return NextResponse.json(
        { error: message },
        { status: 500 }
      );
    }
  }

  // Option 2 : upload fichier (FormData) — désactivé sur Vercel (disque en lecture seule)
  if (process.env.VERCEL) {
    return NextResponse.json(
      {
        error:
          "En production, l’upload de fichier n’est pas disponible. Utilisez « Ajouter par URL » avec le lien direct d’une vidéo déjà en ligne (Cloudinary, Bunny, etc.).",
      },
      { status: 400 }
    );
  }

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

    if (!ALLOWED_TYPES.includes(file.type) && !file.name.match(/\.(mp4|webm|mov)$/i)) {
      return NextResponse.json(
        { error: "Format non supporté. Utilisez MP4, WebM ou MOV." },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Fichier trop volumineux (max 100 Mo)" },
        { status: 400 }
      );
    }

    await mkdir(UPLOAD_DIR, { recursive: true });

    const ext = path.extname(file.name) || ".mp4";
    const safeName = `v_${Date.now()}_${Math.random().toString(36).slice(2, 9)}${ext}`;
    const filePath = path.join(UPLOAD_DIR, safeName);

    const bytes = await file.arrayBuffer();
    await writeFile(filePath, Buffer.from(bytes));

    const url = `/videos/${safeName}`;

    const video = await prisma.video.create({
      data: { url, title: title.trim(), likes: 0 },
    });

    return NextResponse.json(video, { status: 201 });
  } catch (e) {
    console.error("Upload error:", e);
    return NextResponse.json(
      { error: "Erreur lors de l’upload" },
      { status: 500 }
    );
  }
}
