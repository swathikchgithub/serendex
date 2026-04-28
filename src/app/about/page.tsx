import Link from "next/link";
import { Header } from "@/components/Header";
import { SystemArchitectureDiagram } from "@/components/SystemArchitectureDiagram";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-violet-500/30">
      <Header />

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

        <SystemArchitectureDiagram />

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

        {/* Model Selection Section */}
        <section className="mb-32">
          <h2 className="text-3xl font-bold mb-12 text-center">Choosing Your Intelligence</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-8 rounded-3xl bg-white/5 border border-white/10">
              <h3 className="text-xl font-bold mb-4">The Selection Dropdown</h3>
              <p className="text-white/60 mb-6">
                In the top right of your feed, you'll find a model selector. This allows you to choose which AI model powers the <strong>Content Analysis</strong> and <strong>Explanation</strong> agents.
              </p>
              <ul className="space-y-4 text-sm text-white/50">
                <li className="flex gap-3"><span className="text-white">🌱 Eco:</span> Optimized for speed and low cost (Gemini Flash / GPT-4o Mini).</li>
                <li className="flex gap-3"><span className="text-white">⚡ Speed:</span> Sub-second response times using Groq's Llama 3 servers.</li>
                <li className="flex gap-3"><span className="text-white">🧠 Pro:</span> Deepest reasoning via Claude 3.5 Sonnet or GPT-4o.</li>
                <li className="flex gap-3"><span className="text-white">🌐 Open:</span> Access to open-source giants like DeepSeek V3 and R1 via OpenRouter.</li>
              </ul>
            </div>
            <div className="p-8 rounded-3xl bg-gradient-to-br from-violet-500/10 to-cyan-500/10 border border-white/10 flex flex-col justify-center">
              <h3 className="text-xl font-bold mb-4 italic">Pro Tip</h3>
              <p className="text-white/70 leading-relaxed">
                "Use <strong>DeepSeek R1</strong> for highly technical topics (like System Design or Physics). Its reasoning chain excels at breaking down complex educational concepts that simpler models might miss."
              </p>
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
             <p className="text-white/40 mb-12">Architecture optimized for reasoning-heavy workloads and API quota efficiency.</p>
             
             <div className="space-y-12">
                <div className="flex flex-col md:flex-row gap-8 items-start">
                   <div className="flex-1">
                      <h4 className="text-white font-bold mb-2">Smart Caching Layer</h4>
                      <p className="text-white/40 text-sm">Every discovery is cached in <strong>Upstash Redis</strong> with a smart TTL (24h-7d). This saves YouTube Quota and LLM tokens, making repeat searches near-instant.</p>
                   </div>
                   <div className="flex-1">
                      <h4 className="text-white font-bold mb-2">Safe Mode Fallback</h4>
                      <p className="text-white/40 text-sm">A resilient design that automatically switches to curated mock data if YouTube API quotas are reached, ensuring zero application downtime.</p>
                   </div>
                </div>
                <div className="flex flex-col md:flex-row gap-8 items-start">
                   <div className="flex-1">
                      <h4 className="text-white font-bold mb-2">Edge Orchestration</h4>
                      <p className="text-white/40 text-sm">Built with Next.js and deployed on Vercel, parallelizing agent calls at the edge for maximum speed and sub-second analysis.</p>
                   </div>
                   <div className="flex-1">
                      <h4 className="text-white font-bold mb-2">Explainable Discovery</h4>
                      <p className="text-white/40 text-sm">Every result is accompanied by a reasoning trace, explaining <em>why</em> the engine thought it was relevant to your interest graph.</p>
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
