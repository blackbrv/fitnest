'use client'

import Link from 'next/link'
import { useEffect, useRef, useState, useTransition } from 'react'
import {
  Menu, X, Zap, LayoutDashboard, Settings, Bell, LogOut, ChevronDown,
} from 'lucide-react'
import { getInitials, cn } from '@/lib/utils'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { logoutUser } from '@/server/actions/auth'

interface NavbarProps {
  session?: { name: string; email: string; avatar?: string | null } | null
}

const PROFILE_LINKS = [
  { label: 'Dashboard',     href: '/dashboard',      icon: LayoutDashboard },
  { label: 'Settings',      href: '/settings',        icon: Settings },
  { label: 'Notifications', href: '/notifications',   icon: Bell },
] as const

export default function Navbar({ session }: NavbarProps) {
  const [scrolled, setScrolled]       = useState(false)
  const [menuOpen, setMenuOpen]       = useState(false)
  const [dropdownOpen, setDropdown]   = useState(false)
  const [avatarError, setAvatarError] = useState(false)
  const [isPending, startTransition]  = useTransition()
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    if (!dropdownOpen) return
    function handle(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdown(false)
      }
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [dropdownOpen])

  function handleLogout() {
    startTransition(async () => {
      await logoutUser()
    })
  }

  const Avatar = ({ size = 'sm' }: { size?: 'sm' | 'md' }) => {
    const cls = size === 'sm' ? 'h-8 w-8 text-xs' : 'h-10 w-10 text-sm'
    return (
      <span className={cn(
        'inline-flex shrink-0 rounded-full overflow-hidden',
        'bg-surface-2 font-bold text-primary ring-1 ring-primary/20',
        cls,
      )}>
        {session?.avatar && !avatarError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={session.avatar}
            alt={session.name}
            className="w-full h-full object-cover"
            onError={() => setAvatarError(true)}
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center">
            {getInitials(session?.name ?? '')}
          </span>
        )}
      </span>
    )
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 w-full overflow-visible transition-all duration-300 ${
        scrolled
          ? 'backdrop-blur-xl bg-background/80 border-b border-border'
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
            <span className="text-foreground font-bold text-lg tracking-tight">
              Fit<span className="text-primary">Nest</span>
            </span>
          </Link>

          {/* Desktop Nav links */}
          <nav className="hidden md:flex items-center gap-8">
            {[
              { label: 'Features',  href: '/#features' },
              { label: 'Dashboard', href: '/#dashboard' },
              { label: 'Pricing',   href: '/#pricing' },
              { label: 'FAQ',       href: '/#faq' },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-muted hover:text-foreground transition-colors duration-200"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Desktop right side */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />

            {session ? (
              /* ── Profile dropdown ─────────────────────────────── */
              <div ref={dropdownRef} className="relative">
                <button
                  type="button"
                  onClick={() => setDropdown((v) => !v)}
                  aria-expanded={dropdownOpen}
                  aria-label="Profile menu"
                  className={cn(
                    'flex items-center gap-2 rounded-full pl-1 pr-2.5 py-1',
                    'border transition-all duration-150',
                    dropdownOpen
                      ? 'border-primary/40 bg-surface-2'
                      : 'border-border bg-surface-2/60 hover:border-border hover:bg-surface-2',
                  )}
                >
                  <Avatar size="sm" />
                  <span className="text-sm font-medium text-foreground max-w-[90px] truncate">
                    {session.name.split(' ')[0]}
                  </span>
                  <ChevronDown
                    size={13}
                    className={cn(
                      'text-muted transition-transform duration-150',
                      dropdownOpen && 'rotate-180',
                    )}
                  />
                </button>

                {/* Dropdown panel */}
                {dropdownOpen && (
                  <div className={cn(
                    'absolute right-0 top-full mt-2 w-56',
                    'rounded-2xl border border-border bg-surface shadow-xl shadow-black/20',
                    'overflow-hidden z-50',
                  )}>
                    {/* User info */}
                    <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border">
                      <Avatar size="md" />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{session.name}</p>
                        <p className="text-xs text-muted truncate">{session.email}</p>
                      </div>
                    </div>

                    {/* Links */}
                    <div className="py-1.5 px-1.5 space-y-0.5">
                      {PROFILE_LINKS.map(({ label, href, icon: Icon }) => (
                        <Link
                          key={href}
                          href={href}
                          onClick={() => setDropdown(false)}
                          className={cn(
                            'flex items-center gap-3 px-3 py-2.5 rounded-xl',
                            'text-sm font-medium text-foreground',
                            'hover:bg-surface-2 transition-colors duration-100',
                          )}
                        >
                          <Icon size={15} className="text-muted shrink-0" />
                          {label}
                        </Link>
                      ))}
                    </div>

                    {/* Sign out */}
                    <div className="px-1.5 pb-1.5 border-t border-border pt-1.5">
                      <button
                        type="button"
                        onClick={() => { setDropdown(false); handleLogout() }}
                        disabled={isPending}
                        className={cn(
                          'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl',
                          'text-sm font-medium text-muted',
                          'hover:text-red-400 hover:bg-red-500/10',
                          'transition-colors duration-100 cursor-pointer',
                          'disabled:opacity-50 disabled:cursor-not-allowed',
                        )}
                      >
                        <LogOut size={15} className="shrink-0" />
                        {isPending ? 'Signing out…' : 'Sign out'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* ── Guest CTA ───────────────────────────────────── */
              <>
                <Link
                  href="/login"
                  className="text-sm text-muted hover:text-foreground transition-colors duration-200 px-4 py-2"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="text-sm font-semibold bg-[#A3FF3F] text-[#0F1115] px-5 py-2 rounded-full hover:bg-[#b8ff5e] transition-all duration-200 shadow-[0_0_16px_rgba(163,255,63,0.3)] hover:shadow-[0_0_24px_rgba(163,255,63,0.5)]"
                >
                  Start Free
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden text-muted hover:text-foreground transition-colors p-1"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* ── Mobile menu ──────────────────────────────────────────── */}
      {menuOpen && (
        <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col gap-3">
            {[
              { label: 'Features',  href: '/#features' },
              { label: 'Dashboard', href: '/#dashboard' },
              { label: 'Pricing',   href: '/#pricing' },
              { label: 'FAQ',       href: '/#faq' },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="text-muted hover:text-foreground transition-colors py-2 text-sm"
              >
                {item.label}
              </Link>
            ))}

            <div className="flex flex-col gap-1 pt-2 border-t border-border">
              <div className="flex items-center justify-between py-1 mb-1">
                <span className="text-sm text-muted">Theme</span>
                <ThemeToggle />
              </div>

              {session ? (
                <>
                  {/* User row */}
                  <div className="flex items-center gap-3 px-2 py-2 rounded-xl bg-surface-2/40">
                    <Avatar size="md" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{session.name}</p>
                      <p className="text-xs text-muted truncate">{session.email}</p>
                    </div>
                  </div>

                  {/* Menu links */}
                  {PROFILE_LINKS.map(({ label, href, icon: Icon }) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setMenuOpen(false)}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-xl',
                        'text-sm font-medium text-foreground',
                        'hover:bg-surface-2 transition-colors duration-100',
                      )}
                    >
                      <Icon size={16} className="text-muted shrink-0" />
                      {label}
                    </Link>
                  ))}

                  {/* Sign out */}
                  <button
                    type="button"
                    onClick={() => { setMenuOpen(false); handleLogout() }}
                    disabled={isPending}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl',
                      'text-sm font-medium text-muted',
                      'hover:text-red-400 hover:bg-red-500/10',
                      'transition-colors duration-100 cursor-pointer',
                      'disabled:opacity-50 disabled:cursor-not-allowed',
                    )}
                  >
                    <LogOut size={16} className="shrink-0" />
                    {isPending ? 'Signing out…' : 'Sign out'}
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-sm text-muted hover:text-foreground transition-colors py-2 px-2"
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
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
