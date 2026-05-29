'use client'

import { forwardRef, InputHTMLAttributes, useId } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, id: externalId, ...props }, ref) => {
    const internalId = useId()
    const id = externalId ?? internalId
    const errorId = `${id}-error`
    const hintId = `${id}-hint`

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={id}
            className="text-sm font-medium text-[#f5f7fa]"
          >
            {label}
          </label>
        )}

        <input
          ref={ref}
          id={id}
          aria-invalid={!!error}
          aria-describedby={
            [error ? errorId : null, hint ? hintId : null]
              .filter(Boolean)
              .join(' ') || undefined
          }
          className={cn(
            'h-10 w-full rounded-xl bg-[#1c2433] px-3.5 text-sm text-[#f5f7fa]',
            'border border-white/8 outline-none placeholder:text-[#8b95a5]',
            'transition-colors duration-150',
            'focus:border-[#a3ff3f]/60 focus:ring-2 focus:ring-[#a3ff3f]/20',
            'disabled:cursor-not-allowed disabled:opacity-40',
            error && 'border-red-500/60 focus:border-red-500 focus:ring-red-500/20',
            className,
          )}
          {...props}
        />

        {hint && !error && (
          <p id={hintId} className="text-xs text-[#8b95a5]">
            {hint}
          </p>
        )}
        {error && (
          <p id={errorId} role="alert" className="text-xs text-red-400">
            {error}
          </p>
        )}
      </div>
    )
  },
)

Input.displayName = 'Input'
