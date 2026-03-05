import Link from "next/link";
import Image from "next/image";

/**
 * Logo Tikpie – image logo.png (origine 126×35 px).
 * Tailles affichées : 32 px (mobile), 40 px (desktop) via className h-8 md:h-10.
 */
interface LogoProps {
  className?: string;
  href?: string;
}

export default function Logo({ className = "", href = "/" }: LogoProps) {
  const content = (
    <Image
      src="/logo.png"
      alt="Tikpie"
      width={126}
      height={35}
      className={`object-contain object-left h-8 w-auto md:h-10 ${className}`}
      priority
      sizes="(max-width: 768px) 115px, 144px"
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
