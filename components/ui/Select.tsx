'use client'

import { useId } from 'react'
import * as RadixSelect from '@radix-ui/react-select'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SelectOption {
  value: string
  label: string
}

interface SelectProps {
  options: SelectOption[]
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  label?: string
  error?: string
  disabled?: boolean
  className?: string
}

export function Select({
  options,
  value,
  onValueChange,
  placeholder = 'Select an option',
  label,
  error,
  disabled,
  className,
}: SelectProps) {
  const id = useId()
  const errorId = `${id}-error`

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <label className="text-sm font-medium text-foreground" id={id}>
          {label}
        </label>
      )}

      <RadixSelect.Root value={value} onValueChange={onValueChange} disabled={disabled}>
        <RadixSelect.Trigger
          aria-labelledby={label ? id : undefined}
          aria-describedby={error ? errorId : undefined}
          aria-invalid={!!error}
          className={cn(
            'flex h-10 w-full items-center justify-between rounded-xl bg-surface-2 px-3.5',
            'border border-border text-sm text-foreground outline-none',
            'transition-colors duration-150',
            'focus:border-[#a3ff3f]/60 focus:ring-2 focus:ring-[#a3ff3f]/20',
            'data-[placeholder]:text-muted',
            'disabled:cursor-not-allowed disabled:opacity-40',
            error && 'border-red-500/60 focus:border-red-500 focus:ring-red-500/20',
          )}
        >
          <RadixSelect.Value placeholder={placeholder} />
          <RadixSelect.Icon asChild>
            <ChevronDown size={16} className="text-muted shrink-0" />
          </RadixSelect.Icon>
        </RadixSelect.Trigger>

        <RadixSelect.Portal>
          <RadixSelect.Content
            position="popper"
            sideOffset={6}
            className={cn(
              'z-50 w-[var(--radix-select-trigger-width)] overflow-hidden',
              'rounded-xl border border-border bg-surface shadow-xl shadow-black/40',
              'data-[state=open]:animate-in data-[state=closed]:animate-out',
              'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
              'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
            )}
          >
            <RadixSelect.Viewport className="p-1">
              {options.map((opt) => (
                <RadixSelect.Item
                  key={opt.value}
                  value={opt.value}
                  className={cn(
                    'relative flex cursor-pointer select-none items-center rounded-lg px-3 py-2 pr-8',
                    'text-sm text-foreground outline-none transition-colors',
                    'data-[highlighted]:bg-white/8 data-[highlighted]:text-foreground',
                    'data-[state=checked]:text-primary',
                  )}
                >
                  <RadixSelect.ItemText>{opt.label}</RadixSelect.ItemText>
                  <RadixSelect.ItemIndicator className="absolute right-2.5 flex items-center">
                    <Check size={13} className="text-primary" />
                  </RadixSelect.ItemIndicator>
                </RadixSelect.Item>
              ))}
            </RadixSelect.Viewport>
          </RadixSelect.Content>
        </RadixSelect.Portal>
      </RadixSelect.Root>

      {error && (
        <p id={errorId} role="alert" className="text-xs text-red-400">
          {error}
        </p>
      )}
    </div>
  )
}
