"use client";

import Logo from "./Logo";
import SearchBar from "./SearchBar";
import Link from "next/link";

export default function AppHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-30 h-14 md:h-16 px-3 md:px-4 flex items-center justify-between gap-3 bg-black/70 backdrop-blur-md border-b border-white/5 safe-area-inset-top">
      <Logo href="/" />
      <SearchBar placeholder="Rechercher vidéos..." className="hidden sm:flex" />
      <nav className="flex items-center gap-1 shrink-0" aria-label="Recherche">
        <Link
          href="/search"
          className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors sm:hidden"
          aria-label="Rechercher"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </Link>
      </nav>
    </header>
  );
}
