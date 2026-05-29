'use client'

import { createContext, useCallback, useContext, useRef, useState } from 'react'
import * as RadixToast from '@radix-ui/react-toast'
import { CheckCircle2, Info, TriangleAlert, X, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

type ToastVariant = 'default' | 'success' | 'warning' | 'error'

interface Toast {
  id: string
  title: string
  description?: string
  variant?: ToastVariant
  duration?: number
}

interface ToastContextValue {
  toast: (opts: Omit<Toast, 'id'>) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const variantConfig: Record<
  ToastVariant,
  { icon: typeof Info; iconClass: string; borderClass: string }
> = {
  default: {
    icon: Info,
    iconClass: 'text-[#8b95a5]',
    borderClass: 'border-white/8',
  },
  success: {
    icon: CheckCircle2,
    iconClass: 'text-emerald-400',
    borderClass: 'border-emerald-500/25',
  },
  warning: {
    icon: TriangleAlert,
    iconClass: 'text-amber-400',
    borderClass: 'border-amber-500/25',
  },
  error: {
    icon: XCircle,
    iconClass: 'text-red-400',
    borderClass: 'border-red-500/25',
  },
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const counterRef = useRef(0)

  const toast = useCallback((opts: Omit<Toast, 'id'>) => {
    const id = String(++counterRef.current)
    setToasts((prev) => [...prev, { ...opts, id }])
  }, [])

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      <RadixToast.Provider swipeDirection="right">
        {children}

        {toasts.map((t) => {
          const variant = t.variant ?? 'default'
          const { icon: Icon, iconClass, borderClass } = variantConfig[variant]

          return (
            <RadixToast.Root
              key={t.id}
              open
              duration={t.duration ?? 4000}
              onOpenChange={(open) => { if (!open) dismiss(t.id) }}
              className={cn(
                'group relative flex w-80 items-start gap-3 rounded-2xl border p-4',
                'bg-[#151922] shadow-xl shadow-black/40',
                'data-[state=open]:animate-in data-[state=closed]:animate-out',
                'data-[state=closed]:fade-out-80 data-[state=open]:fade-in-0',
                'data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)]',
                'data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)]',
                'data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-bottom-2',
                'transition-all duration-200',
                borderClass,
              )}
            >
              <Icon
                size={18}
                strokeWidth={2}
                className={cn('mt-0.5 shrink-0', iconClass)}
              />

              <div className="flex flex-1 flex-col gap-0.5">
                <RadixToast.Title className="text-sm font-semibold text-[#f5f7fa]">
                  {t.title}
                </RadixToast.Title>
                {t.description && (
                  <RadixToast.Description className="text-xs text-[#8b95a5]">
                    {t.description}
                  </RadixToast.Description>
                )}
              </div>

              <RadixToast.Close
                aria-label="Dismiss"
                className={cn(
                  'rounded-md p-0.5 text-[#8b95a5] transition-colors',
                  'hover:bg-white/8 hover:text-[#f5f7fa]',
                  'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#a3ff3f]/50',
                )}
              >
                <X size={14} />
              </RadixToast.Close>
            </RadixToast.Root>
          )
        })}

        <RadixToast.Viewport className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 outline-none" />
      </RadixToast.Provider>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return ctx
}
