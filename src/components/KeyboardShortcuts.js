'use client';

import { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Keyboard, X } from 'lucide-react';

const SHORTCUTS = [
  { keys: ['Ctrl', 'Enter'], action: 'Apply captions', id: 'apply' },
  { keys: ['Ctrl', 'S'], action: 'Download video', id: 'download' },
  { keys: ['Ctrl', 'E'], action: 'Export SRT', id: 'exportSrt' },
  { keys: ['Ctrl', 'Shift', 'E'], action: 'Export VTT', id: 'exportVtt' },
  { keys: ['?'], action: 'Toggle shortcuts help', id: 'help' },
  { keys: ['Esc'], action: 'Close overlays', id: 'escape' },
];

export function useKeyboardShortcuts(handlers = {}) {
  const handleKeyDown = useCallback((e) => {
    const isInput = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA';
    const ctrl = e.ctrlKey || e.metaKey;

    // Ctrl+Enter → apply captions
    if (ctrl && e.key === 'Enter' && handlers.onApply) {
      e.preventDefault();
      handlers.onApply();
      return;
    }

    // Ctrl+S → download
    if (ctrl && e.key === 's' && !e.shiftKey && handlers.onDownload) {
      e.preventDefault();
      handlers.onDownload();
      return;
    }

    // Ctrl+E → export SRT
    if (ctrl && e.key === 'e' && !e.shiftKey && handlers.onExportSrt) {
      e.preventDefault();
      handlers.onExportSrt();
      return;
    }

    // Ctrl+Shift+E → export VTT
    if (ctrl && e.shiftKey && e.key === 'E' && handlers.onExportVtt) {
      e.preventDefault();
      handlers.onExportVtt();
      return;
    }

    // ? → toggle help (only if not in input)
    if (e.key === '?' && !isInput && handlers.onToggleHelp) {
      e.preventDefault();
      handlers.onToggleHelp();
      return;
    }

    // Esc → close
    if (e.key === 'Escape' && handlers.onEscape) {
      handlers.onEscape();
      return;
    }
  }, [handlers]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

export function ShortcutsHelp({ show, onClose }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={e => e.stopPropagation()}
            className="glass-strong rounded-2xl max-w-sm w-full p-6"
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Keyboard className="w-4 h-4 text-brand-400" />
                <h3 className="text-sm font-semibold">Keyboard Shortcuts</h3>
              </div>
              <button onClick={onClose} className="text-white/30 hover:text-white/60 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              {SHORTCUTS.map((s) => (
                <div key={s.id} className="flex items-center justify-between">
                  <span className="text-xs text-white/50">{s.action}</span>
                  <div className="flex items-center gap-1">
                    {s.keys.map((key, i) => (
                      <span key={i}>
                        <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-white/5 border border-white/10 rounded text-white/50">
                          {key}
                        </kbd>
                        {i < s.keys.length - 1 && <span className="text-white/15 mx-0.5">+</span>}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-4 text-[10px] text-white/20 text-center">
              Press <kbd className="px-1 py-0.5 font-mono bg-white/5 border border-white/10 rounded">?</kbd> to toggle this panel
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
