'use client';

export default function TranscriptionItem({
  item,
  handleStartTimeChange,
  handleEndTimeChange,
  handleContentChange,
}) {
  if (!item) return null;

  return (
    <div className="grid grid-cols-[80px_80px_1fr] gap-2 px-2 py-1.5 rounded-lg hover:bg-white/[0.02] transition-colors group">
      <input
        type="text"
        className="bg-white/5 text-white/60 text-xs px-2 py-1.5 rounded-md border border-transparent focus:border-brand-500/30 focus:outline-none focus:bg-white/[0.08] transition-all font-mono"
        value={item.start_time}
        onChange={handleStartTimeChange}
      />
      <input
        type="text"
        className="bg-white/5 text-white/60 text-xs px-2 py-1.5 rounded-md border border-transparent focus:border-brand-500/30 focus:outline-none focus:bg-white/[0.08] transition-all font-mono"
        value={item.end_time}
        onChange={handleEndTimeChange}
      />
      <input
        type="text"
        className="bg-white/5 text-white/80 text-sm px-3 py-1.5 rounded-md border border-transparent focus:border-brand-500/30 focus:outline-none focus:bg-white/[0.08] transition-all"
        value={item.content}
        onChange={handleContentChange}
      />
    </div>
  );
}
