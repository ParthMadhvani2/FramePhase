'use client';

import { motion } from "framer-motion";
import { Shield, Zap, MonitorSmartphone, Clock, Eye, Server } from "lucide-react";

/*
  Replaces the old OpenSourceSection.
  Instead of "we're open source" (which doesn't sell),
  this section sells the CORE differentiator: privacy + speed + quality.
  Think: why would a creator choose FramePhase over VEED/Kapwing?
*/

const pillars = [
  {
    icon: Shield,
    title: "Your video never leaves your device",
    description: "Caption rendering happens 100% in your browser via WebAssembly. Other tools upload your raw video to their cloud. We don't.",
    stat: "0 bytes",
    statLabel: "sent to our servers for rendering",
  },
  {
    icon: Zap,
    title: "No queue. No waiting.",
    description: "Because processing runs on your hardware, there's no server queue. Hit apply and watch it happen in real-time. No \"your video is #47 in line.\"",
    stat: "Instant",
    statLabel: "processing with no upload wait",
  },
  {
    icon: Eye,
    title: "Preview before you commit",
    description: "See exactly how your captions will look on every frame before rendering. Adjust colors, fonts, size — then apply when it's perfect.",
    stat: "13+",
    statLabel: "caption styles to choose from",
  },
];

const trustSignals = [
  { icon: MonitorSmartphone, label: "Works on any modern browser" },
  { icon: Clock, label: "Average processing: 30-60 seconds" },
  { icon: Server, label: "AWS Transcribe for 99% accuracy" },
];

export default function TrustSection() {
  return (
    <section className="py-24 lg:py-32 border-t border-white/[0.04]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl"
        >
          <p className="text-sm font-medium text-brand-400 mb-3">Why FramePhase</p>
          <h2 className="text-3xl sm:text-4xl font-bold leading-tight">
            The fastest way to caption a video.<br />
            And the most private.
          </h2>
          <p className="mt-4 text-white/50 text-lg leading-relaxed">
            Most caption tools upload your entire video to their cloud, queue it, process it,
            then send it back. FramePhase does the heavy lifting right in your browser.
          </p>
        </motion.div>

        {/* Pillar cards */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-5">
          {pillars.map((pillar, index) => {
            const Icon = pillar.icon;
            return (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group relative rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 hover:border-brand-500/20 hover:bg-brand-500/[0.02] transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mb-5 group-hover:bg-brand-500/15 transition-colors">
                  <Icon className="w-5 h-5 text-brand-400" />
                </div>

                {/* Stat callout */}
                <div className="mb-4">
                  <span className="text-2xl font-bold gradient-text">{pillar.stat}</span>
                  <p className="text-[11px] text-white/40 mt-0.5">{pillar.statLabel}</p>
                </div>

                <h3 className="text-base font-semibold mb-2">{pillar.title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{pillar.description}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Trust signals strip */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-8"
        >
          {trustSignals.map((signal) => {
            const Icon = signal.icon;
            return (
              <div key={signal.label} className="flex items-center gap-2 text-sm text-white/40">
                <Icon className="w-4 h-4 text-white/30" />
                {signal.label}
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
