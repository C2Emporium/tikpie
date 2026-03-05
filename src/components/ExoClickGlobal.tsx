"use client";

import Script from "next/script";

export default function ExoClickGlobal() {
  const onScriptLoad = () => {
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

  return (
    <>
      <Script
        src="https://a.magsrv.com/ad-provider.js"
        strategy="afterInteractive"
        onLoad={onScriptLoad}
      />
      <ins className="eas6a97888e10" data-zoneid="5865762" />
    </>
  );
}
