"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function Header({ title }: { title?: string }) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/feed?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-20 bg-black/80 backdrop-blur border-b border-white/10 px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-6 shrink-0">
          <Link href="/" className="font-black text-xl">
            SEREN<span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">DEX</span>
          </Link>
          <nav className="hidden md:flex items-center gap-1 text-sm text-white/40">
            <Link href="/" className="hover:text-white/70 transition-colors">Home</Link>
            <span className="mx-1">/</span>
            <button 
              onClick={() => router.back()}
              className="hover:text-white/70 transition-colors flex items-center gap-1"
            >
              Results
            </button>
            {title && (
              <>
                <span className="mx-1">/</span>
                <span className="text-white/60 truncate max-w-[100px] sm:max-w-xs">{title}</span>
              </>
            )}
          </nav>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex-1 max-w-md hidden sm:block">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search something else..."
              className="w-full bg-white/5 border border-white/10 text-white text-xs placeholder-white/20 rounded-xl px-4 py-2 focus:outline-none focus:border-violet-500/50 transition-all"
            />
          </div>
        </form>

        {/* Mobile Search Toggle or just Spacer */}
        <div className="shrink-0 flex items-center gap-4">
          <Link 
            href="/about"
            className="text-xs text-white/40 hover:text-white transition-colors"
          >
            How it works
          </Link>
        </div>
      </div>
    </header>
  );
}
