'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Shield, Zap, DollarSign, Globe, ArrowRight, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useSession, signIn } from 'next-auth/react';
import Footer from '@/components/Footer';

const competitors = [
  { name: 'FramePhase', highlight: true },
  { name: 'VEED' },
  { name: 'Kapwing' },
  { name: 'Submagic' },
  { name: 'Zubtitle' },
  { name: 'Captions AI' },
];

const comparisonFeatures = [
  {
    category: 'Pricing',
    icon: DollarSign,
    items: [
      { feature: 'Free tier videos/month', values: ['3', '~2 min', '1 (watermark)', '0', '2 (watermark)', 'Limited'] },
      { feature: 'Starter price', values: ['$9/mo', '$12/mo', '$16/mo', '$12/mo', '$19/mo', '~$10/mo'] },
      { feature: 'Videos at starter tier', values: ['15', '~12hr/mo', '~5hr/mo', '15 (2min max)', '10', 'Limited'] },
      { feature: 'Annual discount', values: [true, true, true, true, true, false] },
    ],
  },
  {
    category: 'Privacy & Security',
    icon: Shield,
    items: [
      { feature: 'Client-side video rendering', values: [true, false, false, false, false, false] },
      { feature: 'Video never leaves device', values: [true, false, false, false, false, false] },
      { feature: 'Open source code', values: [true, false, false, false, false, false] },
      { feature: 'GDPR compliant', values: [true, true, true, true, true, 'Unclear'] },
    ],
  },
  {
    category: 'Features',
    icon: Zap,
    items: [
      { feature: 'AI transcription', values: [true, true, true, true, true, true] },
      { feature: 'Burned-in captions', values: [true, true, true, true, true, true] },
      { feature: 'SRT/VTT export', values: [true, true, true, true, true, true] },
      { feature: 'Caption style presets', values: ['13+', '10+', '5+', '15+', '5+', '10+'] },
      { feature: 'Inline transcript editor', values: [true, true, true, false, true, true] },
      { feature: 'AI text summarization', values: [true, false, false, false, false, false] },
      { feature: 'Video length limit', values: ['Up to 120min', '30min', '120min', '5min', '10min', '10min'] },
      { feature: 'No watermark (paid)', values: [true, true, true, true, true, true] },
    ],
  },
  {
    category: 'Languages',
    icon: Globe,
    items: [
      { feature: 'Auto language detection', values: [true, true, true, true, false, true] },
      { feature: 'Languages supported', values: ['100+', '100+', '75+', '50+', '30+', '30+'] },
      { feature: 'Manual language selection', values: [true, true, true, false, false, true] },
    ],
  },
];

const advantages = [
  {
    title: 'Your video stays on your device',
    description: 'FramePhase burns captions in your browser using WebAssembly. The processed video never touches our servers.',
    icon: Shield,
  },
  {
    title: 'No hidden costs at scale',
    description: 'Video rendering runs on YOUR hardware. We can offer more videos at lower prices with better margins.',
    icon: DollarSign,
  },
  {
    title: 'Open source & auditable',
    description: 'Our entire codebase is on GitHub. See exactly how your data is handled. No black boxes.',
    icon: Zap,
  },
];

