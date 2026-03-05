import type { FeedItem, VideoItem } from "@/types/video";

const AD_EVERY_N = 5;

export function buildFeedWithAds(videos: VideoItem[]): FeedItem[] {
  const feed: FeedItem[] = [];
  videos.forEach((video, index) => {
    if (index > 0 && index % AD_EVERY_N === 0) {
      feed.push({ type: "ad", id: `ad-${index}` });
    }
    feed.push({ type: "video", data: video });
  });
  return feed;
}
