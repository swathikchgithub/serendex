import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-violet-500/30">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/60 backdrop-blur-xl border-b border-white/5 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="font-black text-xl hover:opacity-80 transition-opacity">
            SEREN<span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">DEX</span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/" className="text-sm text-white/60 hover:text-white transition-colors">Home</Link>
            <Link href="/about" className="text-sm text-white font-medium">How it works</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-16 md:py-24">
        {/* Hero Section */}
        <div className="mb-24 text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">
            How <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">SERENDEX</span> works
          </h1>
          <p className="text-xl text-white/50 leading-relaxed">
            Standard recommendation algorithms optimize for watch time. We optimize for 
            <span className="text-white"> understanding</span>, <span className="text-white">diversity</span>, and <span className="text-white">serendipity</span>.
          </p>
        </div>

        {/* The Orchestrator Section */}
        <section className="mb-32">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-bold mb-4 uppercase tracking-widest">
                The Brain
              </div>
              <h2 className="text-3xl font-bold mb-6">The Orchestrator Agent</h2>
              <p className="text-white/60 text-lg mb-6 leading-relaxed">
                When you enter a search query, a central Orchestrator (powered by Claude 3.5) determines the best discovery strategy. 
                It doesn't just search; it delegates work to specialized agents in parallel.
              </p>
              <ul className="space-y-4">
                <li className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-xs text-white/40">1</div>
                  <p className="text-white/80">Analyzes the search intent and user history.</p>
                </li>
                <li className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-xs text-white/40">2</div>
                  <p className="text-white/80">Assigns "confidence weights" to different recommendation paths.</p>
                </li>
                <li className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-xs text-white/40">3</div>
                  <p className="text-white/80">Merges results based on semantic relevance and trend velocity.</p>
                </li>
              </ul>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 aspect-square flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-transparent"></div>
              <div className="relative flex flex-col items-center gap-4">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-r from-violet-500 to-cyan-500 flex items-center justify-center text-3xl shadow-2xl shadow-violet-500/20">🧠</div>
                <div className="flex gap-2">
                  <div className="w-12 h-1 bg-violet-500/20 rounded-full animate-pulse"></div>
                  <div className="w-8 h-1 bg-cyan-500/20 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <div className="grid grid-cols-2 gap-3 w-full max-w-[240px] mt-4">
                   <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-[10px] text-white/40 text-center uppercase tracking-tighter">Content Agent</div>
                   <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-[10px] text-white/40 text-center uppercase tracking-tighter">Profiling Agent</div>
                   <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-[10px] text-white/40 text-center uppercase tracking-tighter">Trend Agent</div>
                   <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-[10px] text-white/40 text-center uppercase tracking-tighter">Guard Agent</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* The Specialized Agents */}
        <section className="mb-32">
          <h2 className="text-3xl font-bold mb-12 text-center">Specialized Worker Agents</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-violet-500/30 transition-all group">
              <div className="text-3xl mb-6 group-hover:scale-110 transition-transform origin-left">⚡</div>
              <h3 className="text-xl font-bold mb-3">Content Analysis</h3>
              <p className="text-white/40 text-sm leading-relaxed">
                Uses vector embeddings (Voyage AI) to understand the "meaning" of videos. It finds connections based on concepts, not just keywords.
              </p>
            </div>
            <div className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-cyan-500/30 transition-all group">
              <div className="text-3xl mb-6 group-hover:scale-110 transition-transform origin-left">👤</div>
              <h3 className="text-xl font-bold mb-3">User Profiling</h3>
              <p className="text-white/40 text-sm leading-relaxed">
                Maintains a temporal interest graph in Redis. It tracks how your interests evolve over time to suggest what you'll want to learn next.
              </p>
            </div>
            <div className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-pink-500/30 transition-all group">
              <div className="text-3xl mb-6 group-hover:scale-110 transition-transform origin-left">📈</div>
              <h3 className="text-xl font-bold mb-3">Trend Scout</h3>
              <p className="text-white/40 text-sm leading-relaxed">
                Monitors view velocity and social signals to detect rising topics before they hit the main YouTube algorithms.
              </p>
            </div>
          </div>
        </section>

        {/* System Design Section */}
        <section className="mb-32">
          <div className="p-12 rounded-[40px] bg-gradient-to-b from-white/5 to-transparent border border-white/10">
             <h2 className="text-3xl font-bold mb-4">System Architecture</h2>
             <p className="text-white/40 mb-12">Built for low latency and high scalability on Vercel.</p>
             
             <div className="space-y-12">
                <div className="flex flex-col md:flex-row gap-8 items-start">
                   <div className="flex-1">
                      <h4 className="text-white font-bold mb-2">1. Vector Memory (Postgres + pgvector)</h4>
                      <p className="text-white/40 text-sm">We store thousands of high-quality educational video embeddings in Neon Postgres. This allows for "semantic search" that is 100x more accurate than keyword matching.</p>
                   </div>
                   <div className="flex-1">
                      <h4 className="text-white font-bold mb-2">2. Temporal Cache (Upstash Redis)</h4>
                      <p className="text-white/40 text-sm">User session data and recent events are stored in Redis for sub-millisecond access. This feeds the Profiling Agent's real-time reasoning.</p>
                   </div>
                </div>
                <div className="flex flex-col md:flex-row gap-8 items-start">
                   <div className="flex-1">
                      <h4 className="text-white font-bold mb-2">3. Explainable AI</h4>
                      <p className="text-white/40 text-sm">Every recommendation is passed through an Explanation Agent (Sonnet 3.5) that writes a personalized reason why you might find it interesting.</p>
                   </div>
                   <div className="flex-1">
                      <h4 className="text-white font-bold mb-2">4. Diversity Guard</h4>
                      <p className="text-white/40 text-sm">A final agentic layer checks the proposed list for "filter bubbles" and injects serendipitous content to keep your discoveries fresh.</p>
                   </div>
                </div>
             </div>
          </div>
        </section>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-8">Ready to discover?</h2>
          <Link 
            href="/"
            className="inline-flex items-center justify-center bg-white text-black px-8 py-4 rounded-2xl font-bold hover:bg-white/90 transition-all"
          >
            Go to Search
          </Link>
        </div>
      </main>

      <footer className="border-t border-white/5 py-12 px-6 mt-20">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-white/30 text-sm">
            © 2026 SERENDEX Agentic Discovery Engine
          </div>
          <div className="text-white/20 text-[10px] uppercase tracking-widest font-mono">
            Powered by Claude 3.5 & pgvector
          </div>
        </div>
      </footer>
    </div>
  );
}
