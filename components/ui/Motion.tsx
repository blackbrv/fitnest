'use client'

import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { staggerContainer, staggerItem, scaleIn, fadeUp } from '@/lib/animations'

// Fade + slide up on mount
export function FadeUp({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      initial={reduce ? false : 'hidden'}
      animate="visible"
      custom={delay}
      variants={fadeUp}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Fade + slide up when scrolled into view
export function FadeInView({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      initial={reduce ? false : 'hidden'}
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      custom={delay}
      variants={fadeUp}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Scale + fade in on mount (for cards, modals, auth forms)
export function ScaleIn({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      initial={reduce ? false : 'hidden'}
      animate="visible"
      variants={scaleIn}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Stagger wrapper - staggers direct children
export function StaggerContainer({
  children,
  className,
  inView = false,
}: {
  children: React.ReactNode
  className?: string
  inView?: boolean
}) {
  const reduce = useReducedMotion()

  if (inView) {
    return (
      <motion.div
        variants={reduce ? undefined : staggerContainer}
        initial={reduce ? false : 'hidden'}
        whileInView="visible"
        viewport={{ once: true, margin: '-40px' }}
        className={className}
      >
        {children}
      </motion.div>
    )
  }
  return (
    <motion.div
      variants={reduce ? undefined : staggerContainer}
      initial={reduce ? false : 'hidden'}
      animate="visible"
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Item inside StaggerContainer
export function StaggerItem({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  const reduce = useReducedMotion()
  return (
    <motion.div variants={reduce ? undefined : staggerItem} className={className}>
      {children}
    </motion.div>
  )
}

// Page transition (keyed on pathname)
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const reduce = useReducedMotion()

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        className="min-h-full flex flex-col"
        initial={reduce ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={reduce ? undefined : { opacity: 0, y: -6 }}
        transition={{ duration: 0.22, ease: [0.21, 0.47, 0.32, 0.98] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
