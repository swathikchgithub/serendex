import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/components/Providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SERENDEX — Agentic YouTube Discovery",
  description: "Multi-agent AI recommendation engine powered by Claude",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>
          {children}

          <footer className="mt-auto border-t border-white/5 bg-black/50 py-12">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between gap-8 items-start">
            <div className="space-y-4">
              <h3 className="font-bold text-white">SERENDEX</h3>
              <p className="text-white/40 text-xs max-w-xs leading-relaxed">
                An AI-powered discovery engine enhancing the visibility of educational and technical content.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-12">
              <div className="space-y-3">
                <h4 className="text-[10px] uppercase tracking-widest font-bold text-white/30">Legal</h4>
                <ul className="space-y-2 text-xs text-white/50">
                  <li><a href="/terms" className="hover:text-white transition-colors">Terms of Service</a></li>
                  <li><a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a></li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="text-[10px] uppercase tracking-widest font-bold text-white/30">YouTube</h4>
                <ul className="space-y-2 text-xs text-white/50">
                  <li><a href="https://www.youtube.com/t/terms" target="_blank" className="hover:text-white transition-colors">YouTube ToS</a></li>
                  <li><a href="http://www.google.com/policies/privacy" target="_blank" className="hover:text-white transition-colors">Google Privacy Policy</a></li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="text-[10px] uppercase tracking-widest font-bold text-white/30">Support</h4>
                <p className="text-xs text-white/50">Contact: swathikch@gmail.com</p>
              </div>
            </div>
          </div>
          <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-white/5 text-[10px] text-white/20">
            © 2026 SERENDEX. Built with YouTube API Services.
          </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
