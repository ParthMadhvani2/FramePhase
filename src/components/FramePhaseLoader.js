'use client';

import { motion } from 'framer-motion';

/**
 * FramePhaseLoader — branded loading animation.
 *
 * Concept: A filmstrip with rolling frames + audio waveform bars + blinking caption cursor.
 * Represents exactly what FramePhase does: processes video → extracts audio → generates captions.
 *
 * Variants:
 *   'full'     — Large centered loader for page-level loading (transcribing, fetching)
 *   'inline'   — Compact loader for buttons, cards, inline states
 *   'minimal'  — Just the waveform bars (for tight spaces)
 */

/* ── Film frame strip (3 rolling frames) ── */
function FilmStrip() {
  return (
    <div className="flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-7 h-5 rounded-[3px] border border-brand-400/30 bg-brand-500/[0.06] relative overflow-hidden"
          animate={{ opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.25, ease: 'easeInOut' }}
        >
          {/* Sprocket holes */}
          <div className="absolute top-0.5 left-0.5 w-1 h-1 rounded-[1px] bg-brand-400/20" />
          <div className="absolute bottom-0.5 left-0.5 w-1 h-1 rounded-[1px] bg-brand-400/20" />
          <div className="absolute top-0.5 right-0.5 w-1 h-1 rounded-[1px] bg-brand-400/20" />
          <div className="absolute bottom-0.5 right-0.5 w-1 h-1 rounded-[1px] bg-brand-400/20" />
          {/* Inner "frame" content — play icon hint */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="w-0 h-0 border-l-[4px] border-l-brand-400/40 border-y-[3px] border-y-transparent"
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

/* ── Audio waveform bars ── */
function WaveformBars({ count = 5, height = 20 }) {
  const heights = [0.4, 0.7, 1, 0.6, 0.35];
  return (
    <div className="flex items-end gap-[3px]" style={{ height }}>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className="w-[3px] rounded-full bg-brand-400"
          style={{ originY: 1 }}
          animate={{
            scaleY: [heights[i % heights.length], 1, heights[(i + 2) % heights.length], heights[i % heights.length]],
            opacity: [0.5, 0.9, 0.5],
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            delay: i * 0.12,
            ease: 'easeInOut',
          }}
          initial={{ height: height * heights[i % heights.length] }}
        />
      ))}
    </div>
  );
}

/* ── Caption cursor blink ── */
function CaptionLine() {
  return (
    <div className="flex items-center gap-1.5">
      {/* Two "caption text" lines with a blinking cursor */}
      <div className="h-[3px] w-8 rounded-full bg-brand-400/25" />
      <div className="h-[3px] w-12 rounded-full bg-brand-400/15" />
      <motion.div
        className="h-3.5 w-[2px] rounded-full bg-brand-400"
        animate={{ opacity: [1, 0, 1] }}
        transition={{ duration: 1, repeat: Infinity, ease: 'steps(2)' }}
      />
    </div>
  );
}

/* ── Full page loader ── */
function FullLoader({ message, subtitle }) {
  return (
    <div className="flex flex-col items-center gap-5">
      {/* Film strip + waveform composition */}
      <div className="relative">
        <div className="flex items-center gap-3">
          <FilmStrip />
          <div className="w-px h-8 bg-white/[0.06]" />
          <WaveformBars count={5} height={24} />
        </div>
        {/* Caption line below */}
        <div className="mt-3 flex justify-center">
          <CaptionLine />
        </div>
      </div>

      {/* Text */}
      {message && (
        <div className="text-center">
          <p className="text-base font-semibold text-white">{message}</p>
          {subtitle && <p className="text-sm text-white/45 mt-1">{subtitle}</p>}
        </div>
      )}
    </div>
  );
}

/* ── Inline loader (for buttons, cards) ── */
function InlineLoader({ message }) {
  return (
    <div className="flex items-center gap-3">
      <WaveformBars count={4} height={16} />
      {message && <span className="text-sm text-white/55">{message}</span>}
    </div>
  );
}

/* ── Minimal loader (just bars) ── */
function MinimalLoader() {
  return <WaveformBars count={3} height={14} />;
}

/**
 * Main export — use `variant` prop to pick size.
 *
 * <FramePhaseLoader variant="full" message="Transcribing your video..." subtitle="AI is processing audio." />
 * <FramePhaseLoader variant="inline" message="Processing..." />
 * <FramePhaseLoader variant="minimal" />
 */
export default function FramePhaseLoader({ variant = 'full', message, subtitle }) {
  if (variant === 'inline') return <InlineLoader message={message} />;
  if (variant === 'minimal') return <MinimalLoader />;
  return <FullLoader message={message} subtitle={subtitle} />;
}

export { FilmStrip, WaveformBars, CaptionLine };
