'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'

type NavState = 'idle' | 'loading' | 'completing'

export function NavigationProgress() {
  const pathname = usePathname()
  const reduce = useReducedMotion()
  const [mounted, setMounted] = useState(false)
  const [navState, setNavState] = useState<NavState>('idle')

  const prevPathRef = useRef(pathname)
  const startTimeRef = useRef<number>(0)
  const completionTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const MIN_DURATION = 400 // ms — prevents flash on very fast navigations

  useEffect(() => { setMounted(true) }, [])

  // Complete the navigation: fill bar to 100% then fade out
  const completeNavigation = useCallback(() => {
    if (completionTimerRef.current) clearTimeout(completionTimerRef.current)

    const elapsed = Date.now() - startTimeRef.current
    const remaining = Math.max(0, MIN_DURATION - elapsed)

    completionTimerRef.current = setTimeout(() => {
      setNavState('completing')
      completionTimerRef.current = setTimeout(() => {
        setNavState('idle')
      }, 400) // fade-out duration
    }, remaining)
  }, [])

  // Detect navigation completion via pathname change
  useEffect(() => {
    if (pathname !== prevPathRef.current) {
      prevPathRef.current = pathname
      if (navState === 'loading') {
        completeNavigation()
      }
    }
  }, [pathname, navState, completeNavigation])

  // Detect navigation start via click interception
  useEffect(() => {
    if (!mounted) return

    function handleClick(e: MouseEvent) {
      const anchor = (e.target as Element).closest('a')
      if (!anchor) return

      const href = anchor.getAttribute('href')
      if (!href) return

      // Skip non-navigational links
      if (
        href.startsWith('#') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        href.startsWith('javascript:')
      ) return

      // Skip new-tab links
      const target = anchor.getAttribute('target')
      if (target && target !== '_self') return

      // Skip external links + same-page navigation
      try {
        const url = new URL(href, window.location.origin)
        if (url.origin !== window.location.origin) return
        if (url.pathname === window.location.pathname && !url.search) return
      } catch {
        return
      }

      // Start progress
      if (completionTimerRef.current) clearTimeout(completionTimerRef.current)
      startTimeRef.current = Date.now()
      setNavState('loading')
    }

    document.addEventListener('click', handleClick)
    return () => {
      document.removeEventListener('click', handleClick)
      if (completionTimerRef.current) clearTimeout(completionTimerRef.current)
    }
  }, [mounted])

  if (!mounted || reduce || navState === 'idle') return null

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none"
      aria-hidden="true"
    >
      <AnimatePresence>
        <motion.div
          key="bar"
          className="h-[2px] w-full overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: navState === 'completing' ? 0 : 1 }}
          transition={{ duration: 0.3 }}
        >
          {/* Indeterminate shimmer animation */}
          <motion.div
            className="h-full rounded-full"
            style={{
              background: 'var(--color-primary)',
              boxShadow: '0 0 10px var(--color-primary), 0 0 4px var(--color-primary)',
            }}
            animate={
              navState === 'loading'
                ? {
                    x: ['-100%', '100%'],
                    scaleX: [0.3, 1, 0.3],
                  }
                : { x: '0%', scaleX: 1 }
            }
            transition={
              navState === 'loading'
                ? {
                    x: { duration: 1.2, repeat: Infinity, ease: 'easeInOut' },
                    scaleX: { duration: 1.2, repeat: Infinity, ease: 'easeInOut' },
                  }
                : { duration: 0.2 }
            }
          />
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
