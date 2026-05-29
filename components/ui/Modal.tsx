'use client'

import { ReactNode } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  description?: string
  children?: ReactNode
  footer?: ReactNode
  className?: string
}

export function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  className,
}: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay
          className={cn(
            'fixed inset-0 z-50 bg-black/60 backdrop-blur-sm',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          )}
        />
        <Dialog.Content
          className={cn(
            'fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2',
            'rounded-2xl border border-white/8 bg-[#151922] shadow-2xl shadow-black/50',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
            'data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]',
            'data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]',
            'focus:outline-none',
            className,
          )}
        >
          {/* Header */}
          {(title || description) && (
            <div className="flex items-start justify-between gap-4 border-b border-white/8 p-5">
              <div className="flex flex-col gap-1">
                {title && (
                  <Dialog.Title className="text-base font-semibold text-[#f5f7fa]">
                    {title}
                  </Dialog.Title>
                )}
                {description && (
                  <Dialog.Description className="text-sm text-[#8b95a5]">
                    {description}
                  </Dialog.Description>
                )}
              </div>
              <Dialog.Close
                className={cn(
                  'rounded-lg p-1 text-[#8b95a5] transition-colors',
                  'hover:bg-white/8 hover:text-[#f5f7fa]',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a3ff3f]/50',
                )}
                aria-label="Close"
              >
                <X size={16} />
              </Dialog.Close>
            </div>
          )}

          {/* Body */}
          {children && <div className="p-5">{children}</div>}

          {/* Footer */}
          {footer && (
            <div className="flex items-center justify-end gap-3 border-t border-white/8 p-5">
              {footer}
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
