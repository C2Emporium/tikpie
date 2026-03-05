"use client";

import { useRef, useState, useCallback } from "react";
import VideoSlide from "./VideoSlide";
import AdBanner from "./AdBanner";
import { buildFeedWithAds } from "@/lib/feed";
import type { FeedItem } from "@/types/video";

interface VerticalFeedProps {
  items: FeedItem[];
}

export default function VerticalFeed({ items: initialItems }: VerticalFeedProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const items = initialItems.length > 0 ? initialItems : getMockFeed();

  const handleScroll = useCallback(() => {
    const container = scrollRef.current;
    if (!container) return;

    const scrollTop = container.scrollTop;
    const itemHeight = window.innerHeight - 56 - 64; // header 56px, nav 64px
    const index = Math.round(scrollTop / itemHeight);
    setActiveIndex(Math.max(0, Math.min(index, items.length - 1)));
  }, [items.length]);

  return (
    <div
      ref={scrollRef}
      className="h-[100dvh] overflow-y-auto snap-y snap-mandatory hide-scrollbar pt-14 pb-16"
      onScroll={handleScroll}
      style={{ scrollSnapType: "y mandatory" }}
    >
      {items.map((item, index) => {
        if (item.type === "ad") {
          return <AdBanner key={item.id} />;
        }
        return (
          <VideoSlide
            key={item.data.id}
            video={item.data}
            isActive={activeIndex === index}
          />
        );
      })}
    </div>
  );
}

function getMockFeed(): FeedItem[] {
  const mockVideos = [
    { id: "1", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4", title: "Big Buck Bunny", likes: 12400 },
    { id: "2", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4", title: "Elephant's Dream", likes: 8300 },
    { id: "3", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4", title: "For Bigger Blazes", likes: 5200 },
    { id: "4", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4", title: "For Bigger Escapes", likes: 9100 },
    { id: "5", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4", title: "For Bigger Fun", likes: 4400 },
    { id: "6", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4", title: "For Bigger Joyrides", likes: 6700 },
    { id: "7", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4", title: "For Bigger Meltdowns", likes: 3200 },
    { id: "8", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4", title: "Sintel", likes: 15800 },
    { id: "9", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4", title: "Subaru Outback", likes: 2100 },
    { id: "10", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4", title: "Tears of Steel", likes: 9900 },
  ];
  return buildFeedWithAds(mockVideos);
}
