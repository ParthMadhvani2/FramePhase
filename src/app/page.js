import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import ComparisonSection from "@/components/ComparisonSection";
import TrustSection from "@/components/TrustSection";
import CTASection from "@/components/CTASection";
import FAQSection from "@/components/FAQSection";
import Footer from "@/components/Footer";

// Structured data for SEO — helps Google show rich results
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "FramePhase",
  applicationCategory: "MultimediaApplication",
  operatingSystem: "Web",
  description: "AI-powered video caption generator. Upload, transcribe, edit, style, and download with captions burned in — all in your browser. Privacy-first: video processing happens client-side.",
  url: "https://frame-phase.netlify.app",
  offers: [
    {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      name: "Free",
      description: "3 videos per month with basic features",
    },
    {
      "@type": "Offer",
      price: "9",
      priceCurrency: "USD",
      name: "Starter",
      description: "15 videos per month with SRT/VTT export and custom styles",
    },
    {
      "@type": "Offer",
      price: "29",
      priceCurrency: "USD",
      name: "Pro",
      description: "50 videos per month with 4K, premium fonts, multi-language, and AI summarization",
    },
  ],
  featureList: [
    "AI transcription in 100+ languages",
    "Burned-in captions via FFmpeg WebAssembly",
    "Client-side video processing — privacy by design",
    "13+ caption style presets",
    "Inline transcription editor",
    "SRT, VTT, and ASS subtitle export",
    "Batch video upload",
    "Multi-language transcription",
    "Keyboard shortcuts for power users",
    "AI text summarization",
  ],
  author: {
    "@type": "Person",
    name: "Parth Madhvani",
    url: "https://github.com/ParthMadhvani2",
  },
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <ComparisonSection />
      <TrustSection />
      <CTASection />
      <FAQSection />
      <Footer />
    </>
  );
}
