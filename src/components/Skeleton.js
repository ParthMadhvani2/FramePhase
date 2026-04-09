'use client';

/**
 * Skeleton — lightweight loading placeholder components.
 * Uses the shimmer animation defined in globals.css.
 */

export function SkeletonLine({ width = '100%', height = '12px', className = '' }) {
  return (
    <div
      className={`skeleton rounded ${className}`}
      style={{ width, height }}
    />
  );
}

export function SkeletonBlock({ width = '100%', height = '80px', className = '' }) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{ width, height }}
    />
  );
}

export function DashboardSkeleton() {
  return (
    <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header skeleton */}
        <div className="mb-8">
          <SkeletonLine width="260px" height="32px" className="mb-2" />
          <SkeletonLine width="200px" height="16px" />
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="glass rounded-2xl p-5">
              <SkeletonLine width="80px" height="12px" className="mb-3" />
              <SkeletonLine width="120px" height="24px" className="mb-2" />
              <SkeletonBlock height="8px" className="rounded-full" />
            </div>
          ))}
        </div>

        {/* Upload area */}
        <div className="mb-10">
          <SkeletonLine width="160px" height="20px" className="mb-4" />
          <SkeletonBlock height="200px" className="rounded-2xl" />
        </div>

        {/* Video history */}
        <div>
          <SkeletonLine width="140px" height="20px" className="mb-4" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="glass rounded-xl p-4">
                <SkeletonLine width="80%" height="14px" className="mb-2" />
                <SkeletonLine width="60%" height="10px" className="mb-3" />
                <SkeletonLine width="50px" height="16px" className="rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function PricingSkeleton() {
  return (
    <div className="pt-28 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <SkeletonLine width="280px" height="40px" className="mx-auto mb-3" />
          <SkeletonLine width="320px" height="16px" className="mx-auto mb-8" />
          <SkeletonLine width="180px" height="24px" className="mx-auto rounded-full" />
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="glass rounded-2xl p-6">
              <SkeletonLine width="80px" height="20px" className="mb-2" />
              <SkeletonLine width="60px" height="12px" className="mb-6" />
              <SkeletonLine width="100px" height="36px" className="mb-6" />
              <SkeletonBlock height="40px" className="rounded-xl mb-6" />
              <div className="space-y-2">
                {[1, 2, 3, 4].map(j => (
                  <SkeletonLine key={j} width={`${60 + j * 8}%`} height="14px" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function CompareSkeleton() {
  return (
    <div className="pt-28 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <SkeletonLine width="320px" height="40px" className="mx-auto mb-3" />
          <SkeletonLine width="380px" height="16px" className="mx-auto" />
        </div>

        {/* Advantage cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-20">
          {[1, 2, 3].map(i => (
            <div key={i} className="glass rounded-2xl p-6">
              <SkeletonBlock width="40px" height="40px" className="rounded-xl mb-4" />
              <SkeletonLine width="70%" height="16px" className="mb-2" />
              <SkeletonLine width="90%" height="12px" className="mb-1" />
              <SkeletonLine width="60%" height="12px" />
            </div>
          ))}
        </div>

        {/* Table */}
        <SkeletonBlock height="400px" className="rounded-2xl" />
      </div>
    </div>
  );
}

export function EditorSkeleton() {
  return (
    <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-8">
          <SkeletonLine width="120px" height="16px" />
          <div className="flex gap-2">
            <SkeletonBlock width="60px" height="32px" className="rounded-lg" />
            <SkeletonBlock width="60px" height="32px" className="rounded-lg" />
          </div>
        </div>

        {/* Two column grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="glass rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/5">
              <SkeletonLine width="120px" height="20px" />
            </div>
            <div className="p-4 space-y-3">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="flex gap-2">
                  <SkeletonLine width="60px" height="28px" />
                  <SkeletonLine width="60px" height="28px" />
                  <SkeletonLine height="28px" />
                </div>
              ))}
            </div>
          </div>
          <div className="glass rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/5">
              <SkeletonLine width="140px" height="20px" />
            </div>
            <div className="p-4">
              <SkeletonBlock height="300px" className="rounded-xl mb-4" />
              <div className="flex gap-2">
                <SkeletonBlock height="40px" className="rounded-xl flex-1" />
                <SkeletonBlock width="100px" height="40px" className="rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
