'use client';

import { useCallback, useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import { Upload, FileVideo, AlertCircle, X, ChevronDown, Globe, Search } from "lucide-react";
import FramePhaseLoader from "@/components/FramePhaseLoader";
import { motion, AnimatePresence } from "framer-motion";
import { SUPPORTED_LANGUAGES, canAccess } from "@/libs/plans";
import axios from "axios";
import toast from "react-hot-toast";

const ACCEPTED_TYPES = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm', 'video/x-matroska'];
const MAX_SIZE_MB = 500;

export default function UploadForm() {
  const [uploadQueue, setUploadQueue] = useState([]); // { file, progress, status, error, newName }
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('auto');
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [langSearch, setLangSearch] = useState('');
  const router = useRouter();
  const { data: session } = useSession();
  const fileInputRef = useRef(null);
  const langDropdownRef = useRef(null);
  const langSearchRef = useRef(null);
  const plan = session?.user?.plan || 'free';
  const hasMultiLanguage = canAccess(plan, 'multiLanguage');

  // Close language dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(e.target)) {
        setShowLanguageDropdown(false);
        setLangSearch('');
      }
    };
    if (showLanguageDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showLanguageDropdown]);

  const validateFile = (file) => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return 'Please upload a valid video file (MP4, MOV, AVI, WebM, MKV).';
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      return `File size exceeds ${MAX_SIZE_MB}MB limit.`;
    }
    return null;
  };

  const uploadSingleFile = async (file, queueIndex) => {
    setUploadQueue(prev => prev.map((item, i) =>
      i === queueIndex ? { ...item, status: 'uploading', progress: 0 } : item
    ));

    try {
      const res = await axios.postForm('/api/upload', {
        file,
        language: selectedLanguage,
      }, {
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadQueue(prev => prev.map((item, i) =>
            i === queueIndex ? { ...item, progress: percent } : item
          ));
        },
      });

      setUploadQueue(prev => prev.map((item, i) =>
        i === queueIndex ? { ...item, status: 'done', progress: 100, newName: res.data.newName } : item
      ));

      return res.data.newName;
    } catch (err) {
      const message = err.response?.data?.error || 'Upload failed.';
      setUploadQueue(prev => prev.map((item, i) =>
        i === queueIndex ? { ...item, status: 'error', error: message } : item
      ));
      return null;
    }
  };

  const handleUpload = async (files) => {
    if (!session) {
      signIn('google');
      return;
    }

    setError('');
    const fileArray = Array.from(files);

    // Validate all files first
    for (const file of fileArray) {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        toast.error(validationError);
        return;
      }
    }

    // Single file — upload and redirect immediately
    if (fileArray.length === 1) {
      const queueEntry = { file: fileArray[0], progress: 0, status: 'pending', error: null, newName: null };
      setUploadQueue([queueEntry]);

      const newName = await uploadSingleFile(fileArray[0], 0);
      if (newName) {
        toast.success('Video uploaded! Starting transcription...');
        const langParam = selectedLanguage !== 'auto' ? `?language=${selectedLanguage}` : '';
        router.push('/' + newName + langParam);
      }
      setUploadQueue([]);
      return;
    }

    // Multiple files — batch queue
    const queue = fileArray.map(file => ({
      file,
      progress: 0,
      status: 'pending',
      error: null,
      newName: null,
    }));
    setUploadQueue(queue);

    // Upload sequentially to respect rate limits
    for (let i = 0; i < queue.length; i++) {
      await uploadSingleFile(fileArray[i], i);
    }

    toast.success(`${fileArray.length} videos uploaded!`);
  };

  const onFileChange = (ev) => {
    const files = ev.target.files;
    if (files.length > 0) {
      handleUpload(files);
    }
    // Reset input so same file can be re-uploaded
    ev.target.value = '';
  };

  const onDrop = useCallback((ev) => {
    ev.preventDefault();
    setDragOver(false);
    const files = ev.dataTransfer?.files;
    if (files && files.length > 0) {
      handleUpload(files);
    }
  }, [session, selectedLanguage]);

  const onDragOver = (ev) => {
    ev.preventDefault();
    setDragOver(true);
  };

  const onDragLeave = () => {
    setDragOver(false);
  };

  const clearQueue = () => {
    setUploadQueue([]);
  };

  const goToVideo = (newName) => {
    const langParam = selectedLanguage !== 'auto' ? `?language=${selectedLanguage}` : '';
    router.push('/' + newName + langParam);
  };

  const isUploading = uploadQueue.some(q => q.status === 'uploading' || q.status === 'pending');
  const selectedLang = SUPPORTED_LANGUAGES.find(l => l.code === selectedLanguage);

  return (
    <>
      {/* Upload overlay for single file */}
      <AnimatePresence>
        {uploadQueue.length === 1 && isUploading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          >
            <div className="text-center max-w-sm w-full">
              <div className="mb-6">
                <FramePhaseLoader variant="full" />
              </div>
              <h2 className="text-xl font-bold mb-2">Uploading your video</h2>
              <p className="text-sm text-white/50 mb-6">Please wait while we upload your file...</p>
              <div className="glass rounded-full overflow-hidden h-2.5 mb-3">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${uploadQueue[0]?.progress || 0}%` }}
                  className="h-full bg-cta-gradient rounded-full"
                />
              </div>
              <p className="text-xs text-white/40 font-mono">{uploadQueue[0]?.progress || 0}%</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Batch upload progress (inline, not overlay) */}
      <AnimatePresence>
        {uploadQueue.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="glass rounded-2xl p-4 mb-4"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold">
                Uploading {uploadQueue.filter(q => q.status === 'done').length}/{uploadQueue.length} videos
              </h3>
              {!isUploading && (
                <button onClick={clearQueue} className="text-xs text-white/30 hover:text-white/60">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="space-y-2">
              {uploadQueue.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-white/60 truncate">{item.file.name}</p>
                    <div className="mt-1 bg-white/5 rounded-full overflow-hidden h-1.5">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          item.status === 'error' ? 'bg-red-500' :
                          item.status === 'done' ? 'bg-emerald-500' : 'bg-cta-gradient'
                        }`}
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-[10px] w-14 text-right">
                    {item.status === 'done' ? (
                      <button
                        onClick={() => goToVideo(item.newName)}
                        className="text-brand-400 hover:text-brand-300"
                      >
                        Open &rarr;
                      </button>
                    ) : item.status === 'error' ? (
                      <span className="text-red-400">Failed</span>
                    ) : item.status === 'uploading' ? (
                      <span className="text-white/40">{item.progress}%</span>
                    ) : (
                      <span className="text-white/20">Queued</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Language selector + Drop zone */}
      <div className="space-y-3">
        {/* Language selector */}
        <div className="flex items-center gap-2">
          <div className="relative" ref={langDropdownRef}>
            <button
              onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
              aria-expanded={showLanguageDropdown}
              aria-haspopup="listbox"
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs bg-white/5 border border-white/[0.06] hover:bg-white/10 text-white/60 transition-all"
            >
              <Globe className="w-3.5 h-3.5 text-brand-400" />
              <span>{selectedLang?.flag} {selectedLang?.name}</span>
              <ChevronDown className="w-3 h-3" />
              {!hasMultiLanguage && selectedLanguage !== 'auto' && selectedLanguage !== 'en-US' && selectedLanguage !== 'en-GB' && (
                <span className="text-[9px] text-brand-400 font-medium">PRO</span>
              )}
            </button>
            {showLanguageDropdown && (
              <div className="absolute top-full mt-1 left-0 z-30 w-[260px] rounded-xl bg-surface-100 border border-white/[0.06] shadow-xl overflow-hidden">
                {/* Search input */}
                <div className="px-2.5 py-2 border-b border-white/[0.06]">
                  <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/[0.06]">
                    <Search className="w-3 h-3 text-white/30 flex-shrink-0" />
                    <input
                      ref={langSearchRef}
                      type="text"
                      value={langSearch}
                      onChange={(e) => setLangSearch(e.target.value)}
                      placeholder="Search languages..."
                      className="bg-transparent text-xs text-white/80 placeholder:text-white/25 outline-none w-full"
                      autoFocus
                    />
                    {langSearch && (
                      <button onClick={() => setLangSearch('')} className="text-white/30 hover:text-white/60">
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Language list */}
                <div className="max-h-[240px] overflow-y-auto py-1">
                  {SUPPORTED_LANGUAGES
                    .filter((lang) =>
                      !langSearch || lang.name.toLowerCase().includes(langSearch.toLowerCase()) || lang.code.toLowerCase().includes(langSearch.toLowerCase())
                    )
                    .map((lang) => {
                      const isLocked = !hasMultiLanguage && lang.code !== 'auto' && lang.code !== 'en-US' && lang.code !== 'en-GB';
                      return (
                        <button
                          key={lang.code}
                          onClick={() => {
                            if (isLocked) {
                              toast('Upgrade to Pro for all languages', { icon: '🔒' });
                              return;
                            }
                            setSelectedLanguage(lang.code);
                            setShowLanguageDropdown(false);
                            setLangSearch('');
                          }}
                          className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2 hover:bg-white/5 transition-colors ${
                            selectedLanguage === lang.code ? 'text-brand-400 bg-brand-500/5' :
                            isLocked ? 'text-white/30' : 'text-white/60'
                          }`}
                        >
                          <span>{lang.flag}</span>
                          <span className="flex-1">{lang.name}</span>
                          {isLocked && <span className="text-[9px] font-semibold text-brand-400/60 bg-brand-500/10 px-1.5 py-0.5 rounded-full">PRO</span>}
                        </button>
                      );
                    })}
                  {SUPPORTED_LANGUAGES.filter((lang) =>
                    !langSearch || lang.name.toLowerCase().includes(langSearch.toLowerCase()) || lang.code.toLowerCase().includes(langSearch.toLowerCase())
                  ).length === 0 && (
                    <p className="text-xs text-white/30 text-center py-4">No languages found</p>
                  )}
                </div>
              </div>
            )}
          </div>
          <span className="text-[10px] text-white/40">
            {selectedLanguage === 'auto' ? 'Language will be detected automatically' : `Transcription in ${selectedLang?.name}`}
          </span>
        </div>

        {/* Drop zone */}
        <div
          data-upload-zone
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`relative glass rounded-2xl p-8 sm:p-12 transition-all cursor-pointer group ${
            dragOver
              ? 'border-2 border-brand-400 bg-brand-500/5 scale-[1.02]'
              : 'border-2 border-dashed border-white/10 hover:border-brand-500/30'
          }`}
        >
          <div className="flex flex-col items-center">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all ${
              dragOver
                ? 'bg-brand-500/20 scale-110'
                : 'bg-white/5 group-hover:bg-brand-500/10'
            }`}>
              {dragOver ? (
                <FileVideo className="w-8 h-8 text-brand-400" />
              ) : (
                <Upload className="w-8 h-8 text-white/40 group-hover:text-brand-400 transition-colors" />
              )}
            </div>

            <h3 className="text-lg font-semibold mb-1">
              {dragOver ? 'Drop your video here' : 'Upload a video'}
            </h3>
            <p className="text-sm text-white/40 mb-4">
              Drag and drop or <span className="text-brand-400">browse files</span>
            </p>
            <p className="text-xs text-white/35">
              MP4, MOV, AVI, WebM, MKV &bull; Up to {MAX_SIZE_MB}MB &bull; Select multiple for batch
            </p>

            <input
              ref={fileInputRef}
              onChange={onFileChange}
              type="file"
              accept="video/*"
              multiple
              className="hidden"
            />
          </div>

          {/* Error message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-4 flex items-center gap-2 text-sm text-red-400 bg-red-500/10 rounded-lg px-4 py-2"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
