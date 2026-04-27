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
            SERENDEX is a multi-agent discovery engine. Unlike traditional algorithms that trap you in "filter bubbles," 
            we use agentic reasoning to actively explore new horizons based on your latent interests.
          </p>
        </div>

        {/* AI Reasoning Section */}
        <section className="mb-32">
          <div className="p-8 md:p-12 rounded-[40px] bg-white/5 border border-white/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 text-6xl opacity-10">🤖</div>
            <h2 className="text-3xl font-bold mb-8">How we use AI</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
               <div>
                  <h3 className="text-violet-400 font-bold mb-3 uppercase tracking-widest text-xs">The Reasoning Loop</h3>
                  <p className="text-white/60 leading-relaxed mb-6">
                    We use <strong>Claude 3.5</strong> as a reasoning engine. When you search, the AI doesn't just look for matches; it asks itself: 
                    <em>"What concepts underpin this query? What is the user trying to learn?"</em>
                  </p>
                  <p className="text-white/60 leading-relaxed">
                    This allows the system to perform <strong>multi-step discovery</strong>—searching for tutorials, then deep dives, then critical news—to build a complete picture of a topic for you.
                  </p>
               </div>
               <div>
                  <h3 className="text-cyan-400 font-bold mb-3 uppercase tracking-widest text-xs">Semantic Memory</h3>
                  <p className="text-white/60 leading-relaxed mb-6">
                    Using <strong>Voyage AI embeddings</strong> and <strong>pgvector</strong>, we convert video titles and transcripts into 1024-dimensional vectors.
                  </p>
                  <p className="text-white/60 leading-relaxed">
                    This means if you search for "system design," we can find videos about "scalability" and "load balancing" even if they don't contain your exact search words.
                  </p>
               </div>
            </div>
          </div>
        </section>

        {/* The Specialized Agents */}
        <section className="mb-32">
          <h2 className="text-3xl font-bold mb-12 text-center">The Agentic Workflow</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-violet-500/30 transition-all group">
              <div className="text-3xl mb-6 group-hover:scale-110 transition-transform origin-left">⚡</div>
              <h3 className="text-xl font-bold mb-3">Content Analysis</h3>
              <p className="text-white/40 text-sm leading-relaxed">
                LLM-driven analysis of video metadata to score candidates against your current knowledge level and search intent.
              </p>
            </div>
            <div className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-cyan-500/30 transition-all group">
              <div className="text-3xl mb-6 group-hover:scale-110 transition-transform origin-left">👤</div>
              <h3 className="text-xl font-bold mb-3">User Profiling</h3>
              <p className="text-white/40 text-sm leading-relaxed">
                Maintains a temporal interest graph. It learns from your "skips" and "clicks" to refine your taste graph in real-time using Redis.
              </p>
            </div>
            <div className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-pink-500/30 transition-all group">
              <div className="text-3xl mb-6 group-hover:scale-110 transition-transform origin-left">📈</div>
              <h3 className="text-xl font-bold mb-3">Trend Scout</h3>
              <p className="text-white/40 text-sm leading-relaxed">
                Uses external signals to detect "Information Voids"—topics that are trending but not yet well-covered by your standard feed.
              </p>
            </div>
          </div>
        </section>

        {/* System Design Section */}
        <section className="mb-32">
          <div className="p-12 rounded-[40px] bg-gradient-to-b from-white/5 to-transparent border border-white/10">
             <h2 className="text-3xl font-bold mb-4">Technical Infrastructure</h2>
             <p className="text-white/40 mb-12">Architecture optimized for reasoning-heavy workloads.</p>
             
             <div className="space-y-12">
                <div className="flex flex-col md:flex-row gap-8 items-start">
                   <div className="flex-1">
                      <h4 className="text-white font-bold mb-2">Vector Storage</h4>
                      <p className="text-white/40 text-sm">Neon Postgres with the pgvector extension for high-dimensional similarity searches at scale.</p>
                   </div>
                   <div className="flex-1">
                      <h4 className="text-white font-bold mb-2">Real-time Graph</h4>
                      <p className="text-white/40 text-sm">Upstash Redis for millisecond-latency user profile updates and session management.</p>
                   </div>
                </div>
                <div className="flex flex-col md:flex-row gap-8 items-start">
                   <div className="flex-1">
                      <h4 className="text-white font-bold mb-2">Edge Orchestration</h4>
                      <p className="text-white/40 text-sm">Built with Next.js and deployed on Vercel, parallelizing agent calls at the edge for maximum speed.</p>
                   </div>
                   <div className="flex-1">
                      <h4 className="text-white font-bold mb-2">Explainable Discovery</h4>
                      <p className="text-white/40 text-sm">Every result is accompanied by a reasoning trace, explaining <em>why</em> the engine thought it was relevant to you.</p>
                   </div>
                </div>
             </div>
          </div>
        </section>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-8 text-white/80">Experience agentic discovery today</h2>
          <Link 
            href="/"
            className="inline-flex items-center justify-center bg-white text-black px-8 py-4 rounded-2xl font-bold hover:bg-white/90 transition-all shadow-xl shadow-white/5"
          >
            Go to Search
          </Link>
        </div>
      </main>

      <footer className="border-t border-white/5 py-12 px-6 mt-20">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-white/30 text-sm font-medium">
            © 2026 SERENDEX
          </div>
          <div className="flex gap-8 text-white/40 text-xs uppercase tracking-widest font-bold">
            <a href="https://github.com/swathikchgithub/serendex" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">GitHub Project</a>
            <a href="https://github.com/swathikchgithub/serendex#readme" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Documentation</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
