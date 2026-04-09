'use client';

import { transcriptionItemsToSrt } from "@/libs/awsTranscriptionHelpers";
import { getAvailablePresets } from "@/libs/plans";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL, fetchFile } from "@ffmpeg/util";
import { useEffect, useState, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Sparkles, Download, Lock, ChevronDown, ArrowUpRight } from "lucide-react";
import FramePhaseLoader from "@/components/FramePhaseLoader";
import Link from "next/link";
import toast from "react-hot-toast";
import poppins from './../fonts/Poppins-Regular.ttf';
import poppinsBold from './../fonts/Poppins-Bold.ttf';

const FONT_OPTIONS = [
  { id: 'poppins-bold', name: 'Poppins Bold', ffmpegName: 'Poppins Bold', tier: 'free' },
  { id: 'poppins', name: 'Poppins', ffmpegName: 'Poppins', tier: 'free' },
];

const FONT_SIZE_OPTIONS = [
  { label: 'S', value: 22 },
  { label: 'M', value: 28 },
  { label: 'L', value: 34 },
  { label: 'XL', value: 40 },
];

export default function ResultVideo({ filename, transcriptionItems }) {
  // The S3 bucket is private (Block Public Access). Fetch a short-lived
  // presigned GET URL from our API so we can stream the video + let ffmpeg.wasm
  // read it.
  const [videoUrl, setVideoUrl] = useState(null);
  const { data: session } = useSession();
  const plan = session?.user?.plan || 'free';

  useEffect(() => {
    let cancelled = false;
    if (!filename) return;
    fetch(`/api/video-url?filename=${encodeURIComponent(filename)}`)
      .then((r) => r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`)))
      .then((data) => { if (!cancelled) setVideoUrl(data.url); })
      .catch((err) => {
        console.error('Failed to get video URL:', err);
        toast.error('Failed to load video. Please refresh the page.');
      });
    return () => { cancelled = true; };
  }, [filename]);

  // Style state
  const [activePreset, setActivePreset] = useState(null);
  const [primaryColor, setPrimaryColor] = useState('#FFFFFF');
  const [outlineColor, setOutlineColor] = useState('#000000');
  const [selectedFont, setSelectedFont] = useState('poppins-bold');
  const [fontSize, setFontSize] = useState(30);
  const [showFontDropdown, setShowFontDropdown] = useState(false);
  const fontDropdownRef = useRef(null);

  // Close font dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (fontDropdownRef.current && !fontDropdownRef.current.contains(e.target)) {
        setShowFontDropdown(false);
      }
    };
    if (showFontDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showFontDropdown]);

  // Processing state
  const [progress, setProgress] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [ffmpegError, setFfmpegError] = useState(null);
  const ffmpegRef = useRef(null);
  const videoRef = useRef(null);

  const availablePresets = getAvailablePresets(plan);
  const allPresets = getAvailablePresets('business'); // show all but lock unavailable

  useEffect(() => {
    ffmpegRef.current = new FFmpeg();
    load();
    return () => { ffmpegRef.current = null; };
  }, []);

  // Point the <video> element at the presigned URL once it resolves
  useEffect(() => {
    if (videoUrl && videoRef.current) {
      videoRef.current.src = videoUrl;
    }
  }, [videoUrl]);

  // Set default preset on load
  useEffect(() => {
    if (availablePresets.length > 0 && !activePreset) {
      const classic = availablePresets[0];
      setActivePreset(classic.id);
      setPrimaryColor(classic.primary);
      setOutlineColor(classic.outline);
      setFontSize(classic.fontSize);
    }
  }, [availablePresets, activePreset]);

  const load = async () => {
    // Check SharedArrayBuffer up-front — ffmpeg.wasm needs cross-origin isolation
    if (typeof SharedArrayBuffer === 'undefined') {
      const msg = 'Your browser blocks SharedArrayBuffer (needed for video processing). Try Chrome/Edge, or disable strict privacy extensions.';
      console.error(msg);
      setFfmpegError(msg);
      setIsReady(false);
      toast.error(msg, { duration: 8000 });
      return;
    }
    try {
      const ffmpeg = ffmpegRef.current;
      if (!ffmpeg) return;
      // Try jsdelivr first (sets CORP:cross-origin by default); fall back to unpkg.
      const sources = [
        'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.2/dist/umd',
        'https://unpkg.com/@ffmpeg/core@0.12.2/dist/umd',
      ];
      let lastErr;
      let loaded = false;
      for (const baseURL of sources) {
        try {
          const [coreURL, wasmURL] = await Promise.all([
            toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
            toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
          ]);
          await ffmpeg.load({ coreURL, wasmURL });
          loaded = true;
          break;
        } catch (e) {
          console.warn(`FFmpeg load from ${baseURL} failed:`, e);
          lastErr = e;
        }
      }
      if (!loaded) throw lastErr || new Error('All ffmpeg-core CDN sources failed');
      await ffmpeg.writeFile('/tmp/poppins.ttf', await fetchFile(poppins));
      await ffmpeg.writeFile('/tmp/poppins-bold.ttf', await fetchFile(poppinsBold));
    } catch (error) {
      console.error('Failed to load FFmpeg:', error);
      const msg = error?.message || 'Failed to load video processor.';
      setFfmpegError(msg);
      setIsReady(false);
      toast.error(`Video processor failed to load: ${msg}`, { duration: 8000 });
      return;
    }
    setIsReady(true);
  };

  function toFFmpegColor(rgb) {
    if (!rgb || rgb.length < 7) return '&HFFFFFF&';
    const bgr = rgb.slice(5, 7) + rgb.slice(3, 5) + rgb.slice(1, 3);
    return '&H' + bgr + '&';
  }

  const applyPreset = (preset) => {
    // Check if user can access this preset
    const isAvailable = availablePresets.some(p => p.id === preset.id);
    if (!isAvailable) {
      toast('Upgrade to unlock this style', { icon: '🔒' });
      return;
    }
    setActivePreset(preset.id);
    setPrimaryColor(preset.primary);
    setOutlineColor(preset.outline);
    setFontSize(preset.fontSize);
    if (preset.font) {
      const fontOption = FONT_OPTIONS.find(f => f.ffmpegName === preset.font);
      if (fontOption) setSelectedFont(fontOption.id);
    }
  };

  const getCurrentFontName = () => {
    return FONT_OPTIONS.find(f => f.id === selectedFont)?.ffmpegName || 'Poppins Bold';
  };

  const transcode = async () => {
    const ffmpeg = ffmpegRef.current;
    if (!ffmpeg || !videoRef.current) return;
    if (!videoUrl) {
      toast.error('Video is still loading. Please wait a moment.');
      return;
    }

    try {
      setIsProcessing(true);
      const srt = transcriptionItemsToSrt(transcriptionItems);

      // Fetch the video bytes for ffmpeg. Try the direct presigned S3 URL
      // first (fast, no server cost), and if the S3 bucket has no CORS
      // policy the browser will throw a TypeError — fall back to our
      // same-origin proxy route which streams the bytes through the server.
      let videoBytes;
      const tryFetch = async (url, label) => {
        const res = await fetch(url);
        if (!res.ok) {
          throw new Error(`${label} returned HTTP ${res.status} ${res.statusText}`);
        }
        return new Uint8Array(await res.arrayBuffer());
      };

      try {
        videoBytes = await tryFetch(videoUrl, 'S3');
      } catch (directErr) {
        console.warn('Direct S3 fetch failed, falling back to proxy:', directErr);
        try {
          videoBytes = await tryFetch(
            `/api/video-proxy?filename=${encodeURIComponent(filename)}`,
            'Proxy'
          );
        } catch (proxyErr) {
          throw new Error(
            `Failed to download video. S3 direct: ${directErr.message}. Proxy: ${proxyErr.message}`
          );
        }
      }

      await ffmpeg.writeFile(filename, videoBytes);
      await ffmpeg.writeFile('subs.srt', srt);
      videoRef.current.src = videoUrl;
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Video load timeout')), 30000);
        videoRef.current.onloadedmetadata = () => { clearTimeout(timeout); resolve(); };
        videoRef.current.onerror = () => { clearTimeout(timeout); reject(new Error('Video load failed')); };
      });
      const duration = videoRef.current.duration;
      ffmpeg.on('log', ({ message }) => {
        const regexResult = /time=([0-9:.]+)/.exec(message);
        if (regexResult?.[1]) {
          const [hours, minutes, seconds] = regexResult[1].split(':');
          const doneTotalSeconds = Number(hours) * 3600 + Number(minutes) * 60 + parseFloat(seconds);
          setProgress(Math.min(doneTotalSeconds / duration, 0.99));
        }
      });
      const fontName = getCurrentFontName();
      await ffmpeg.exec([
        '-i', filename,
        '-preset', 'ultrafast',
        '-vf', `subtitles=subs.srt:fontsdir=/tmp:force_style='Fontname=${fontName},FontSize=${fontSize},MarginV=70,PrimaryColour=${toFFmpegColor(primaryColor)},OutlineColour=${toFFmpegColor(outlineColor)}'`,
        'output.mp4'
      ]);
      const data = await ffmpeg.readFile('output.mp4');
      if (videoRef.current) {
        videoRef.current.src = URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }));
      }
      setProgress(1);
      toast.success('Captions applied!');
    } catch (error) {
      console.error('Transcoding failed:', error);
      // Surface the actual error message so the user (and we) can debug
      toast.error(error?.message || 'Failed to apply captions. Please try again.', { duration: 6000 });
      setProgress(1);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = useCallback(() => {
    if (!videoRef.current?.src) return;
    const link = document.createElement('a');
    link.href = videoRef.current.src;
    link.download = 'framephase-' + filename;
    link.click();
  }, [filename]);

  return (
    <div className="space-y-5">
      {/* Caption Presets Grid */}
      <div>
        <p className="text-xs font-medium text-white/50 uppercase tracking-wider mb-3">Caption Style</p>
        <div className="flex flex-wrap gap-2">
          {allPresets.map((preset) => {
            const isAvailable = availablePresets.some(p => p.id === preset.id);
            const isActive = activePreset === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => applyPreset(preset)}
                className={`relative flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-all ${
                  isActive
                    ? 'bg-brand-500/20 border border-brand-500/30 text-brand-300 shadow-sm shadow-brand-500/10'
                    : isAvailable
                    ? 'bg-white/5 border border-white/[0.06] hover:bg-white/10 hover:border-white/[0.1] text-white/60'
                    : 'bg-white/[0.02] border border-dashed border-white/[0.08] text-white/30 cursor-not-allowed opacity-60'
                }`}
                aria-disabled={!isAvailable}
                title={!isAvailable ? `Upgrade to unlock ${preset.name}` : preset.name}
              >
                <div
                  className={`w-3 h-3 rounded-full border border-black/30 ${!isAvailable ? 'grayscale' : ''}`}
                  style={{ background: preset.primary, boxShadow: `0 0 0 1.5px ${preset.outline}` }}
                />
                <span className={!isAvailable ? 'line-through decoration-white/20' : ''}>{preset.name}</span>
                {!isAvailable && (
                  <Lock className="w-3 h-3 text-brand-400/50" />
                )}
              </button>
            );
          })}
        </div>
        {availablePresets.length < allPresets.length && (
          <div className="mt-3 flex items-center gap-2">
            <div className="h-px flex-1 bg-gradient-to-r from-brand-500/20 to-transparent" />
            <Link href="/pricing" className="inline-flex items-center gap-1.5 text-[11px] font-medium text-brand-400 hover:text-brand-300 transition-colors group">
              <Lock className="w-3 h-3" />
              Unlock all {allPresets.length} styles
              <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>
        )}
      </div>

      {/* Custom Controls Row */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Color Pickers */}
        <label className="flex items-center gap-2 text-xs text-white/40">
          Text
          <input type="color" value={primaryColor} onChange={ev => { setPrimaryColor(ev.target.value); setActivePreset(null); }} />
        </label>
        <label className="flex items-center gap-2 text-xs text-white/40">
          Outline
          <input type="color" value={outlineColor} onChange={ev => { setOutlineColor(ev.target.value); setActivePreset(null); }} />
        </label>

        {/* Divider */}
        <div className="w-px h-6 bg-white/[0.06]" />

        {/* Font Selector */}
        <div className="relative" ref={fontDropdownRef}>
          <button
            onClick={() => setShowFontDropdown(!showFontDropdown)}
            aria-expanded={showFontDropdown}
            aria-haspopup="listbox"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs bg-white/5 border border-white/[0.06] hover:bg-white/10 text-white/60 transition-all"
          >
            {FONT_OPTIONS.find(f => f.id === selectedFont)?.name}
            <ChevronDown className="w-3 h-3" />
          </button>
          {showFontDropdown && (
            <div className="absolute top-full mt-1 left-0 z-20 min-w-[160px] rounded-lg bg-surface-100 border border-white/[0.06] shadow-xl py-1">
              {FONT_OPTIONS.map((font) => (
                <button
                  key={font.id}
                  onClick={() => { setSelectedFont(font.id); setShowFontDropdown(false); setActivePreset(null); }}
                  className={`w-full text-left px-3 py-2 text-xs hover:bg-white/5 transition-colors ${
                    selectedFont === font.id ? 'text-brand-400' : 'text-white/60'
                  }`}
                >
                  {font.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Font Size */}
        <div className="flex items-center gap-1">
          {FONT_SIZE_OPTIONS.map((opt) => (
            <button
              key={opt.label}
              onClick={() => { setFontSize(opt.value); setActivePreset(null); }}
              className={`w-7 h-7 rounded-md text-[10px] font-semibold transition-all ${
                fontSize === opt.value
                  ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30'
                  : 'bg-white/5 text-white/30 hover:bg-white/10'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button data-action="apply-captions" onClick={transcode} disabled={isProcessing || !isReady} className={`btn-primary flex-1 justify-center ${!isReady && !isProcessing ? 'opacity-50' : ''}`}>
          {isProcessing ? (
            <FramePhaseLoader variant="inline" message="Processing..." />
          ) : ffmpegError ? (
            <span className="text-red-300">Processor unavailable — refresh</span>
          ) : !isReady ? (
            <FramePhaseLoader variant="inline" message="Loading FFmpeg..." />
          ) : (
            <><Sparkles className="w-4 h-4" /> Apply Captions</>
          )}
        </button>
        {isReady && (
          <button data-action="download-video" onClick={handleDownload} className="btn-secondary">
            <Download className="w-4 h-4" /> Download
          </button>
        )}
      </div>

      {/* Video Preview */}
      <div className="rounded-2xl overflow-hidden relative border border-white/5">
        {progress > 0 && progress < 1 && (
          <div className="absolute inset-0 bg-black/80 flex items-center z-10">
            <div className="w-full px-6 text-center">
              <p className="text-sm text-white/60 mb-2">Applying captions...</p>
              <p className="text-2xl font-bold gradient-text mb-3">{Math.round(progress * 100)}%</p>
              <div className="bg-white/5 rounded-full overflow-hidden h-2">
                <div className="h-full bg-cta-gradient rounded-full transition-all duration-300" style={{ width: progress * 100 + '%' }} />
              </div>
            </div>
          </div>
        )}
        <video ref={videoRef} controls className="w-full" />
      </div>

      {/* Caption Preview Label */}
      <div className="flex items-center justify-between text-[10px] text-white/35">
        <span>Preview: {getCurrentFontName()} · {fontSize}px · {primaryColor}</span>
        <span>Powered by FFmpeg WASM</span>
      </div>
    </div>
  );
}
