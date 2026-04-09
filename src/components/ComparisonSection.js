'use client';

import { motion } from "framer-motion";

/*
  Instead of a generic comparison table, this section tells a story.
  Show real difference: YouTube auto-captions vs FramePhase.
  Side-by-side transcript example is more persuasive than checkmarks.
*/

export default function ComparisonSection() {
  return (
    <section className="py-24 lg:py-32 border-t border-white/[0.04]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl"
        >
          <p className="text-sm font-medium text-brand-400 mb-3">Why not just use YouTube?</p>
          <h2 className="text-3xl sm:text-4xl font-bold leading-tight">
            YouTube auto-captions are fine.<br />
            Until you actually read them.
          </h2>
          <p className="mt-4 text-white/50 text-lg leading-relaxed">
            No punctuation. No capitalization. Sentences mashed together.
            And they don&apos;t count for SEO. Here&apos;s the same clip, transcribed both ways.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {/* YouTube */}
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-white/20" />
              <span className="text-xs font-medium text-white/30 uppercase tracking-wider">YouTube Auto</span>
            </div>
            <div className="space-y-2 font-mono text-xs text-white/30 leading-relaxed">
              <p><span className="text-white/15">[00:00]</span> no freaking way that brett mavericks</p>
              <p><span className="text-white/15">[00:02]</span> jawline is</p>
              <p><span className="text-white/15">[00:03]</span> natural welcome back to the first</p>
              <p><span className="text-white/15">[00:05]</span> episode of jawline review which is</p>
              <p><span className="text-white/15">[00:07]</span> quite simply exactly what it sounds like</p>
              <p><span className="text-white/15">[00:09]</span> we review peoples jawlines were going</p>
            </div>
          </div>

          {/* FramePhase */}
          <div className="rounded-xl border border-brand-500/20 bg-brand-500/[0.03] p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-brand-400" />
              <span className="text-xs font-medium text-brand-400/70 uppercase tracking-wider">FramePhase</span>
            </div>
            <div className="space-y-2 font-mono text-xs text-white/60 leading-relaxed">
              <p><span className="text-white/25">[00:00]</span> No freaking way that Brett Maverick&apos;s jawline is natural.</p>
              <p><span className="text-white/25">[00:04]</span> Welcome back to the first episode of Jawline Review,</p>
              <p><span className="text-white/25">[00:06]</span> which is quite simply exactly what it sounds like.</p>
              <p><span className="text-white/25">[00:09]</span> We review people&apos;s jawlines, so we&apos;re going to be</p>
              <p><span className="text-white/25">[00:12]</span> looking at an absolute Maverick called Brett Maverick.</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mt-6 text-sm text-white/40"
        >
          Punctuation, capitalization, proper sentence breaks. The basics matter.
        </motion.div>
      </div>
    </section>
  );
}
