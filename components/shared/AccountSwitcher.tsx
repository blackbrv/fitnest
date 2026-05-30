'use client'

import { useState, useTransition, useRef, useEffect } from 'react'
import Link from 'next/link'
import { ChevronUp, UserPlus, X, Check, Loader2 } from 'lucide-react'
import { cn, getInitials } from '@/lib/utils'
import { switchAccount, removeAccount } from '@/server/actions/accounts'

export interface AccountSwitcherItem {
  userId: string
  name: string
  email: string
  isActive: boolean
}

interface AccountSwitcherProps {
  accounts: AccountSwitcherItem[]
  avatar?: string | null
}

export function AccountSwitcher({ accounts, avatar }: AccountSwitcherProps) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [actionUserId, setActionUserId] = useState<string | null>(null)
  const [expiredUserId, setExpiredUserId] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const active = accounts.find((a) => a.isActive)
  const others = accounts.filter((a) => !a.isActive)

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  function handleSwitch(userId: string) {
    setActionUserId(userId)
    setExpiredUserId(null)
    startTransition(async () => {
      const result = await switchAccount(userId)
      if (!result.success && result.error === 'SESSION_EXPIRED') {
        setExpiredUserId(userId)
      }
      setActionUserId(null)
    })
  }

  function handleRemove(userId: string) {
    setActionUserId(userId)
    startTransition(async () => {
      await removeAccount(userId)
      setActionUserId(null)
      setOpen(false)
    })
  }

  if (!active) return null

  return (
    <div ref={containerRef} className="relative">
      {/* Dropdown panel — opens upward */}
      {open && (
        <div
          className={cn(
            'absolute bottom-full left-0 right-0 mb-1',
            'rounded-2xl border border-border bg-surface shadow-xl',
            'overflow-hidden z-50',
          )}
        >
          {/* Account list */}
          <div className="py-1.5">
            {/* Active account row */}
            <div className="flex items-center gap-2.5 px-3 py-2 mx-1 rounded-xl bg-primary/8">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-surface-2 flex items-center justify-center text-[10px] font-bold text-primary ring-1 ring-primary/25 overflow-hidden">
                {avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatar} alt={active.name} className="w-full h-full object-cover" />
                ) : (
                  getInitials(active.name)
                )}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground truncate">{active.name}</p>
                <p className="text-[10px] text-muted truncate">{active.email}</p>
              </div>
              <Check size={13} className="flex-shrink-0 text-primary" />
            </div>

            {/* Other accounts */}
            {others.map((account) => {
              const isWorking = actionUserId === account.userId && isPending
              const isExpired = expiredUserId === account.userId
              return (
                <div key={account.userId} className="flex items-center gap-2.5 px-3 py-2 mx-1 rounded-xl hover:bg-surface-2 group">
                  <button
                    type="button"
                    onClick={() => handleSwitch(account.userId)}
                    disabled={isPending}
                    className="flex items-center gap-2.5 flex-1 min-w-0 disabled:opacity-60"
                  >
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-surface-2 flex items-center justify-center text-[10px] font-bold text-muted ring-1 ring-border">
                      {getInitials(account.name)}
                    </span>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-xs font-medium text-foreground truncate">{account.name}</p>
                      {isExpired ? (
                        <p className="text-[10px] text-amber-400">Session expired — sign in again</p>
                      ) : (
                        <p className="text-[10px] text-muted truncate">{account.email}</p>
                      )}
                    </div>
                    {isWorking && <Loader2 size={12} className="flex-shrink-0 text-muted animate-spin" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemove(account.userId)}
                    disabled={isPending}
                    aria-label={`Remove ${account.name}`}
                    className="flex-shrink-0 opacity-0 group-hover:opacity-100 flex items-center justify-center w-5 h-5 rounded-md text-muted hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
                  >
                    <X size={11} />
                  </button>
                </div>
              )
            })}
          </div>

          {/* Divider + add account */}
          <div className="border-t border-border px-1 py-1.5">
            <Link
              href="/add-account"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-muted hover:text-foreground hover:bg-surface-2 transition-colors"
            >
              <span className="flex-shrink-0 w-8 h-8 rounded-full border border-dashed border-border flex items-center justify-center">
                <UserPlus size={13} />
              </span>
              <span className="text-xs font-medium">Add another account</span>
            </Link>
          </div>
        </div>
      )}

      {/* Trigger row — shows active account + chevron */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'w-full flex items-center gap-3 px-2 py-2 rounded-xl',
          'text-left transition-colors duration-150',
          open ? 'bg-surface-2' : 'hover:bg-surface-2/60',
        )}
        aria-expanded={open}
        aria-label="Switch account"
      >
        {/* Avatar */}
        {avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatar}
            alt={active.name}
            className="flex-shrink-0 w-9 h-9 rounded-full object-cover ring-1 ring-border"
          />
        ) : (
          <span
            className={cn(
              'flex-shrink-0 w-9 h-9 rounded-full',
              'flex items-center justify-center',
              'bg-surface-2 text-primary text-sm font-semibold',
              'ring-1 ring-border',
            )}
          >
            {getInitials(active.name)}
          </span>
        )}

        {/* Name + email */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">{active.name}</p>
          <p className="text-xs text-muted truncate">{active.email}</p>
        </div>

        {/* Chevron + count badge */}
        <div className="flex-shrink-0 flex items-center gap-1.5">
          {accounts.length > 1 && (
            <span className="flex items-center justify-center w-4 h-4 rounded-full bg-primary/15 text-primary text-[9px] font-bold">
              {accounts.length}
            </span>
          )}
          <ChevronUp
            size={14}
            className={cn(
              'text-muted transition-transform duration-150',
              open ? 'rotate-0' : 'rotate-180',
            )}
          />
        </div>
      </button>
    </div>
  )
}
