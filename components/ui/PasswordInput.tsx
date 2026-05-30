'use client'

import { forwardRef, useId, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PasswordInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  error?: string
  hint?: string
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  function PasswordInput({ label, error, hint, className, ...props }, ref) {
    const id = useId()
    const inputId = props.id ?? id
    const [visible, setVisible] = useState(false)

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-foreground"
          >
            {label}
          </label>
        )}

        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            type={visible ? 'text' : 'password'}
            aria-invalid={!!error}
            aria-describedby={
              error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
            }
            className={cn(
              'h-10 w-full rounded-xl pr-10 pl-3.5 text-sm',
              'bg-surface-2/60 text-foreground placeholder:text-muted',
              'border outline-none transition-colors duration-150',
              error
                ? 'border-red-500/60 focus:ring-1 focus:ring-red-500/40'
                : 'border-border focus:ring-1 focus:ring-primary/60 focus:border-primary/60',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              className,
            )}
            {...props}
          />
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? 'Hide password' : 'Show password'}
            className={cn(
              'absolute right-0 top-0 h-10 w-10',
              'flex items-center justify-center rounded-r-xl',
              'text-muted hover:text-foreground',
              'cursor-pointer transition-colors duration-150',
              'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/50',
            )}
          >
            {visible ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>

        {error && (
          <p id={`${inputId}-error`} className="text-xs text-red-400" role="alert">
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={`${inputId}-hint`} className="text-xs text-muted">
            {hint}
          </p>
        )}
      </div>
    )
  },
)
