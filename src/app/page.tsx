"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MODELS } from "@/lib/models";

export default function Home() {
  const [query, setQuery] = useState("");
  const [modelId, setModelId] = useState("gpt-4o-mini");
  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem("serendex_model") ?? "gpt-4o-mini";
    setModelId(saved);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/feed?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <main className="min-h-screen bg-black flex flex-col items-center justify-center p-8 relative overflow-hidden">
      {/* Top Nav */}
      <nav className="absolute top-8 right-8 flex gap-6">
        <button 
          onClick={() => router.push('/about')}
          className="text-sm text-white/40 hover:text-white transition-colors"
        >
          How it works
        </button>
      </nav>

      <div className="text-center mb-12">
        <h1 className="text-5xl font-black tracking-tight text-white mb-2">
          SEREN<span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">DEX</span>
        </h1>
        <p className="text-white/40 text-sm tracking-widest uppercase">
          Agentic YouTube Discovery Engine
        </p>
      </div>

      <form onSubmit={handleSearch} className="w-full max-w-xl">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="What do you want to explore?"
            className="w-full bg-white/5 border border-white/10 text-white placeholder-white/30 rounded-2xl px-6 py-4 text-lg focus:outline-none focus:border-violet-500/50 transition-all"
          />
          <button
            type="submit"
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-gradient-to-r from-violet-500 to-cyan-500 text-white px-5 py-2 rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-40"
            disabled={!query.trim()}
          >
            Discover
          </button>
        </div>
        
        {/* Model Selector */}
        <div className="mt-4 flex items-center justify-center gap-3">
          <span className="text-[10px] text-white/20 uppercase tracking-widest font-bold">Powered by</span>
          <select
            value={modelId}
            onChange={(e) => {
              const val = e.target.value;
              setModelId(val);
              localStorage.setItem("serendex_model", val);
            }}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-[11px] text-white/60 focus:outline-none hover:bg-white/10 transition-colors font-medium cursor-pointer"
          >
            {MODELS.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>
      </form>

      <div className="flex flex-wrap gap-2 mt-8 justify-center">
        {[
          "🧠 Orchestrator Agent",
          "⚡ Content Analysis",
          "👤 User Profiling",
          "📈 Trend Scout",
          "🛡️ Diversity Guard",
          "💬 Explainable",
        ].map((label) => (
          <span key={label} className="text-xs text-white/40 border border-white/10 rounded-full px-3 py-1">
            {label}
          </span>
        ))}
      </div>

      <div className="mt-10 text-center">
        <p className="text-white/20 text-xs mb-4">Try these</p>
        <div className="flex flex-wrap gap-2 justify-center">
          {["machine learning", "system design", "startup advice", "physics", "cooking"].map((topic) => (
            <button
              key={topic}
              onClick={() => router.push(`/feed?q=${encodeURIComponent(topic)}`)}
              className="text-sm text-white/50 hover:text-white border border-white/10 hover:border-white/20 rounded-lg px-3 py-1.5 transition-all"
            >
              {topic}
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}
