'use client';

import Link from "next/link";
import { Github } from "lucide-react";
import { useSession, signIn } from "next-auth/react";
import { ArrowRight } from "lucide-react";
import Logo from "./Logo";

export default function Footer() {
  const { data: session } = useSession();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-white/[0.04]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* CTA */}
        <div className="py-20 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-3">
            Ready to try it?
          </h2>
          <p className="text-white/50 mb-8 max-w-md mx-auto">
            Upload your first video for free. No credit card, no commitment.
          </p>
          {session ? (
            <Link href="/dashboard" className="btn-primary text-base px-7 py-3.5 inline-flex">
              Go to Dashboard <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <button onClick={() => signIn("google")} className="btn-primary text-base px-7 py-3.5">
              Get started free <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Links */}
        <div className="flex flex-col sm:flex-row items-center justify-between py-8 border-t border-white/[0.04] gap-4">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <Logo size="small" />
              <span className="text-sm font-semibold">FramePhase</span>
            </Link>
            <span className="text-xs text-white/35">&copy; {currentYear}</span>
          </div>

          <div className="flex items-center gap-6 flex-wrap justify-center">
            <Link href="/pricing" className="text-xs text-white/45 hover:text-white/70 transition-colors">Pricing</Link>
            <Link href="/compare" className="text-xs text-white/45 hover:text-white/70 transition-colors">Compare</Link>
            <Link href="/#features" className="text-xs text-white/45 hover:text-white/70 transition-colors">Features</Link>
            <Link href="/#faq" className="text-xs text-white/45 hover:text-white/70 transition-colors">FAQ</Link>
            <Link href="/terms" className="text-xs text-white/45 hover:text-white/70 transition-colors">Terms</Link>
            <Link href="/privacy" className="text-xs text-white/45 hover:text-white/70 transition-colors">Privacy</Link>
            <a href="https://github.com/ParthMadhvani2/FramePhase" target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-white/60 transition-colors">
              <Github className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
