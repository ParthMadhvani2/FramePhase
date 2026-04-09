'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function DashboardError({ error, reset }) {
  useEffect(() => {
    console.error('Dashboard error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-red-400" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Dashboard error</h1>
        <p className="text-sm text-white/40 mb-8">
          Something went wrong loading your dashboard. Your data is safe — try refreshing.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button onClick={reset} className="btn-primary">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          <Link href="/" className="btn-secondary">
            <Home className="w-4 h-4" /> Home
          </Link>
        </div>
      </div>
    </div>
  );
}
