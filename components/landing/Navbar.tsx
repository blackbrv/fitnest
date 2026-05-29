'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Menu, X, Zap } from 'lucide-react'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'backdrop-blur-xl bg-[#0F1115]/80 border-b border-white/[0.06]'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-18">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative w-7 h-7 rounded-lg bg-[#A3FF3F] flex items-center justify-center shadow-[0_0_12px_rgba(163,255,63,0.5)] group-hover:shadow-[0_0_20px_rgba(163,255,63,0.7)] transition-all duration-300">
              <Zap className="w-4 h-4 text-[#0F1115]" fill="currentColor" strokeWidth={0} />
            </div>
            <span className="text-[#F5F7FA] font-bold text-lg tracking-tight">
              Fit<span className="text-[#A3FF3F]">Nest</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {[
              { label: 'Features', href: '#features' },
              { label: 'Dashboard', href: '#dashboard' },
              { label: 'Pricing', href: '#pricing' },
              { label: 'FAQ', href: '#faq' },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-[#8b95a5] hover:text-[#F5F7FA] transition-colors duration-200"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-[#8b95a5] hover:text-[#F5F7FA] transition-colors duration-200 px-4 py-2"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="text-sm font-semibold bg-[#A3FF3F] text-[#0F1115] px-5 py-2 rounded-full hover:bg-[#b8ff5e] transition-all duration-200 shadow-[0_0_16px_rgba(163,255,63,0.3)] hover:shadow-[0_0_24px_rgba(163,255,63,0.5)]"
            >
              Start Free
            </Link>
          </div>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden text-[#8b95a5] hover:text-[#F5F7FA] transition-colors p-1"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-white/[0.06] bg-[#0F1115]/95 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col gap-3">
            {[
              { label: 'Features', href: '#features' },
              { label: 'Dashboard', href: '#dashboard' },
              { label: 'Pricing', href: '#pricing' },
              { label: 'FAQ', href: '#faq' },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="text-[#8b95a5] hover:text-[#F5F7FA] transition-colors py-2 text-sm"
              >
                {item.label}
              </Link>
            ))}
            <div className="flex flex-col gap-2 pt-2 border-t border-white/[0.06]">
              <Link
                href="/login"
                className="text-sm text-[#8b95a5] hover:text-[#F5F7FA] transition-colors py-2"
                onClick={() => setMenuOpen(false)}
              >
                Login
              </Link>
              <Link
                href="/register"
                className="text-sm font-semibold bg-[#A3FF3F] text-[#0F1115] px-5 py-2.5 rounded-full text-center hover:bg-[#b8ff5e] transition-all duration-200"
                onClick={() => setMenuOpen(false)}
              >
                Start Free
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
