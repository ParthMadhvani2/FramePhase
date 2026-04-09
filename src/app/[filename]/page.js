'use client';

import ResultVideo from "@/components/ResultVideo";
import TranscriptionEditor from "@/components/TranscriptionEditor";
import { useKeyboardShortcuts, ShortcutsHelp } from "@/components/KeyboardShortcuts";
import { clearTranscriptionItems } from "@/libs/awsTranscriptionHelpers";
import { transcriptionItemsToSrt, transcriptionItemsToVtt } from "@/libs/awsTranscriptionHelpers";
import { canAccess } from "@/libs/plans";
import axios from "axios";
import { useEffect, useState, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, FileText, Lock, Keyboard } from "lucide-react";
import FramePhaseLoader from "@/components/FramePhaseLoader";
import Link from "next/link";
import toast from "react-hot-toast";

export default function FilePage({ params }) {
  const filename = params.filename;
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isFetchingInfo, setIsFetchingInfo] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [awsTranscriptionItems, setAwsTranscriptionItems] = useState([]);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [detectedLanguage, setDetectedLanguage] = useState(null);
  const pollingRef = useRef(null);
  const resultVideoRef = useRef(null);

  const plan = session?.user?.plan || 'free';
  const canExport = canAccess(plan, 'srtExport');
  const canExportVtt = canAccess(plan, 'vttExport');

  // Validate filename
  const isValidFilename = /^[a-zA-Z0-9._-]+$/.test(filename);

  const getTranscription = useCallback(() => {
    if (!isValidFilename) {
      setHasError(true);
      return;
    }

    setIsFetchingInfo(true);
    setHasError(false);

    // Pass language preference if available
    const language = searchParams.get('language') || 'auto';
    const url = `/api/transcribe?filename=${encodeURIComponent(filename)}&language=${language}`;

    axios.get(url).then(response => {
      setIsFetchingInfo(false);
      const status = response.data?.status;
      const transcription = response.data?.transcription;

      if (status === 'IN_PROGRESS') {
        setIsTranscribing(true);
        pollingRef.current = setTimeout(getTranscription, 3000);
      } else if (transcription?.results?.items) {
        setIsTranscribing(false);
        setAwsTranscriptionItems(
          clearTranscriptionItems(transcription.results.items)
        );
        // Store detected language if available
        if (transcription.results?.language_code) {
          setDetectedLanguage(transcription.results.language_code);
        }
      } else {
        setHasError(true);
        toast.error('Unexpected transcription format.');
      }
    }).catch(() => {
      setIsFetchingInfo(false);
      setIsTranscribing(false);
      setHasError(true);
      toast.error('Failed to fetch transcription.');
    });
  }, [filename, isValidFilename, searchParams]);

  useEffect(() => {
    getTranscription();
    return () => {
      if (pollingRef.current) clearTimeout(pollingRef.current);
    };
  }, [getTranscription]);

  const handleExportSRT = useCallback(() => {
    if (!canExport) {
      toast('Upgrade to export SRT files', { icon: '🔒' });
      return;
    }
    const srt = transcriptionItemsToSrt(awsTranscriptionItems);
    downloadFile(srt, filename.replace(/\.[^.]+$/, '') + '.srt', 'text/plain');
    toast.success('SRT downloaded');
  }, [awsTranscriptionItems, filename, canExport]);

  const handleExportVTT = useCallback(() => {
    if (!canExportVtt) {
      toast('Upgrade to export VTT files', { icon: '🔒' });
      return;
    }
    const vtt = transcriptionItemsToVtt(awsTranscriptionItems);
    downloadFile(vtt, filename.replace(/\.[^.]+$/, '') + '.vtt', 'text/plain');
    toast.success('VTT downloaded');
  }, [awsTranscriptionItems, filename, canExportVtt]);

  function downloadFile(content, name, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onApply: () => {
      // Trigger apply in ResultVideo via DOM click (clean decoupling)
      const applyBtn = document.querySelector('[data-action="apply-captions"]');
      if (applyBtn && !applyBtn.disabled) applyBtn.click();
    },
    onDownload: () => {
      const downloadBtn = document.querySelector('[data-action="download-video"]');
      if (downloadBtn) downloadBtn.click();
    },
    onExportSrt: handleExportSRT,
    onExportVtt: handleExportVTT,
    onToggleHelp: () => setShowShortcuts(prev => !prev),
    onEscape: () => setShowShortcuts(false),
  });

  if (hasError) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20 px-4">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
          <p className="text-white/50 mb-6">We couldn&apos;t load the transcription for this video.</p>
          <Link href="/dashboard" className="btn-primary inline-flex">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (isTranscribing || isFetchingInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <FramePhaseLoader
            variant="full"
            message={isTranscribing ? 'Transcribing your video...' : 'Loading...'}
            subtitle={isTranscribing ? 'AI is processing your audio. Usually takes 30\u201360 seconds.' : 'Fetching transcription data...'}
          />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Top bar */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" /> Dashboard
            </Link>
            {detectedLanguage && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-white/30 uppercase tracking-wider">
                {detectedLanguage}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowShortcuts(true)}
              className="btn-secondary text-xs px-3 py-2 opacity-60 hover:opacity-100"
              title="Keyboard shortcuts (?)"
            >
              <Keyboard className="w-3.5 h-3.5" />
            </button>
            {canExport ? (
              <>
                <button onClick={handleExportSRT} className="btn-secondary text-xs px-3 py-2">
                  <FileText className="w-3.5 h-3.5" /> SRT
                </button>
                <button onClick={handleExportVTT} className="btn-secondary text-xs px-3 py-2">
                  <FileText className="w-3.5 h-3.5" /> VTT
                </button>
              </>
            ) : (
              <Link href="/pricing" className="btn-secondary text-xs px-3 py-2 opacity-70">
                <Lock className="w-3.5 h-3.5" /> Export SRT/VTT
                <span className="text-brand-400 ml-1">Pro</span>
              </Link>
            )}
          </div>
        </motion.div>

        {/* Editor Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="glass rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Transcription</h2>
              <span className="text-xs text-white/30">{awsTranscriptionItems.filter(Boolean).length} segments</span>
            </div>
            <div className="p-4">
              <TranscriptionEditor awsTranscriptionItems={awsTranscriptionItems} setAwsTranscriptionItems={setAwsTranscriptionItems} />
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/5">
              <h2 className="text-lg font-semibold">Preview & Export</h2>
            </div>
            <div className="p-4">
              <ResultVideo ref={resultVideoRef} filename={filename} transcriptionItems={awsTranscriptionItems} />
            </div>
          </motion.div>
        </div>

        {/* Keyboard shortcut hint */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-4 text-center text-[10px] text-white/30"
        >
          Press <kbd className="px-1 py-0.5 font-mono bg-white/5 border border-white/[0.06] rounded text-white/20">?</kbd> for keyboard shortcuts
        </motion.p>
      </div>

      {/* Shortcuts overlay */}
      <ShortcutsHelp show={showShortcuts} onClose={() => setShowShortcuts(false)} />
    </div>
  );
}
