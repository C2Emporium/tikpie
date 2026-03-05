/**
 * Configuration des bannières pub (contenu adulte).
 * Utilise uniquement des variables NEXT_PUBLIC_* (exposées au client).
 *
 * Option A – iframe (ExoClick, TrafficJunky, etc.) :
 *   NEXT_PUBLIC_AD_IFRAME_URL=https://a.xxx.com/iframe.php?idzone=TON_ZONE_ID&size=300x250
 *
 * Option B – script async (ExoClick) :
 *   NEXT_PUBLIC_AD_SCRIPT_URL=https://a.xxx.com/ads.js
 *   NEXT_PUBLIC_AD_ZONE_ID=1234567
 */

const ZONE_ID = process.env.NEXT_PUBLIC_AD_ZONE_ID ?? "";
const SCRIPT_URL = process.env.NEXT_PUBLIC_AD_SCRIPT_URL ?? "";
const IFRAME_URL = process.env.NEXT_PUBLIC_AD_IFRAME_URL ?? "";

export const adConfig = {
  /** Zone ID pour le script async (ExoClick, etc.) */
  zoneId: ZONE_ID,
  /** URL du script pub (ExoClick async) */
  scriptUrl: SCRIPT_URL,
  /** URL complète de l’iframe (ExoClick iframe, ou autre réseau). Prioritaire si définie. */
  iframeUrl: IFRAME_URL,
  /** Taille standard du bandeau dans le flux */
  bannerWidth: 300,
  bannerHeight: 250,
} as const;

export function hasBannerAd(): boolean {
  return !!adConfig.iframeUrl || (!!adConfig.scriptUrl && !!adConfig.zoneId);
}
