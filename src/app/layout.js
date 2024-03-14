import './globals.css'
import SparklesIcon from "@/components/SparklesIcon";
import { Inter } from 'next/font/google'
import Link from "next/link";

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: "FramePhase",
  description: "Generated by create next app",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className + " bg-gradient-to-r from-bg-gradient-from via-bg-gradient-m to-bg-gradient-to min-h-screen text-white"}>
      <main className="p-4 max-w-4xl mx-auto">
        <header className="flex justify-between my-2 sm:my-8">
          <Link href="/" className="flex gap-1">
          <SparklesIcon />
            <span>FramePhase</span>
          </Link>
          <nav className="flex items-center gap-2 sm:gap-6 text-white/70 text-sm sm:text-bas">
            <Link href="/">Home</Link>
            <Link href="/pricing">Pricing</Link>
            <Link href="mailto:contact@framephase.com">Contact</Link>
          </nav>
        </header>
        {children}
      </main>
      </body>
    </html>
  );
}
