"use client";

import { useEffect, useState } from "react";

export function SystemArchitectureDiagram() {
  const [activeNode, setActiveNode] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveNode((n) => (n + 1) % 5);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full bg-white/5 rounded-[40px] p-8 md:p-12 border border-white/10 relative overflow-hidden mb-32">
      <div className="flex flex-col items-center gap-12 max-w-4xl mx-auto py-12">
        
        {/* User Node */}
        <div className={`relative transition-all duration-500 ${activeNode === 0 ? 'scale-110' : 'opacity-40'}`}>
          <div className="bg-white/10 p-6 rounded-2xl border border-white/20 flex flex-col items-center">
            <span className="text-3xl mb-2">👤</span>
            <span className="text-xs font-bold uppercase tracking-widest">User Query</span>
          </div>
          {activeNode === 0 && (
            <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 text-violet-400 animate-bounce">↓</div>
          )}
        </div>

        {/* Orchestrator Node */}
        <div className={`relative transition-all duration-500 ${activeNode === 1 ? 'scale-110' : 'opacity-40'}`}>
          <div className="bg-gradient-to-br from-violet-600/40 to-cyan-600/40 p-8 rounded-3xl border border-white/30 flex flex-col items-center shadow-2xl shadow-violet-500/20">
            <span className="text-3xl mb-2">🧠</span>
            <span className="text-sm font-black uppercase tracking-tighter">AI Orchestrator</span>
            <div className="mt-4 flex gap-2">
              <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse delay-75" />
              <span className="w-2 h-2 rounded-full bg-pink-400 animate-pulse delay-150" />
            </div>
          </div>
          
          {/* Moving Arrows to Agents */}
          {activeNode === 1 && (
            <>
              <div className="absolute top-1/2 -left-24 w-20 h-px bg-gradient-to-r from-transparent to-violet-500 animate-pulse" />
              <div className="absolute top-1/2 -right-24 w-20 h-px bg-gradient-to-l from-transparent to-cyan-500 animate-pulse" />
            </>
          )}
        </div>

        {/* Agent Row */}
        <div className="grid grid-cols-3 gap-8 w-full max-w-2xl">
          <div className={`p-4 rounded-xl border border-white/10 bg-white/5 flex flex-col items-center transition-all duration-500 ${activeNode === 2 ? 'scale-110 border-violet-500 bg-violet-500/10' : 'opacity-40'}`}>
            <span className="text-xl mb-1">⚡</span>
            <span className="text-[10px] font-bold uppercase text-center">Content Analysis</span>
          </div>
          <div className={`p-4 rounded-xl border border-white/10 bg-white/5 flex flex-col items-center transition-all duration-500 ${activeNode === 2 ? 'scale-110 border-cyan-500 bg-cyan-500/10' : 'opacity-40'}`}>
            <span className="text-xl mb-1">👤</span>
            <span className="text-[10px] font-bold uppercase text-center">User Profiling</span>
          </div>
          <div className={`p-4 rounded-xl border border-white/10 bg-white/5 flex flex-col items-center transition-all duration-500 ${activeNode === 2 ? 'scale-110 border-pink-500 bg-pink-500/10' : 'opacity-40'}`}>
            <span className="text-xl mb-1">📈</span>
            <span className="text-[10px] font-bold uppercase text-center">Trend Scout</span>
          </div>
        </div>

        {/* Infrastructure Row */}
        <div className="flex gap-12 w-full justify-center">
           <div className={`relative transition-all duration-500 ${activeNode === 3 ? 'scale-110' : 'opacity-40'}`}>
             <div className="bg-red-500/10 p-6 rounded-2xl border border-red-500/30 flex flex-col items-center">
               <span className="text-2xl mb-1">🗄️</span>
               <span className="text-[10px] font-bold uppercase text-red-400">Upstash Redis</span>
               <span className="text-[8px] text-red-300/50 mt-1">Smart Caching</span>
             </div>
           </div>
           <div className={`relative transition-all duration-500 ${activeNode === 3 ? 'scale-110' : 'opacity-40'}`}>
             <div className="bg-blue-500/10 p-6 rounded-2xl border border-blue-500/30 flex flex-col items-center">
               <span className="text-2xl mb-1">📺</span>
               <span className="text-[10px] font-bold uppercase text-blue-400">YouTube API</span>
               <span className="text-[8px] text-blue-300/50 mt-1">Content Source</span>
             </div>
           </div>
        </div>

        {/* Final Output */}
        <div className={`relative transition-all duration-500 ${activeNode === 4 ? 'scale-110' : 'opacity-40'}`}>
           <div className="bg-green-500/20 p-8 rounded-full border border-green-500/50 flex flex-col items-center shadow-[0_0_30px_rgba(34,197,94,0.3)] animate-pulse">
             <span className="text-4xl">✨</span>
             <span className="text-xs font-black uppercase text-green-400 mt-2">Personalized Discovery</span>
           </div>
        </div>

      </div>

      {/* Decorative Lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20" xmlns="http://www.w3.org/2000/svg">
        <path d="M 512 100 L 512 250" stroke="white" strokeWidth="2" strokeDasharray="5,5" fill="none" />
        <path d="M 300 450 L 512 280 L 724 450" stroke="white" strokeWidth="2" strokeDasharray="5,5" fill="none" />
      </svg>
    </div>
  );
}
