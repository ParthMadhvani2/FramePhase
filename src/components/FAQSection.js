'use client';

import { motion, AnimatePresence } from "framer-motion";
import { useState, useId } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "How does the transcription work?",
    answer: "When you upload a video, we send the audio to AWS Transcribe, which auto-detects the language and returns timestamped text. You can then edit every word in our inline editor before applying captions.",
  },
  {
    question: "Is my video private?",
    answer: "The audio is sent to AWS for transcription (encrypted in transit and at rest). But the actual caption-burning process runs entirely in your browser via WebAssembly. The processed video never leaves your device.",
  },
  {
    question: "What video formats are supported?",
    answer: "MP4, MOV, AVI, WebM, and MKV. Maximum file size is 500MB on all plans.",
  },
  {
    question: "Can I export just the subtitle file?",
    answer: "Yes. On paid plans, you can download SRT and VTT files for use on YouTube, Vimeo, or any platform that supports standard subtitle formats.",
  },
  {
    question: "Is there a free plan?",
    answer: "Yes. Every new account gets 3 free videos per month with full caption features. No credit card required. Upgrade when you need more.",
  },
  {
    question: "How accurate is the transcription?",
    answer: "AWS Transcribe typically achieves 95-99% accuracy for clear audio in supported languages. You can correct any errors in the editor before applying captions.",
  },
];

function FAQItem({ faq, index, isOpen, onToggle }) {
  const id = useId();
  const panelId = `faq-panel-${id}`;
  const buttonId = `faq-button-${id}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
    >
      <h3>
        <button
          id={buttonId}
          onClick={onToggle}
          aria-expanded={isOpen}
          aria-controls={panelId}
          className="flex items-center justify-between w-full py-5 text-left group"
        >
          <span className="text-sm font-medium pr-4 group-hover:text-white transition-colors">{faq.question}</span>
          <ChevronDown className={`w-4 h-4 text-white/35 flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </h3>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id={panelId}
            role="region"
            aria-labelledby={buttonId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-sm text-white/50 leading-relaxed">{faq.answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <section id="faq" className="py-24 lg:py-32 border-t border-white/[0.04]">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-sm font-medium text-brand-400 mb-3">FAQ</p>
          <h2 className="text-3xl sm:text-4xl font-bold">Common questions</h2>
        </motion.div>

        <div className="mt-12 space-y-0 divide-y divide-white/[0.04]">
          {faqs.map((faq, index) => (
            <FAQItem
              key={index}
              faq={faq}
              index={index}
              isOpen={openIndex === index}
              onToggle={() => setOpenIndex(openIndex === index ? null : index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
