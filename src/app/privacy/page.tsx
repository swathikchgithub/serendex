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
              SERENDEX ("we", "us", or "our") operates the website https://serendex.vercel.app as a non-commercial,
              educational and technical demonstration project. This page informs you of our policies regarding the
              collection, use, and disclosure of personal data when you use our Service.
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
                <strong>Account Information:</strong> If you sign in with Google, we receive your name, email address,
                and profile photo from Google to identify you. This information is used only within your signed-in
                session and is <strong>not</strong> written to our database — the only piece of your account we store
                server-side is your Google account identifier, used as a key to link your interest graph and watch
                history across visits.
              </li>
              <li>
                <strong>API Data:</strong> We access and display public YouTube API Data (video titles, descriptions, thumbnails, and statistics).
                We do not collect or store any private data from your YouTube account.
              </li>
              <li>
                <strong>Interaction Data:</strong> If you're signed in, we log video "clicks," "watches," "likes," and "skips" against your account
                to build your personalized interest graph. If you're signed out, this data is not recorded at all — you can browse
                and search without an account, but recommendations won't be personalized.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">4. Data Retention</h2>
            <p>
              Your interest graph and watch history are stored in our cache for <strong>7 days</strong> from your last
              activity, after which they are automatically deleted. You can sign out at any time to end your session,
              or contact us to request earlier deletion of your data.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">5. Data Sharing</h2>
            <p>
              We do not sell or share your information with external parties. All data collected is used internally
              to improve the AI-driven personalization of the SERENDEX engine. Our use and transfer of information
              received from Google APIs adheres to the{" "}
              <a
                href="https://developers.google.com/terms/api-services-user-data-policy"
                target="_blank"
                className="text-violet-400 hover:underline"
              >
                Google API Services User Data Policy
              </a>
              , including the Limited Use requirements.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">6. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, or would like your data deleted, please contact us at:
              <br />
              <span className="text-white font-medium">swathikch@gmail.com</span>
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
