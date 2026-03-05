"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";
import { adConfig, hasBannerAd } from "@/lib/ad-config";

const { bannerWidth, bannerHeight } = adConfig;

export default function AdBanner() {
  const containerRef = useRef<HTMLDivElement>(null);

  const onScriptLoad = () => {
    if (!adConfig.scriptUrl || !adConfig.zoneId || adConfig.iframeUrl) return;
    try {
      (window as unknown as { AdProvider?: unknown[] }).AdProvider =
        (window as unknown as { AdProvider?: unknown[] }).AdProvider || [];
      (window as unknown as { AdProvider: { push: (x: unknown) => void } }).AdProvider.push({
        serve: {},
      });
    } catch {
      // ignore
    }
  };

  if (!hasBannerAd()) {
    return <AdBannerPlaceholder />;
  }

  // Option 1 : iframe (recommandé, compatible tous réseaux)
  if (adConfig.iframeUrl) {
    return (
      <div className="snap-start flex items-center justify-center slide-height w-full bg-zinc-900/80">
        <div
          className="overflow-hidden rounded-lg bg-zinc-800"
          style={{ width: bannerWidth, height: bannerHeight }}
        >
          <iframe
            title="Publicité"
            src={adConfig.iframeUrl}
            width={bannerWidth}
            height={bannerHeight}
            scrolling="no"
            frameBorder={0}
            className="block"
            sandbox="allow-scripts allow-same-origin allow-popups"
          />
        </div>
      </div>
    );
  }

  // Option 2 : script async + ins (ExoClick)
  return (
    <div className="snap-start flex items-center justify-center slide-height w-full bg-zinc-900/80">
      <Script
        src={adConfig.scriptUrl}
        strategy="afterInteractive"
        onLoad={onScriptLoad}
      />
      <div
        ref={containerRef}
        className="overflow-hidden rounded-lg bg-zinc-800 flex items-center justify-center"
        style={{ width: bannerWidth, height: bannerHeight }}
      >
        <ins
          className="adsbynetwork"
          data-zoneid={adConfig.zoneId}
          style={{ display: "block", width: bannerWidth, height: bannerHeight }}
        />
      </div>
    </div>
  );
}

function AdBannerPlaceholder() {
  return (
    <div
      className="snap-start flex items-center justify-center slide-height w-full bg-zinc-800/80 border border-zinc-600"
      role="img"
      aria-label="Emplacement publicitaire"
    >
      <div
        className="flex flex-col items-center justify-center bg-zinc-800 border-2 border-dashed border-zinc-600 rounded-lg text-zinc-500 text-sm"
        style={{ width: bannerWidth, height: bannerHeight }}
      >
        <span className="text-xs uppercase tracking-wider mb-2">Pub</span>
        <span>{bannerWidth} × {bannerHeight}</span>
      </div>
    </div>
  );
}
