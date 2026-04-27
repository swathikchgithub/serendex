"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export function Header({ title }: { title?: string }) {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-10 bg-black/80 backdrop-blur border-b border-white/10 px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-black text-xl shrink-0">
            SEREN<span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">DEX</span>
          </Link>
          <nav className="flex items-center gap-1 text-sm text-white/40">
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
      </div>
    </header>
  );
}
