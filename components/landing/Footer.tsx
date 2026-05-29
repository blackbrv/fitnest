import Link from 'next/link'
import { Zap, Globe, Play, Rss, Code2 } from 'lucide-react'

const footerLinks = {
  Product: [
    { label: 'Features', href: '#features' },
    { label: 'Dashboard', href: '#dashboard' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Changelog', href: '/changelog' },
    { label: 'Roadmap', href: '/roadmap' },
  ],
  Company: [
    { label: 'About', href: '/about' },
    { label: 'Blog', href: '/blog' },
    { label: 'Careers', href: '/careers' },
    { label: 'Press', href: '/press' },
    { label: 'Contact', href: '/contact' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Cookie Policy', href: '/cookies' },
    { label: 'GDPR', href: '/gdpr' },
  ],
}

const socialLinks = [
  { icon: Globe, href: 'https://twitter.com/fitnest', label: 'Twitter / X' },
  { icon: Play, href: 'https://youtube.com/fitnest', label: 'YouTube' },
  { icon: Rss, href: 'https://blog.fitnest.app', label: 'Blog RSS' },
  { icon: Code2, href: 'https://github.com/fitnest', label: 'GitHub' },
]

export default function Footer() {
  return (
    <footer className="bg-[#151922] border-t border-white/[0.07]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Main footer content */}
        <div className="py-14 grid grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand column */}
          <div className="col-span-2 lg:col-span-2">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 mb-4 w-fit group">
              <div className="w-7 h-7 rounded-lg bg-[#A3FF3F] flex items-center justify-center shadow-[0_0_10px_rgba(163,255,63,0.4)] group-hover:shadow-[0_0_18px_rgba(163,255,63,0.6)] transition-all">
                <Zap className="w-4 h-4 text-[#0F1115]" fill="currentColor" strokeWidth={0} />
              </div>
              <span className="text-[#F5F7FA] font-bold text-lg tracking-tight">
                Fit<span className="text-[#A3FF3F]">Nest</span>
              </span>
            </Link>

            <p className="text-[#8b95a5] text-sm leading-relaxed max-w-xs mb-6">
              FitNest helps families stay active through shared workout planning,
              progress tracking, and genuine accountability.
            </p>

            {/* Social links */}
            <div className="flex items-center gap-3">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-8 h-8 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-[#8b95a5] hover:text-[#A3FF3F] hover:border-[#A3FF3F]/25 hover:bg-[#A3FF3F]/[0.08] transition-all duration-200"
                >
                  <Icon className="w-3.5 h-3.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Nav columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <p className="text-xs font-bold tracking-[0.15em] uppercase text-[#F5F7FA] mb-4">
                {category}
              </p>
              <ul className="flex flex-col gap-2.5">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-sm text-[#8b95a5] hover:text-[#F5F7FA] transition-colors duration-200"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="py-5 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-[#8b95a5]">
            &copy; {new Date().getFullYear()} FitNest Technologies, Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#A3FF3F] shadow-[0_0_6px_rgba(163,255,63,0.6)]" />
            <span className="text-xs text-[#8b95a5]">All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
