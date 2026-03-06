"use client";

import { useRef, useEffect, useState } from "react";
import type { VideoItem } from "@/types/video";

const LAZY_ROOT_MARGIN = "100px";

interface ImageSlideProps {
  video: VideoItem;
}

export default function ImageSlide({ video }: ImageSlideProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setShouldLoad(true);
        });
      },
      { rootMargin: LAZY_ROOT_MARGIN, threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full slide-height snap-start flex items-center justify-center bg-zinc-900"
    >
      {shouldLoad ? (
        <>
          <img
            src={video.url}
            alt={video.title}
            className="absolute inset-0 w-full h-full object-contain bg-black"
          />
          <div className="absolute bottom-0 left-0 right-0 p-4 pb-8 bg-gradient-to-t from-black/80 to-transparent">
            <p className="text-white font-medium text-sm line-clamp-2">{video.title}</p>
            <p className="text-zinc-400 text-xs mt-1">{video.likes} likes</p>
          </div>
        </>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-800">
          <div className="w-12 h-12 border-2 border-zinc-600 border-t-white rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
