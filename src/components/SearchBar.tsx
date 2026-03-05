"use client";

import { useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";

interface SearchBarProps {
  placeholder?: string;
  className?: string;
  onSearch?: (q: string) => void;
}

export default function SearchBar({
  placeholder = "Rechercher",
  className = "",
  onSearch,
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const router = useRouter();
  const pathname = usePathname();

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const q = query.trim();
      if (!q) return;
      if (onSearch) {
        onSearch(q);
        return;
      }
      router.push(`/search?q=${encodeURIComponent(q)}`);
    },
    [query, router, onSearch]
  );

  return (
    <form onSubmit={handleSubmit} className={`flex-1 min-w-0 max-w-xl ${className}`} role="search">
      <label htmlFor="search-input" className="sr-only">
        {placeholder}
      </label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </span>
        <input
          id="search-input"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          autoComplete="off"
          className="w-full h-9 md:h-10 pl-9 pr-4 rounded-full bg-zinc-800/90 border border-zinc-600/50 text-white placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent"
        />
      </div>
    </form>
  );
}
