'use client';

import { motion } from "framer-motion";
import { Upload, Wand2, Download } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Upload,
    title: "Upload",
    description: "Drag and drop a video file. MP4, MOV, WebM — up to 500MB. It goes straight to the cloud.",
  },
  {
    number: "02",
    icon: Wand2,
    title: "Transcribe & edit",
    description: "AI generates timestamped text in seconds. Fix anything in the inline editor before moving on.",
  },
  {
    number: "03",
    icon: Download,
    title: "Style & download",
    description: "Pick a caption preset, preview it live, and download the final video with captions burned in.",
  },
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24 lg:py-32 border-t border-white/[0.04]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-sm font-medium text-brand-400 mb-3">How it works</p>
          <h2 className="text-3xl sm:text-4xl font-bold">Three steps. That&apos;s it.</h2>
        </motion.div>

        <div className="mt-16 relative">
          {/* Animated connecting line (desktop) */}
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
            className="hidden md:block absolute top-12 left-0 right-0 h-px origin-left"
            style={{ background: 'linear-gradient(to right, transparent, rgba(99,102,241,0.15), transparent)' }}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-16">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.5,
                    delay: 0.15 + index * 0.2,
                    ease: [0.22, 1, 0.36, 1]
                  }}
                  className="relative"
                >
                  {/* Step circle with subtle glow on hover */}
                  <div className="relative z-10 w-10 h-10 rounded-full border border-white/[0.08] bg-surface flex items-center justify-center mb-6 group">
                    <div className="absolute inset-0 rounded-full bg-brand-500/0 group-hover:bg-brand-500/10 transition-colors duration-300" />
                    <Icon className="w-4 h-4 text-brand-400 relative z-10" />
                  </div>
                  <span className="text-xs font-mono text-white/35 mb-2 block">{step.number}</span>
                  <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                  <p className="text-sm text-white/50 leading-relaxed">{step.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
