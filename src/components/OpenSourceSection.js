'use client';

import { motion } from "framer-motion";
import { Github, Code2, Shield } from "lucide-react";

/*
  Instead of fake testimonials, be honest.
  FramePhase is open-source. That IS the social proof.
  Show the tech stack, show the repo, show it's real.
*/

export default function OpenSourceSection() {
  return (
    <section className="py-24 lg:py-32 border-t border-white/[0.04]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left — message */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-sm font-medium text-brand-400 mb-3">Open source</p>
            <h2 className="text-3xl sm:text-4xl font-bold leading-tight">
              Built in public.<br />Inspect every line.
            </h2>
            <p className="mt-4 text-white/40 text-lg leading-relaxed">
              FramePhase is fully open source. The transcription uses AWS, but caption
              rendering runs entirely in your browser via FFmpeg WebAssembly. Your video
              data never hits our servers for processing.
            </p>

            <div className="mt-8 space-y-4">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-brand-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">Client-side video processing</p>
                  <p className="text-xs text-white/30 mt-0.5">FFmpeg WASM runs in your browser. Videos are never uploaded for caption rendering.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Code2 className="w-5 h-5 text-brand-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">Built with Next.js 14, Prisma, Stripe</p>
                  <p className="text-xs text-white/30 mt-0.5">Modern stack. TypeScript-ready. Easy to self-host if you prefer.</p>
                </div>
              </div>
            </div>

            <a
              href="https://github.com/ParthMadhvani2/FramePhase"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary mt-8 inline-flex"
            >
              <Github className="w-4 h-4" /> View on GitHub
            </a>
          </motion.div>

          {/* Right — code snippet aesthetic */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden"
          >
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/[0.04] bg-white/[0.01]">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
              </div>
              <span className="text-[11px] text-white/20 ml-2">Tech Stack</span>
            </div>
            <div className="p-5 font-mono text-xs leading-6 text-white/40">
              <p><span className="text-brand-300">framework</span>  <span className="text-white/20">→</span> Next.js 14 (App Router)</p>
              <p><span className="text-brand-300">transcription</span>  <span className="text-white/20">→</span> AWS Transcribe</p>
              <p><span className="text-brand-300">video</span>  <span className="text-white/20">→</span> FFmpeg WebAssembly</p>
              <p><span className="text-brand-300">auth</span>  <span className="text-white/20">→</span> NextAuth + Google OAuth</p>
              <p><span className="text-brand-300">database</span>  <span className="text-white/20">→</span> Prisma + SQLite</p>
              <p><span className="text-brand-300">payments</span>  <span className="text-white/20">→</span> Stripe Subscriptions</p>
              <p><span className="text-brand-300">styling</span>  <span className="text-white/20">→</span> Tailwind CSS</p>
              <p><span className="text-brand-300">deploy</span>  <span className="text-white/20">→</span> Netlify / Vercel</p>
              <p className="mt-3 text-white/15">{"// everything is inspectable at"}</p>
              <p className="text-white/15">{"// github.com/ParthMadhvani2/FramePhase"}</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
