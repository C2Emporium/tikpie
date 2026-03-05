"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useCallback } from "react";

/**
 * Logo Tikpie – image logo.png si présente, sinon fallback texte (pour éviter 404).
 * Tailles affichées : 32 px (mobile), 40 px (desktop) via className h-8 md:h-10.
 */
interface LogoProps {
  className?: string;
  href?: string;
}

function LogoFallback({ className = "" }: { className?: string }) {
  return (
    <span
      className={`font-bold text-lg tracking-tight text-white select-none h-8 md:h-10 flex items-center ${className}`}
      aria-hidden
    >
      Tikpie
    </span>
  );
}

export default function Logo({ className = "", href = "/" }: LogoProps) {
  const [imgFailed, setImgFailed] = useState(false);
  const handleImgError = useCallback(() => setImgFailed(true), []);

  const content = imgFailed ? (
    <LogoFallback className={className} />
  ) : (
    <Image
      src="/logo.png"
      alt="Tikpie"
      width={126}
      height={35}
      className={`object-contain object-left h-8 w-auto md:h-10 ${className}`}
      priority
      sizes="(max-width: 768px) 115px, 144px"
      onError={handleImgError}
    />
  );

  return href ? (
    <Link href={href} className="inline-flex items-center hover:opacity-90 transition-opacity" aria-label="Tikpie Accueil">
      {content}
    </Link>
  ) : (
    <span className="inline-flex items-center">{content}</span>
  );
}
