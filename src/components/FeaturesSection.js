'use client';

import { motion } from "framer-motion";
import { Mic, Film, Globe, PenLine, FileText, Sparkles, Palette, Languages, Keyboard, Upload } from "lucide-react";

const features = [
  {
    icon: Mic,
    title: "AI transcription",
    description: "Powered by AWS Transcribe. Auto-detects language from 100+ supported, handles accents, returns timestamped text.",
  },
  {
    icon: Film,
    title: "Burned-in captions",
    description: "Captions get baked into the video file using FFmpeg WebAssembly. Works on any platform — no player support needed.",
  },
  {
    icon: Globe,
    title: "Runs in your browser",
    description: "Video processing happens client-side via WebAssembly. Your video never touches our servers. Privacy by design.",
  },
  {
    icon: Palette,
    title: "13+ caption styles",
    description: "From Classic to Neon to TikTok-style. Choose a preset, tweak colors, pick font sizes. Make it yours.",
  },
  {
    icon: Languages,
    title: "Multi-language support",
    description: "Transcribe in 100+ languages with auto-detection. Or manually select for better accuracy on specific content.",
  },
  {
    icon: Upload,
    title: "Batch upload",
    description: "Queue multiple videos at once. Upload them all, come back to edit each one. Built for volume creators.",
  },
  {
    icon: PenLine,
    title: "Inline editor",
    description: "Edit every word, fix timestamps, correct the AI. The transcription is yours to shape before you apply it.",
  },
  {
    icon: FileText,
    title: "SRT & VTT export",
    description: "Download subtitle files for YouTube, Vimeo, or any platform that supports standard caption formats.",
  },
  {
    icon: Keyboard,
    title: "Keyboard shortcuts",
    description: "Ctrl+Enter to apply, Ctrl+S to download. Power through your caption workflow without lifting your hands.",
  },
  {
    icon: Sparkles,
    title: "AI summarization",
    description: "Get a concise summary of your video content. Useful for descriptions, SEO, show notes, or repurposing.",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export default function FeaturesSection() {
  return (
    <section id="features" className="py-24 lg:py-32">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl"
        >
          <p className="text-sm font-medium text-brand-400 mb-3">What it does</p>
          <h2 className="text-3xl sm:text-4xl font-bold leading-tight">
            The full caption workflow,<br />in one tool.
          </h2>
          <p className="mt-4 text-white/50 text-lg leading-relaxed">
            Most tools make you bounce between apps. FramePhase handles transcription,
            editing, styling, and export in a single flow.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                variants={cardVariants}
                className="group relative rounded-2xl p-6 border border-transparent hover:border-white/[0.06] hover:bg-white/[0.02] transition-all duration-300"
              >
                <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mb-4 group-hover:border-brand-500/30 group-hover:bg-brand-500/[0.06] transition-all duration-300">
                  <Icon className="w-4 h-4 text-white/50 group-hover:text-brand-400 transition-colors duration-300" />
                </div>
                <h3 className="text-base font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{feature.description}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
