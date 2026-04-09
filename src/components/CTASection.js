'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useSession, signIn } from 'next-auth/react';
import Link from 'next/link';

export default function CTASection() {
  const { data: session } = useSession();

  return (
    <section className="py-24 lg:py-32">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-3xl overflow-hidden"
        >
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-brand-600/20 via-brand-500/10 to-purple-600/20" />
          <div className="absolute inset-0 border border-brand-500/20 rounded-3xl" />

          <div className="relative px-8 py-16 sm:px-12 sm:py-20 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Start captioning in 60 seconds
            </h2>
            <p className="text-white/50 text-lg max-w-lg mx-auto mb-8">
              3 free videos. No credit card. No watermark hoops.
              Just upload, transcribe, and download.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              {session ? (
                <Link href="/dashboard" className="btn-primary text-base px-8 py-3.5">
                  Go to Dashboard <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <button onClick={() => signIn('google')} className="btn-primary text-base px-8 py-3.5">
                  Try it free <ArrowRight className="w-4 h-4" />
                </button>
              )}
              <Link href="/compare" className="btn-secondary text-base px-8 py-3.5">
                Compare with others
              </Link>
            </div>
            <p className="mt-4 text-xs text-white/40">
              Used by creators, marketers, and teams in 30+ countries
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
