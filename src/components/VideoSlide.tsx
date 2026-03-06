"use client";

import { useRef, useEffect, useState, useCallback } from "react";
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
  const [loadError, setLoadError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(false);
  const hideControlsTimer = useRef<ReturnType<typeof setTimeout>>();

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

  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl || !shouldLoad) return;

    if (isActive && isInView) {
      videoEl.play().catch(() => {});
      setIsPlaying(true);
    } else {
      videoEl.pause();
      setIsPlaying(false);
    }
  }, [isActive, isInView, shouldLoad]);

  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    const onTimeUpdate = () => setCurrentTime(videoEl.currentTime);
    const onDurationChange = () => setDuration(videoEl.duration);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    videoEl.addEventListener("timeupdate", onTimeUpdate);
    videoEl.addEventListener("durationchange", onDurationChange);
    videoEl.addEventListener("play", onPlay);
    videoEl.addEventListener("pause", onPause);
    return () => {
      videoEl.removeEventListener("timeupdate", onTimeUpdate);
      videoEl.removeEventListener("durationchange", onDurationChange);
      videoEl.removeEventListener("play", onPlay);
      videoEl.removeEventListener("pause", onPause);
    };
  }, [shouldLoad]);

  const togglePlay = useCallback(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;
    if (videoEl.paused) {
      videoEl.play().catch(() => {});
    } else {
      videoEl.pause();
    }
  }, []);

  const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const bar = e.currentTarget;
    const rect = bar.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const videoEl = videoRef.current;
    if (videoEl && duration > 0) {
      videoEl.currentTime = percent * duration;
    }
  }, [duration]);

  const handleTouchProgress = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      const bar = e.currentTarget;
      const rect = bar.getBoundingClientRect();
      const touch = e.changedTouches?.[0] || e.touches?.[0];
      if (!touch) return;
      const percent = Math.max(0, Math.min(1, (touch.clientX - rect.left) / rect.width));
      const videoEl = videoRef.current;
      if (videoEl && duration > 0) {
        videoEl.currentTime = percent * duration;
      }
    },
    [duration]
  );

  const scheduleHideControls = useCallback(() => {
    if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
    setShowControls(true);
    hideControlsTimer.current = setTimeout(() => setShowControls(false), 2500);
  }, []);

  useEffect(() => {
    return () => {
      if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
    };
  }, []);

  useEffect(() => {
    setLoadError(false);
  }, [video.url]);

  const formatTime = (s: number) => {
    if (!isFinite(s) || s < 0) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className="relative w-full slide-height snap-start flex items-center justify-center bg-zinc-900"
      onClick={scheduleHideControls}
      onTouchStart={scheduleHideControls}
    >
      {shouldLoad ? (
        loadError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-zinc-900">
            <p className="text-zinc-400 text-sm mb-2">Vidéo non lisible</p>
            <a
              href={video.url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-lg bg-zinc-700 text-white text-sm hover:bg-zinc-600 break-all"
            >
              Ouvrir la vidéo
            </a>
            <div className="absolute bottom-0 left-0 right-0 p-4 pb-8 bg-gradient-to-t from-black/80 to-transparent text-left">
              <p className="text-white font-medium text-sm line-clamp-2">{video.title}</p>
              <p className="text-zinc-400 text-xs mt-1">{video.likes} likes</p>
            </div>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              src={video.url}
              className="absolute inset-0 w-full h-full object-cover cursor-pointer"
              loop
              muted={isMuted}
              playsInline
              preload="auto"
              onError={() => setLoadError(true)}
              onClick={(e) => {
                e.stopPropagation();
                togglePlay();
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                togglePlay();
              }}
            />

            {/* Bouton play/pause central quand pause */}
            {!isPlaying && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  togglePlay();
                }}
                className="absolute inset-0 flex items-center justify-center z-10"
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                <div className="w-20 h-20 rounded-full bg-black/60 flex items-center justify-center">
                  <svg className="w-10 h-10 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7L8 5z" />
                  </svg>
                </div>
              </button>
            )}

            {/* Overlay infos */}
            <div className="absolute bottom-0 left-0 right-0 p-4 pb-8 bg-gradient-to-t from-black/80 to-transparent">
              <p className="text-white font-medium text-sm line-clamp-2">{video.title}</p>
              <p className="text-zinc-400 text-xs mt-1">{video.likes} likes</p>
            </div>

            {/* Barre de progression + temps + mute */}
            <div
              className={`absolute left-0 right-0 bottom-0 flex flex-col pb-2 transition-opacity duration-300 ${
                showControls || !isPlaying ? "opacity-100" : "opacity-0"
              }`}
            >
              <div
                className="h-1 bg-zinc-600/80 rounded-full mx-4 mb-1 cursor-pointer touch-none"
                onClick={(e) => {
                  e.stopPropagation();
                  handleProgressClick(e);
                }}
                onTouchEnd={(e) => {
                  e.stopPropagation();
                  handleTouchProgress(e);
                }}
              >
                <div
                  className="h-full bg-white rounded-full transition-[width]"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="flex items-center justify-between px-4 text-xs text-zinc-400">
                <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMuted((m) => !m);
                  }}
                  className="p-1 rounded hover:bg-white/10"
                  aria-label={isMuted ? "Activer le son" : "Couper le son"}
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
              </div>
            </div>
          </>
        )
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-800">
          <div className="w-12 h-12 border-2 border-zinc-600 border-t-white rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
