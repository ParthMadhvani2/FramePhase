'use client';

import { useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import { useSession, signIn } from "next-auth/react";
import Link from "next/link";

export default function HeroSection() {
  const { data: session } = useSession();
  const beforeRef = useRef(null);
  const afterRef = useRef(null);

  // Sync both videos: when either loops or drifts, re-align them
  const syncVideos = useCallback(() => {
    const before = beforeRef.current;
    const after = afterRef.current;
    if (!before || !after) return;

    const drift = Math.abs(before.currentTime - after.currentTime);
    if (drift > 0.15) {
      const target = Math.min(before.currentTime, after.currentTime);
      before.currentTime = target;
      after.currentTime = target;
    }
  }, []);

  // Start both videos together once both are ready
  useEffect(() => {
    const before = beforeRef.current;
    const after = afterRef.current;
    if (!before || !after) return;

    // Force the browser to start loading both videos (overrides preload="metadata")
    before.load();
    after.load();

    let bothReady = 0;
    const tryPlay = () => {
      bothReady++;
      if (bothReady >= 2) {
        before.currentTime = 0;
        after.currentTime = 0;
        Promise.all([
          before.play().catch(() => {}),
          after.play().catch(() => {}),
        ]);
      }
    };

    // canplay fires as soon as playback can begin (earlier than canplaythrough)
    before.addEventListener('canplay', tryPlay, { once: true });
    after.addEventListener('canplay', tryPlay, { once: true });

    const interval = setInterval(syncVideos, 2000);

    const handleLoop = () => {
      const other = before.currentTime < 0.5 ? after : before;
      other.currentTime = 0;
    };
    before.addEventListener('seeked', handleLoop);
    after.addEventListener('seeked', handleLoop);

    return () => {
      clearInterval(interval);
      before.removeEventListener('canplay', tryPlay);
      after.removeEventListener('canplay', tryPlay);
      before.removeEventListener('seeked', handleLoop);
      after.removeEventListener('seeked', handleLoop);
    };
  }, [syncVideos]);

  return (
    <section className="relative pt-28 pb-8 lg:pt-36 lg:pb-12 overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full opacity-[0.07] blur-[120px] bg-brand-500 pointer-events-none" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Headline — scale + fade for premium feel */}
          <motion.h1
            initial={{ opacity: 0, scale: 0.96, filter: 'blur(8px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1]"
          >
            Caption any video,
            <br />
            <span className="gradient-text">right in your browser.</span>
          </motion.h1>

          {/* Subtitle — fade in from below with slight delay */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15, ease: 'easeOut' }}
            className="mt-5 text-lg text-white/55 max-w-lg mx-auto leading-relaxed"
          >
            Upload a video. AI transcribes it. Edit the text, pick a style,
            and download with captions burned in. Everything runs client-side.
          </motion.p>

          {/* CTA buttons — stagger from subtitle */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25, ease: 'easeOut' }}
            className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            {session ? (
              <Link href="/dashboard" className="btn-primary text-base px-7 py-3.5">
                Go to Dashboard <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <button onClick={() => signIn("google")} className="btn-primary text-base px-7 py-3.5">
                Try it free <ArrowRight className="w-4 h-4" />
              </button>
            )}
            <a href="#demo" className="btn-secondary text-base px-7 py-3.5">
              <Play className="w-4 h-4" /> See it in action
            </a>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-4 text-xs text-white/40"
          >
            No credit card required &middot; 3 free videos to start
          </motion.p>
        </div>

        {/* Product Demo — reveal with scale + shadow expansion */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          id="demo"
          className="mt-16 max-w-4xl mx-auto"
        >
          <div className="relative rounded-2xl overflow-hidden border border-white/[0.06] bg-surface-100 shadow-2xl shadow-brand-500/[0.05]">
            {/* Browser chrome with colored dots */}
            <div className="flex items-center gap-2 px-4 py-2.5 bg-white/[0.02] border-b border-white/[0.04]">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/40" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/40" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/40" />
              </div>
              <div className="flex-1 mx-8">
                <div className="bg-white/[0.04] rounded-md px-3 py-1 text-[11px] text-white/35 max-w-[200px] mx-auto text-center">
                  framephase.app
                </div>
              </div>
            </div>

            {/* Before/After */}
            <div className="grid grid-cols-2">
              <div className="p-6 sm:p-10 flex flex-col items-center border-r border-white/[0.04]">
                <span className="text-[10px] font-medium text-white/40 uppercase tracking-[0.15em] mb-4">Before</span>
                <div className="w-full max-w-[200px] rounded-xl overflow-hidden border border-white/[0.06] aspect-[9/16]">
                  <video
                    ref={beforeRef}
                    src="https://dawid-epic-captions.s3.us-east-1.amazonaws.com/without-captions.mp4"
                    crossOrigin="anonymous"
                    autoPlay
                    muted loop playsInline
                    preload="auto"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="p-6 sm:p-10 flex flex-col items-center">
                <span className="text-[10px] font-medium text-brand-400/70 uppercase tracking-[0.15em] mb-4">After</span>
                <div className="w-full max-w-[200px] rounded-xl overflow-hidden border border-brand-500/20 aspect-[9/16] shadow-lg shadow-brand-500/10">
                  <video
                    ref={afterRef}
                    src="https://dawid-epic-captions.s3.us-east-1.amazonaws.com/with-captions.mp4"
                    crossOrigin="anonymous"
                    autoPlay
                    muted loop playsInline
                    preload="auto"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
