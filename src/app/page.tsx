import { prisma } from "@/lib/prisma";
import { buildFeedWithAds } from "@/lib/feed";
import type { FeedItem } from "@/types/video";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";
import VerticalFeed from "@/components/VerticalFeed";

// Évite la génération statique au build (DB non disponible sur Vercel à ce moment)
export const dynamic = "force-dynamic";

export default async function HomePage() {
  let feed: FeedItem[] = [];

  // Pendant le build (ex: Vercel), ne pas appeler la DB pour éviter exit 1.
  // Sur Vercel : ajoute SKIP_DB=1 dans Settings > Environment Variables, scope "Build" uniquement.
  const skipDb =
    process.env.NEXT_PHASE === "phase-production-build" ||
    process.env.SKIP_DB === "1";
  if (!skipDb) {
    try {
      const videos = await prisma.video.findMany({
        orderBy: { createdAt: "desc" },
      });
      feed = buildFeedWithAds(
        videos.map((v) => ({
          id: v.id,
          url: v.url,
          title: v.title,
          likes: v.likes,
        }))
      );
    } catch {
      feed = [];
    }
  }

  return (
    <main id="main-content" className="min-h-screen bg-black dark" role="main">
      <AppHeader />
      <VerticalFeed items={feed} />
      <BottomNav />
    </main>
  );
}
