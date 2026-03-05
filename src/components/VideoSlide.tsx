"use client";

import { useRef, useEffect, useState } from "react";
import type { VideoItem } from "@/types/video";

const LAZY_ROOT_MARGIN = "100px";

interface VideoSlideProps {
  video: VideoItem;
  isActive: boolean;
}

export default function VideoSlide({ video, isActive }: VideoSlideProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [isInView, setIsInView] = useState(false);

  // Lazy load: observer pour charger la vidéo quand le slide approche
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShouldLoad(true);
            setIsInView(true);
          } else {
            setIsInView(false);
          }
        });
      },
      { rootMargin: LAZY_ROOT_MARGIN, threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Auto-play / pause selon visibilité
  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl || !shouldLoad) return;

    if (isActive && isInView) {
      videoEl.play().catch(() => {});
    } else {
      videoEl.pause();
    }
  }, [isActive, isInView, shouldLoad]);

  return (
    <div
      ref={containerRef}
      className="relative w-full slide-height snap-start flex items-center justify-center bg-zinc-900"
    >
      {shouldLoad ? (
        <>
          <video
            ref={videoRef}
            src={video.url}
            className="absolute inset-0 w-full h-full object-cover"
            loop
            muted={isMuted}
            playsInline
            preload="metadata"
          />
          {/* Overlay UI style TikTok */}
          <div className="absolute bottom-0 left-0 right-0 p-4 pb-8 bg-gradient-to-t from-black/80 to-transparent">
            <p className="text-white font-medium text-sm line-clamp-2">{video.title}</p>
            <p className="text-zinc-400 text-xs mt-1">{video.likes} likes</p>
          </div>
          <button
            type="button"
            onClick={() => setIsMuted((m) => !m)}
            className="absolute bottom-20 right-4 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
            aria-label={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
              </svg>
            )}
          </button>
        </>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-800">
          <div className="w-12 h-12 border-2 border-zinc-600 border-t-white rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
