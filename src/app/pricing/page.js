'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X, ArrowRight } from 'lucide-react';
import { useSession, signIn } from 'next-auth/react';
import { PLANS, PLAN_ORDER } from '@/libs/plans';
import axios from 'axios';
import toast from 'react-hot-toast';
import Link from 'next/link';
import Footer from '@/components/Footer';
import FAQSection from '@/components/FAQSection';

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState(null);
  const { data: session } = useSession();

  const currentPlan = session?.user?.plan || 'free';

  const handleSubscribe = async (planId) => {
    if (currentPlan === planId) {
      toast('You are already on this plan.');
      return;
    }

    if (planId === 'free') {
      if (!session) signIn('google');
      return;
    }

    if (planId === 'business') {
      window.location.href = 'mailto:madhvaniparth2@gmail.com?subject=FramePhase%20Business%20Plan%20Inquiry';
      return;
    }

    if (!session) {
      signIn('google');
      return;
    }

    try {
      setLoadingPlan(planId);
      const res = await axios.post('/api/stripe/checkout', { planId });
      if (res.data?.url) {
        window.location.href = res.data.url;
      }
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <>
      <section className="relative pt-28 pb-16 lg:pt-36">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full opacity-[0.05] blur-[120px] bg-brand-500 pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold"
            >
              Simple, honest pricing.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-3 text-lg text-white/50"
            >
              Start free. Upgrade when you need more. Cancel anytime.
            </motion.p>

            {/* Toggle */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-8 flex items-center justify-center gap-3"
            >
              <span className={`text-sm ${!isYearly ? 'text-white' : 'text-white/40'}`}>Monthly</span>
              <button
                onClick={() => setIsYearly(!isYearly)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setIsYearly(!isYearly);
                  }
                }}
                role="switch"
                aria-checked={isYearly}
                aria-label="Toggle yearly billing"
                className={`relative w-11 h-6 rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-surface ${isYearly ? 'bg-brand-500' : 'bg-white/10'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${isYearly ? 'left-6' : 'left-1'}`} />
              </button>
              <span className={`text-sm ${isYearly ? 'text-white' : 'text-white/40'}`}>
                Yearly <span className="text-xs text-emerald-400 font-medium">-20%</span>
              </span>
            </motion.div>
          </div>

          {/* Cards — dynamically generated from PLANS config */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PLAN_ORDER.map((planId, index) => {
              const plan = PLANS[planId];
              const isCurrent = currentPlan === planId;
              const isPopular = plan.popular;

              return (
                <motion.div
                  key={planId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className={`relative rounded-2xl p-6 lg:p-8 flex flex-col transition-all duration-300 ${
                    isPopular
                      ? 'border-2 border-brand-500/40 bg-brand-500/[0.04] shadow-lg shadow-brand-500/[0.08] scale-[1.02] lg:scale-105'
                      : 'border border-white/[0.06] bg-white/[0.02] hover:border-white/[0.1]'
                  }`}
                >
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="px-3 py-1 text-[10px] font-semibold bg-brand-500 rounded-full text-white uppercase tracking-wider">Popular</span>
                    </div>
                  )}

                  <div className="mb-6">
                    <h3 className="text-lg font-bold">{plan.name}</h3>
                    <p className="text-xs text-white/45 mt-1">{plan.description}</p>
                  </div>

                  <div className="mb-6">
                    <span className="text-4xl font-bold">${isYearly ? plan.yearlyPrice : plan.monthlyPrice}</span>
                    {plan.monthlyPrice > 0 && <span className="text-sm text-white/45">/mo</span>}
                  </div>

                  <button
                    onClick={() => handleSubscribe(planId)}
                    disabled={loadingPlan === planId || isCurrent}
                    className={`w-full py-2.5 px-4 rounded-xl text-sm font-semibold transition-all mb-6 ${
                      isCurrent
                        ? 'bg-white/5 text-white/30 cursor-default border border-white/[0.06]'
                        : isPopular
                        ? 'btn-primary justify-center'
                        : 'btn-secondary justify-center'
                    }`}
                  >
                    {isCurrent
                      ? 'Current plan'
                      : loadingPlan === planId
                      ? 'Loading...'
                      : plan.cta}
                  </button>

                  <div className="flex-1 space-y-2.5">
                    {plan.features.map((f) => (
                      <div key={f} className="flex items-start gap-2 text-sm text-white/50">
                        <Check className="w-4 h-4 text-emerald-400/70 flex-shrink-0 mt-0.5" />
                        {f}
                      </div>
                    ))}
                    {plan.limitations.map((f) => (
                      <div key={f} className="flex items-start gap-2 text-sm text-white/40">
                        <X className="w-4 h-4 text-white/30 flex-shrink-0 mt-0.5" />
                        {f}
                      </div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Compare link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 text-center space-y-2"
          >
            <Link href="/compare" className="inline-flex items-center gap-1 text-sm text-brand-400 hover:text-brand-300 transition-colors">
              See how we compare to VEED, Kapwing & others <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <p className="text-xs text-white/40">
              Need more? <a href="mailto:madhvaniparth2@gmail.com" className="text-white/40 hover:text-white/60 underline">Contact us</a> for custom plans.
            </p>
          </motion.div>
        </div>
      </section>

      <FAQSection />
      <Footer />
    </>
  );
}
