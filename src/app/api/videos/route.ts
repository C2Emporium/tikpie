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
