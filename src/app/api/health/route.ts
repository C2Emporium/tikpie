import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const isBuild =
  process.env.NEXT_PHASE === "phase-production-build" ||
  process.env.SKIP_DB === "1";

export async function GET() {
  if (isBuild) {
    return NextResponse.json({ ok: true, build: true });
  }
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { ok: false, error: "DATABASE_URL non configurée (Vercel > Settings > Environment Variables)" },
        { status: 500 }
      );
    }
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erreur inconnue";
    return NextResponse.json(
      { ok: false, error: message },
      { status: 500 }
    );
  }
}
