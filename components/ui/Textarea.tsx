'use client'

import { forwardRef, TextareaHTMLAttributes, useId } from 'react'
import { cn } from '@/lib/utils'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  rows?: number
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, rows = 4, className, id: externalId, ...props }, ref) => {
    const internalId = useId()
    const id = externalId ?? internalId
    const errorId = `${id}-error`

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={id} className="text-sm font-medium text-[#f5f7fa]">
            {label}
          </label>
        )}

        <textarea
          ref={ref}
          id={id}
          rows={rows}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          className={cn(
            'w-full resize-y rounded-xl bg-[#1c2433] px-3.5 py-2.5',
            'border border-white/8 text-sm text-[#f5f7fa] outline-none',
            'placeholder:text-[#8b95a5] transition-colors duration-150',
            'focus:border-[#a3ff3f]/60 focus:ring-2 focus:ring-[#a3ff3f]/20',
            'disabled:cursor-not-allowed disabled:opacity-40',
            error && 'border-red-500/60 focus:border-red-500 focus:ring-red-500/20',
            className,
          )}
          {...props}
        />

        {error && (
          <p id={errorId} role="alert" className="text-xs text-red-400">
            {error}
          </p>
        )}
      </div>
    )
  },
)

Textarea.displayName = 'Textarea'
