import { prisma } from "@/lib/prisma";
import { buildFeedWithAds } from "@/lib/feed";
import type { FeedItem } from "@/types/video";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";
import VerticalFeed from "@/components/VerticalFeed";

export default async function HomePage() {
  let feed: FeedItem[] = [];

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

  return (
    <main id="main-content" className="min-h-screen bg-black dark" role="main">
      <AppHeader />
      <VerticalFeed items={feed} />
      <BottomNav />
    </main>
  );
}