function CellValue({ value, isHighlight }) {
  if (value === true) {
    return (
      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isHighlight ? 'bg-emerald-500/15' : 'bg-emerald-500/10'}`}>
        <Check className={`w-3.5 h-3.5 ${isHighlight ? 'text-emerald-400' : 'text-emerald-400/70'}`} />
      </div>
    );
  }
  if (value === false) {
    return (
      <div className="w-6 h-6 rounded-full flex items-center justify-center bg-red-500/[0.06]">
        <X className="w-3.5 h-3.5 text-red-400/40" />
      </div>
    );
  }
  return <span className={`text-xs font-medium ${isHighlight ? 'text-white' : 'text-white/55'}`}>{value}</span>;
}

/* ───── Mobile: compare FramePhase vs one competitor at a time ───── */
function MobileCompareCard({ section, selectedCompetitor }) {
  const Icon = section.icon;
  const compIdx = competitors.findIndex(c => c.name === selectedCompetitor);

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-4 h-4 text-brand-400" />
        <h3 className="text-xs font-semibold uppercase tracking-wider text-white/50">{section.category}</h3>
      </div>
      <div className="space-y-2">
        {section.items.map((item) => (
          <div key={item.feature} className="rounded-xl border border-white/[0.06] bg-white/[0.015] p-3.5">
            <p className="text-xs text-white/50 mb-2.5 font-medium">{item.feature}</p>
            <div className="flex items-center justify-between gap-3">
              {/* FramePhase value */}
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-400 flex-shrink-0" />
                <span className="text-xs font-semibold text-brand-300">FramePhase</span>
                <div className="ml-auto">
                  <CellValue value={item.values[0]} isHighlight />
                </div>
              </div>

              {/* Divider */}
              <div className="w-px h-6 bg-white/[0.06]" />

              {/* Competitor value */}
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className="text-xs text-white/40">{selectedCompetitor}</span>
                <div className="ml-auto">
                  <CellValue value={item.values[compIdx]} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ComparePage() {
  const { data: session } = useSession();
  const [selectedCompetitor, setSelectedCompetitor] = useState('VEED');
  const [showCompetitorDropdown, setShowCompetitorDropdown] = useState(false);

  return (
    <>
      <section className="relative pt-28 pb-16 lg:pt-36">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full opacity-[0.05] blur-[120px] bg-brand-500 pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold"
            >
              How FramePhase compares
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-3 text-lg text-white/50 max-w-xl mx-auto"
            >
              The only captioning tool where your video never leaves your device.
              Here&apos;s how we stack up against alternatives.
            </motion.p>
          </div>

          {/* Why FramePhase cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-20"
          >
            {advantages.map((adv) => {
              const Icon = adv.icon;
              return (
                <div key={adv.title} className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 hover:border-brand-500/20 hover:bg-white/[0.04] transition-all duration-300">
                  <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-brand-400" />
                  </div>
                  <h3 className="text-base font-semibold mb-2">{adv.title}</h3>
                  <p className="text-sm text-white/50 leading-relaxed">{adv.description}</p>
                </div>
              );
            })}
          </motion.div>

          {/* ═══════════ DESKTOP TABLE ═══════════ */}
          <div className="hidden lg:block">
            <div className="rounded-2xl border border-white/[0.06] overflow-hidden bg-white/[0.01]">
              <table className="w-full text-sm" style={{ tableLayout: 'fixed' }}>
                <colgroup>
                  <col style={{ width: '220px' }} />
                  {competitors.map((c) => (
                    <col key={c.name} />
                  ))}
                </colgroup>
                <thead>
                  <tr className="bg-surface-100 border-b border-white/[0.08]">
                    <th className="text-left py-4 pl-6 pr-4 text-xs font-medium text-white/45">Feature</th>
                    {competitors.map((c) => (
                      <th
                        key={c.name}
                        className={`text-center py-4 px-3 text-xs font-semibold ${
                          c.highlight
                            ? 'text-brand-300 bg-brand-500/[0.08]'
                            : 'text-white/50'
                        }`}
                      >
                        {c.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {comparisonFeatures.map((section) => {
                    const Icon = section.icon;
                    return [
                      <tr key={`section-${section.category}`} className="bg-white/[0.02] border-y border-white/[0.04]">
                        <td colSpan={competitors.length + 1} className="px-6 py-3">
                          <div className="flex items-center gap-2">
                            <Icon className="w-3.5 h-3.5 text-brand-400" />
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-white/50">{section.category}</span>
                          </div>
                        </td>
                      </tr>,
                      ...section.items.map((item, rowIdx) => (
                        <tr
                          key={item.feature}
                          className={`group transition-colors hover:bg-white/[0.02] ${
                            rowIdx < section.items.length - 1 ? 'border-b border-white/[0.03]' : ''
                          }`}
                        >
                          <td className="py-3.5 pl-6 pr-4 text-white/60 font-medium text-[13px]">
                            {item.feature}
                          </td>
                          {item.values.map((val, vIdx) => (
                            <td
                              key={vIdx}
                              className={`text-center py-3.5 px-3 ${
                                vIdx === 0
                                  ? 'bg-brand-500/[0.06] border-x border-brand-500/[0.1]'
                                  : ''
                              }`}
                            >
                              <div className="flex items-center justify-center">
                                <CellValue value={val} isHighlight={vIdx === 0} />
                              </div>
                            </td>
                          ))}
                        </tr>
                      )),
                    ];
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* ═══════════ TABLET TABLE (md only) ═══════════ */}
          <div className="hidden md:block lg:hidden">
            <div className="rounded-2xl border border-white/[0.06] overflow-hidden bg-white/[0.01]">
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[700px]" style={{ tableLayout: 'fixed' }}>
                  <colgroup>
                    <col style={{ width: '180px' }} />
                    {competitors.map((c) => (
                      <col key={c.name} />
                    ))}
                  </colgroup>
                  <thead>
                    <tr className="bg-surface-100/95 border-b border-white/[0.08]">
                      <th className="text-left py-3.5 pl-5 pr-3 text-xs font-medium text-white/45 sticky left-0 bg-surface-100/95 z-10">Feature</th>
                      {competitors.map((c) => (
                        <th
                          key={c.name}
                          className={`text-center py-3.5 px-2 text-[11px] font-semibold ${
                            c.highlight ? 'text-brand-300 bg-brand-500/[0.08]' : 'text-white/50'
                          }`}
                        >
                          {c.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonFeatures.map((section) => {
                      const Icon = section.icon;
                      return [
                        <tr key={`section-${section.category}`} className="bg-white/[0.02] border-y border-white/[0.04]">
                          <td colSpan={competitors.length + 1} className="px-5 py-2.5">
                            <div className="flex items-center gap-2">
                              <Icon className="w-3.5 h-3.5 text-brand-400" />
                              <span className="text-[10px] font-semibold uppercase tracking-wider text-white/50">{section.category}</span>
                            </div>
                          </td>
                        </tr>,
                        ...section.items.map((item, rowIdx) => (
                          <tr
                            key={item.feature}
                            className={`hover:bg-white/[0.02] transition-colors ${
                              rowIdx < section.items.length - 1 ? 'border-b border-white/[0.03]' : ''
                            }`}
                          >
                            <td className="py-3 pl-5 pr-3 text-white/60 text-xs font-medium sticky left-0 bg-surface/95 backdrop-blur-sm z-10">
                              {item.feature}
                            </td>
                            {item.values.map((val, vIdx) => (
                              <td
                                key={vIdx}
                                className={`text-center py-3 px-2 ${
                                  vIdx === 0 ? 'bg-brand-500/[0.04]' : ''
                                }`}
                              >
                                <div className="flex items-center justify-center">
                                  <CellValue value={val} isHighlight={vIdx === 0} />
                                </div>
                              </td>
                            ))}
                          </tr>
                        )),
                      ];
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* ═══════════ MOBILE (compare 1-on-1) ═══════════ */}
          <div className="md:hidden">
            {/* Competitor selector */}
            <div className="mb-6">
              <p className="text-xs text-white/40 mb-2 font-medium">Compare FramePhase with:</p>
              <div className="relative">
                <button
                  onClick={() => setShowCompetitorDropdown(!showCompetitorDropdown)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm font-medium hover:bg-white/[0.06] transition-colors"
                  aria-expanded={showCompetitorDropdown}
                  aria-haspopup="listbox"
                >
                  {selectedCompetitor}
                  <ChevronDown className={`w-4 h-4 text-white/40 transition-transform ${showCompetitorDropdown ? 'rotate-180' : ''}`} />
                </button>
                {showCompetitorDropdown && (
                  <div className="absolute top-full mt-1 left-0 right-0 z-30 rounded-xl bg-surface-100 border border-white/[0.08] shadow-xl py-1 overflow-hidden">
                    {competitors.filter(c => !c.highlight).map((c) => (
                      <button
                        key={c.name}
                        onClick={() => { setSelectedCompetitor(c.name); setShowCompetitorDropdown(false); }}
                        className={`w-full text-left px-4 py-2.5 text-sm hover:bg-white/[0.04] transition-colors ${
                          selectedCompetitor === c.name ? 'text-brand-400 bg-brand-500/[0.04]' : 'text-white/60'
                        }`}
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 1-on-1 comparison cards */}
            {comparisonFeatures.map((section) => (
              <MobileCompareCard
                key={section.category}
                section={section}
                selectedCompetitor={selectedCompetitor}
              />
            ))}
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 text-center"
          >
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              Ready to try the difference?
            </h2>
            <p className="text-white/50 mb-8 max-w-md mx-auto">
              Start with 3 free videos. No credit card required.
              See why privacy-first captioning just works better.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              {session ? (
                <Link href="/dashboard" className="btn-primary text-base px-7 py-3.5">
                  Go to Dashboard <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <button onClick={() => signIn('google')} className="btn-primary text-base px-7 py-3.5">
                  Try it free <ArrowRight className="w-4 h-4" />
                </button>
              )}
              <Link href="/pricing" className="btn-secondary text-base px-7 py-3.5">
                View Pricing
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </>
  );
}
