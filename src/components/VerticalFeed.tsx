"use client";

import { useRef, useState, useCallback } from "react";
import VideoSlide from "./VideoSlide";
import AdBanner from "./AdBanner";
import type { FeedItem } from "@/types/video";

interface VerticalFeedProps {
  items: FeedItem[];
}

export default function VerticalFeed({ items: initialItems }: VerticalFeedProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const items = initialItems;

  const handleScroll = useCallback(() => {
    const container = scrollRef.current;
    if (!container) return;

    const scrollTop = container.scrollTop;
    const itemHeight = window.innerHeight - 56 - 64; // header 56px, nav 64px
    const index = Math.round(scrollTop / itemHeight);
    setActiveIndex(Math.max(0, Math.min(index, items.length - 1)));
  }, [items.length]);

  if (items.length === 0) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center pt-14 pb-16">
        <div className="text-center text-zinc-500 px-4">
          <p className="text-lg font-medium">Aucune vidéo pour le moment</p>
          <p className="text-sm mt-2">Le contenu apparaîtra ici.</p>
        </div>
      </div>
    );
  }

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
