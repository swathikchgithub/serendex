import { Header } from "@/components/Header";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-violet-500/30">
      <Header />
      <main className="max-w-4xl mx-auto px-6 py-16 md:py-24">
        <h1 className="text-4xl font-black mb-8 tracking-tight">Terms of Service</h1>
        
        <div className="space-y-8 text-white/70 leading-relaxed">
          <section className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl">
            <h2 className="text-xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
            <p className="mb-4">
              By accessing or using SERENDEX, you signify that you have read, understood, and agree to be bound by these Terms of Service.
            </p>
            <p className="font-bold text-white">
              Importantly, by using this API Client, users are agreeing to be bound by the YouTube Terms of Service at the following link:
            </p>
            <a 
              href="https://www.youtube.com/t/terms" 
              target="_blank" 
              className="text-red-400 hover:underline font-medium block mt-2"
            >
              https://www.youtube.com/t/terms
            </a>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">2. Description of Service</h2>
            <p>
              SERENDEX is a non-commercial, educational and technical demonstration project — an AI-powered discovery
              engine for YouTube content. We provide supplemental analysis, topic categorization, and personalized
              recommendations based on public API data. The Service is not operated for profit and does not display
              advertising or sell user data.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">3. Accounts</h2>
            <p>
              You may browse and search SERENDEX without an account. Signing in with Google unlocks personalized
              recommendations and watch history. You are responsible for maintaining the security of your Google
              account; we rely on Google to authenticate you and do not receive or store your Google password.
              We may suspend account access for conduct that violates these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">4. Prohibited Conduct</h2>
            <div className="space-y-4">
              <p>Users agree not to use the Service to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Violate any local, state, national, or international law.</li>
                <li>Attempt to bypass any technological measure implemented by SERENDEX or any of its providers (including YouTube).</li>
                <li>Scrape or bulk-download content from the Service.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">5. Limitation of Liability</h2>
            <p>
              SERENDEX provides recommendations "as is." We are not responsible for the content, quality, or availability of 
              third-party content (including YouTube videos) surfaced by our engine.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">6. Modifications</h2>
            <p>
              We reserve the right to modify these terms at any time. Your continued use of the Service after such changes 
              constitutes your acceptance of the new Terms of Service.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
