import { Header } from "@/components/Header";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-violet-500/30">
      <Header />
      <main className="max-w-4xl mx-auto px-6 py-16 md:py-24">
        <h1 className="text-4xl font-black mb-8 tracking-tight">Privacy Policy</h1>

        <div className="space-y-8 text-white/70 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-4">1. Overview</h2>
            <p>
              SERENDEX ("we", "us", or "our") operates the website https://serendex.vercel.app.
              This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our Service.
            </p>
          </section>

          <section className="p-6 bg-violet-500/10 border border-violet-500/20 rounded-2xl">
            <h2 className="text-xl font-bold text-white mb-4">2. YouTube API Services</h2>
            <p className="mb-4">
              Our Service uses **YouTube API Services** to provide video discovery and recommendation features.
              By using our Service, you are also agreeing to be bound by the Google Privacy Policy, which can be found at:
            </p>
            <a
              href="http://www.google.com/policies/privacy"
              target="_blank"
              className="text-violet-400 hover:underline font-medium"
            >
              http://www.google.com/policies/privacy
            </a>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">3. Data Collection and Use</h2>
            <p className="mb-4">
              We collect information to provide and improve our AI discovery engine. This includes:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Device Information:</strong> We may store information on your device using cookies or similar technology
                (such as LocalStorage) to remember your anonymous user ID and search preferences.
              </li>
              <li>
                <strong>API Data:</strong> We access and display public YouTube API Data (video titles, descriptions, thumbnails, and statistics).
                We do not collect or store any private user data from your YouTube account.
              </li>
              <li>
                <strong>Interaction Data:</strong> We store anonymous logs of video "clicks" and "skips" within our app to train your local recommendation agent.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">4. Data Sharing</h2>
            <p>
              We do not sell or share your information with external parties. All data collected is used internally
              to improve the AI-driven personalization of the SERENDEX engine.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">5. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at:
              <br />
              <span className="text-white font-medium">swathikch@gmail.com</span>
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
