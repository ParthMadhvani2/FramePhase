'use client';

import { useSession, signIn } from 'next-auth/react';
import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Upload, Video, Sparkles, Crown,
  Clock, ExternalLink, Film,
  Plus, TrendingUp
} from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';
import toast from 'react-hot-toast';
import UploadForm from '@/components/UploadForm';
import { DashboardSkeleton } from '@/components/Skeleton';

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}

function DashboardContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [videos, setVideos] = useState([]);
  const [loadingVideos, setLoadingVideos] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      signIn('google');
    }
  }, [status, router]);

  // Show success toast after Stripe checkout redirect
  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      toast.success('Subscription activated! Welcome aboard.');
      router.replace('/dashboard', { scroll: false });
    }
  }, [searchParams, router]);

  // Fetch user's video history
  useEffect(() => {
    if (session?.user?.id) {
      axios
        .get('/api/videos')
        .then((res) => setVideos(res.data.videos || []))
        .catch(() => setVideos([]))
        .finally(() => setLoadingVideos(false));
    }
  }, [session?.user?.id]);

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel? You\'ll keep access until the end of your billing period.')) return;
    setCancelling(true);
    try {
      await axios.post('/api/stripe/cancel');
      toast.success('Subscription will cancel at end of billing period.');
    } catch {
      toast.error('Failed to cancel. Please try again.');
    } finally {
      setCancelling(false);
    }
  };

  if (status === 'loading') {
    return <DashboardSkeleton />;
  }

  if (!session) return null;

  const plan = session.user.plan || 'free';
  const videosUsed = session.user.videosUsed || 0;
  const videosLimit = session.user.videosLimit || 3;
  const usagePercent = Math.min((videosUsed / videosLimit) * 100, 100);
  const isAdmin = session.user.isAdmin || plan === 'admin';
  const isAtLimit = !isAdmin && videosUsed >= videosLimit;

  return (
    <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
        >
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl sm:text-3xl font-bold">
                Welcome back, {session.user.name?.split(' ')[0] || 'Creator'}
              </h1>
              {isAdmin && (
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 uppercase tracking-wider">
                  Admin
                </span>
              )}
            </div>
            <p className="text-white/55">Upload a video to get started with AI captions.</p>
          </div>

          {/* Plan + usage in header area */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/[0.06]">
              <Crown className="w-3.5 h-3.5 text-brand-400" />
              <span className="text-sm font-medium capitalize">{isAdmin ? 'Admin' : plan}</span>
              {plan === 'free' && !isAdmin && (
                <Link href="/pricing" className="text-[10px] text-brand-400 hover:text-brand-300 font-medium ml-1">
                  Upgrade
                </Link>
              )}
            </div>
            {plan !== 'free' && plan !== 'admin' && (
              <button
                onClick={handleCancelSubscription}
                disabled={cancelling}
                className="text-xs text-white/30 hover:text-red-400 transition-colors"
              >
                {cancelling ? 'Cancelling...' : 'Cancel plan'}
              </button>
            )}
          </div>
        </motion.div>

        {/* Usage Bar — Hero element */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="glass rounded-2xl p-5 mb-8"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-brand-400" />
              <span className="text-sm font-medium">Monthly usage</span>
            </div>
            <span className="text-sm text-white/55 font-mono">
              {isAdmin ? (
                <>{videosUsed} <span className="text-white/35">videos (unlimited)</span></>
              ) : (
                <><span className="text-white font-semibold">{videosUsed}</span> <span className="text-white/35">/ {videosLimit} videos</span></>
              )}
            </span>
          </div>
          <div className="bg-white/5 rounded-full overflow-hidden h-2.5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: isAdmin ? '5%' : `${usagePercent}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className={`h-full rounded-full transition-all ${
                usagePercent >= 90 ? 'bg-gradient-to-r from-red-500 to-orange-500' :
                usagePercent >= 70 ? 'bg-gradient-to-r from-amber-500 to-yellow-500' :
                'bg-cta-gradient'
              }`}
            />
          </div>
          {!isAdmin && usagePercent >= 80 && (
            <div className="mt-2 flex items-center justify-between">
              <p className="text-xs text-amber-400">
                {usagePercent >= 100 ? 'Limit reached' : 'Running low'}
              </p>
              <Link href="/pricing" className="text-xs text-brand-400 hover:text-brand-300 font-medium">
                Upgrade for more &rarr;
              </Link>
            </div>
          )}
        </motion.div>

        {/* Upload Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-10"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-brand-400" />
              <h2 className="text-lg font-semibold">Upload a Video</h2>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/pricing" className="btn-secondary text-xs px-3 py-1.5">
                Plans
              </Link>
              <a href="mailto:madhvaniparth2@gmail.com" className="btn-secondary text-xs px-3 py-1.5">
                Support
              </a>
            </div>
          </div>

          {isAtLimit ? (
            <div className="glass rounded-2xl p-10 text-center border border-amber-500/10">
              <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <Video className="w-8 h-8 text-amber-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">You&apos;ve reached your limit</h3>
              <p className="text-white/55 mb-6 max-w-sm mx-auto">
                You&apos;ve used all {videosLimit} videos this month. Upgrade your plan to keep creating.
              </p>
              <Link href="/pricing" className="btn-primary inline-flex">
                <Sparkles className="w-4 h-4" />
                Upgrade Now
              </Link>
            </div>
          ) : (
            <UploadForm />
          )}
        </motion.div>

        {/* Video History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-brand-400" />
            <h2 className="text-lg font-semibold">Your Videos</h2>
            {videos.length > 0 && (
              <span className="text-xs text-white/40 ml-auto">{videos.length} video{videos.length !== 1 ? 's' : ''}</span>
            )}
          </div>

          {loadingVideos ? (
            /* Skeleton loader for video history */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="glass rounded-xl p-4">
                  <div className="skeleton h-3.5 w-3/4 rounded mb-2" />
                  <div className="skeleton h-2.5 w-1/2 rounded mb-3" />
                  <div className="skeleton h-4 w-16 rounded-full" />
                </div>
              ))}
            </div>
          ) : videos.length === 0 ? (
            /* Rich empty state */
            <div className="glass rounded-2xl p-10 text-center border border-dashed border-white/[0.08]">
              <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
                <Film className="w-8 h-8 text-white/25" />
              </div>
              <h3 className="text-base font-semibold mb-2">No videos yet</h3>
              <p className="text-sm text-white/50 mb-5 max-w-sm mx-auto">
                Upload your first video above and it will appear here. You can always come back to edit captions on past videos.
              </p>
              <button
                onClick={() => {
                  const uploadArea = document.querySelector('[data-upload-zone]');
                  uploadArea?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }}
                className="btn-secondary text-sm inline-flex"
              >
                <Plus className="w-4 h-4" /> Upload your first video
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {videos.map((video) => (
                <Link
                  key={video.id}
                  href={`/${video.filename}`}
                  className="glass rounded-xl p-4 group hover:bg-white/[0.04] hover:border-brand-500/10 border border-transparent transition-all duration-200"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate group-hover:text-brand-300 transition-colors">
                        {video.originalName}
                      </p>
                      <p className="text-xs text-white/45 mt-1">
                        {new Date(video.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                      <span className={`inline-block text-[10px] font-medium px-2 py-0.5 mt-2 rounded-full uppercase tracking-wider ${
                        video.status === 'completed'
                          ? 'bg-emerald-500/15 text-emerald-400'
                          : video.status === 'uploaded'
                          ? 'bg-blue-500/15 text-blue-400'
                          : 'bg-white/10 text-white/50'
                      }`}>
                        {video.status}
                      </span>
                    </div>
                    <ExternalLink className="w-4 h-4 text-white/20 group-hover:text-brand-400 transition-colors flex-shrink-0 mt-1" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
