import './globals.css'
import { Inter } from 'next/font/google'
import Navbar from "@/components/Navbar";
import AuthProvider from "@/components/AuthProvider";
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata = {
  title: "FramePhase — AI-Powered Video Captions in Seconds",
  description: "Transform your videos with AI-generated captions. Upload, transcribe, customize, and download — all in your browser. Built for content creators, marketers, and teams.",
  keywords: "video captions, AI transcription, subtitle generator, video subtitles, content creator tools, auto caption, SRT export, VTT export, burned-in captions",
  metadataBase: new URL("https://frame-phase.netlify.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "FramePhase — AI-Powered Video Captions in Seconds",
    description: "Transform your videos with AI-generated captions. Upload, transcribe, customize, and download.",
    url: "https://frame-phase.netlify.app",
    siteName: "FramePhase",
    type: "website",
    locale: "en_US",
    images: [{ url: "/og-image.svg", width: 1200, height: 630, alt: "FramePhase — AI Video Captions" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "FramePhase — AI-Powered Video Captions",
    description: "Transform your videos with AI-generated captions in seconds.",
    creator: "@ParthMadhvani2",
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: "/apple-icon.png",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans bg-surface min-h-screen text-white overflow-x-hidden">
        <AuthProvider>
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 3500,
              style: {
                background: 'rgba(26, 26, 46, 0.95)',
                backdropFilter: 'blur(12px)',
                color: '#fff',
                border: '1px solid rgba(99,102,241,0.15)',
                borderRadius: '12px',
                fontSize: '14px',
                padding: '12px 16px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              },
              success: {
                iconTheme: { primary: '#34d399', secondary: '#fff' },
                style: { border: '1px solid rgba(52,211,153,0.2)' },
              },
              error: {
                iconTheme: { primary: '#f87171', secondary: '#fff' },
                style: { border: '1px solid rgba(248,113,113,0.2)' },
                duration: 5000,
              },
            }}
          />
          <Navbar />
          <main className="relative">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
