'use client';

import { Lock, ArrowRight } from 'lucide-react';
import Link from 'next/link';

/**
 * LockedFeature — wraps any content with a blur overlay + upgrade prompt.
 * Used for plan-gated features across the app.
 *
 * Props:
 * - locked: boolean — whether to show the locked overlay
 * - planRequired: string — plan name to show (e.g. "Starter", "Pro")
 * - compact: boolean — use minimal layout (for inline badges)
 * - children: the content to render (visible but locked when locked=true)
 * - className: additional classes for the wrapper
 */
export function LockedFeature({ locked, planRequired = 'Pro', compact = false, children, className = '' }) {
  if (!locked) return <>{children}</>;

  return (
    <div className={`relative group ${className}`}>
      {/* Blurred content behind */}
      <div className="pointer-events-none select-none" style={{ filter: 'blur(1px)', opacity: 0.4 }}>
        {children}
      </div>

      {/* Lock overlay */}
      <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-surface/60 backdrop-blur-[2px] border border-white/[0.04]">
        <div className={`text-center ${compact ? 'px-2 py-1' : 'px-4 py-3'}`}>
          <div className={`mx-auto mb-2 rounded-full bg-brand-500/10 border border-brand-500/20 flex items-center justify-center ${compact ? 'w-6 h-6' : 'w-8 h-8'}`}>
            <Lock className={compact ? 'w-3 h-3 text-brand-400' : 'w-4 h-4 text-brand-400'} />
          </div>
          {!compact && (
            <>
              <p className="text-xs font-medium text-white/70 mb-1">{planRequired} plan</p>
              <Link
                href="/pricing"
                className="inline-flex items-center gap-1 text-[10px] font-medium text-brand-400 hover:text-brand-300 transition-colors"
              >
                Upgrade <ArrowRight className="w-2.5 h-2.5" />
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * UpgradeBadge — a small inline badge for locked features.
 * Shows the plan name with a lock icon.
 */
export function UpgradeBadge({ plan = 'Pro', size = 'sm' }) {
  const sizes = {
    xs: 'text-[8px] px-1.5 py-0.5 gap-0.5',
    sm: 'text-[10px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1',
  };

  return (
    <Link
      href="/pricing"
      className={`inline-flex items-center rounded-full font-semibold
        bg-brand-500/10 border border-brand-500/20 text-brand-400
        hover:bg-brand-500/15 hover:text-brand-300 transition-all
        ${sizes[size] || sizes.sm}`}
    >
      <Lock className={size === 'xs' ? 'w-2 h-2' : size === 'md' ? 'w-3.5 h-3.5' : 'w-2.5 h-2.5'} />
      {plan}
    </Link>
  );
}
