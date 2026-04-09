'use client';

import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useEffect, useCallback, useRef } from "react";
import { Menu, X, ChevronDown, LogOut, LayoutDashboard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "./Logo";

export default function Navbar() {
  const { data: session, status } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  const handleScroll = useCallback(() => setScrolled(window.scrollY > 20), []);

  // Close profile dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    if (profileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [profileOpen]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${scrolled ? 'bg-surface-100/80 backdrop-blur-xl border-white/[0.06] shadow-lg shadow-black/20' : 'bg-transparent border-transparent'}`}>
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-18">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="group-hover:scale-105 transition-transform">
              <Logo />
            </div>
            <span className="text-lg font-bold tracking-tight">FramePhase</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            <NavLink href="/">Home</NavLink>
            <NavLink href="/pricing">Pricing</NavLink>
            <NavLink href="/compare">Compare</NavLink>
            <NavLink href="/#features">Features</NavLink>
            <NavLink href="/#faq">FAQ</NavLink>
          </div>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-3">
            {status === "loading" ? (
              <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse" />
            ) : session ? (
              <div className="relative" ref={profileRef}>
                <button onClick={() => setProfileOpen(!profileOpen)} aria-expanded={profileOpen} aria-haspopup="menu" className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-white/5 transition-colors">
                  {session.user.image ? (
                    <img src={session.user.image} alt="" className="w-8 h-8 rounded-full ring-2 ring-brand-500/30" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-sm font-bold">
                      {session.user.name?.[0] || 'U'}
                    </div>
                  )}
                  <ChevronDown className="w-4 h-4 text-white/50" />
                </button>
                <AnimatePresence>
                  {profileOpen && (
                    <motion.div initial={{ opacity: 0, y: 8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.95 }} className="absolute right-0 mt-2 w-56 glass-strong rounded-xl overflow-hidden shadow-xl">
                      <div className="px-4 py-3 border-b border-white/5">
                        <p className="text-sm font-medium truncate">{session.user.name}</p>
                        <p className="text-xs text-white/40 truncate">{session.user.email}</p>
                      </div>
                      <div className="py-1">
                        <Link href="/dashboard" className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors">
                          <LayoutDashboard className="w-4 h-4" /> Dashboard
                        </Link>
                        <button onClick={() => signOut()} className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-white/5 transition-colors">
                          <LogOut className="w-4 h-4" /> Sign out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <button onClick={() => signIn("google")} className="text-sm text-white/60 hover:text-white px-4 py-2 transition-colors">Sign in</button>
                <button onClick={() => signIn("google")} className="btn-primary text-sm px-4 py-2">Get Started</button>
              </>
            )}
          </div>

          {/* Mobile */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-white/5 transition-colors"
            aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="md:hidden glass-strong border-t border-white/5">
            <div className="px-4 py-4 space-y-1">
              <MobileNavLink href="/" onClick={() => setMobileOpen(false)}>Home</MobileNavLink>
              <MobileNavLink href="/pricing" onClick={() => setMobileOpen(false)}>Pricing</MobileNavLink>
              <MobileNavLink href="/compare" onClick={() => setMobileOpen(false)}>Compare</MobileNavLink>
              <MobileNavLink href="/#features" onClick={() => setMobileOpen(false)}>Features</MobileNavLink>
              <MobileNavLink href="/#faq" onClick={() => setMobileOpen(false)}>FAQ</MobileNavLink>
              <div className="pt-4 border-t border-white/5">
                {session ? (
                  <>
                    <Link href="/dashboard" className="block btn-primary text-center text-sm mb-2" onClick={() => setMobileOpen(false)}>Dashboard</Link>
                    <button onClick={() => signOut()} className="block w-full btn-secondary text-sm">Sign out</button>
                  </>
                ) : (
                  <button onClick={() => signIn("google")} className="block w-full btn-primary text-center text-sm">Get Started</button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function NavLink({ href, children }) {
  return <Link href={href} className="px-4 py-2 text-sm text-white/60 hover:text-white rounded-lg hover:bg-white/5 transition-all">{children}</Link>;
}

function MobileNavLink({ href, children, onClick }) {
  return <Link href={href} onClick={onClick} className="block px-4 py-3 text-sm text-white/70 hover:text-white rounded-lg hover:bg-white/5 transition-all">{children}</Link>;
}
