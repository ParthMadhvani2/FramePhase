'use client';

import TranscriptionItem from "@/components/TranscriptionItem";
import { useState } from 'react';
import axios from 'axios';
import { Sparkles, Brain } from "lucide-react";
import FramePhaseLoader from "@/components/FramePhaseLoader";
import toast from "react-hot-toast";

export default function TranscriptionEditor({
  awsTranscriptionItems,
  setAwsTranscriptionItems,
}) {
  const [summary, setSummary] = useState('');
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  const updateTranscriptionItem = (index, prop, ev) => {
    if (index < 0 || index >= awsTranscriptionItems.length) return;
    const newAwsItems = [...awsTranscriptionItems];
    newAwsItems[index] = { ...newAwsItems[index], [prop]: ev.target.value };
    setAwsTranscriptionItems(newAwsItems);
  };

  const extractContentWords = (transcriptionItems) => {
    return transcriptionItems
      .filter(Boolean)
      .map(item => item.content)
      .join(' ')
      .trim();
  };

  const summarizeText = async () => {
    const textToSummarize = extractContentWords(awsTranscriptionItems);
    if (!textToSummarize) {
      toast.error('No text to summarize.');
      return;
    }

    try {
      setIsSummarizing(true);
      setShowSummary(true);
      // Call our server-side API route (key stays on server)
      const response = await axios.post('/api/summarize', { text: textToSummarize });
      setSummary(response.data.summary);
      toast.success('Summary generated!');
    } catch (error) {
      console.error("Error summarizing text:", error);
      const msg = error.response?.data?.error || 'Failed to generate summary.';
      toast.error(msg);
    } finally {
      setIsSummarizing(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="grid grid-cols-[80px_80px_1fr] gap-2 px-3 py-2 rounded-lg bg-surface-100/95 backdrop-blur-sm text-xs font-medium text-white/50 uppercase tracking-wider sticky top-0 z-10 border-b border-white/[0.04]">
        <div>From</div>
        <div>End</div>
        <div>Content</div>
      </div>

      {/* Items */}
      {awsTranscriptionItems.length > 0 && (
        <div className="max-h-[400px] overflow-y-auto space-y-1 pr-1">
          {awsTranscriptionItems.map((item, index) => (
            item && (
              <TranscriptionItem
                key={`${item.start_time}-${index}`}
                handleStartTimeChange={ev => updateTranscriptionItem(index, 'start_time', ev)}
                handleEndTimeChange={ev => updateTranscriptionItem(index, 'end_time', ev)}
                handleContentChange={ev => updateTranscriptionItem(index, 'content', ev)}
                item={item}
              />
            )
          ))}
        </div>
      )}

      {/* Summarize */}
      <div className="pt-2 border-t border-white/5">
        <button onClick={summarizeText} disabled={isSummarizing} className="btn-secondary text-sm w-full justify-center">
          {isSummarizing ? (
            <FramePhaseLoader variant="inline" message="Summarizing..." />
          ) : (
            <><Brain className="w-4 h-4" /> AI Summarize</>
          )}
        </button>
      </div>

      {showSummary && (
        <div className="rounded-xl bg-brand-500/5 border border-brand-500/10 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-brand-400" />
            <span className="text-xs font-medium text-brand-300">AI Summary</span>
          </div>
          {isSummarizing ? (
            <div className="py-1">
              <FramePhaseLoader variant="inline" message="Generating..." />
            </div>
          ) : (
            <p className="text-sm text-white/60 leading-relaxed">{summary}</p>
          )}
        </div>
      )}
    </div>
  );
}
