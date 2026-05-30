'use client'

import { useState } from 'react'
import { Copy, Check, Users, Zap, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FamilyOverviewProps {
  familyName: string
  totalMembers: number
  completedToday: number
  totalToday: number
  weeklyConsistency: number
  inviteCode: string
}

export function FamilyOverview({
  familyName,
  totalMembers,
  completedToday,
  totalToday,
  weeklyConsistency,
  inviteCode,
}: FamilyOverviewProps) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(inviteCode).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const completionPct =
    totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0

  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h2 className="text-base font-semibold text-foreground">
            Family Overview
          </h2>
          <p className="text-sm text-muted mt-0.5">{familyName}</p>
        </div>
        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
          <Users size={18} className="text-primary" />
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {/* Active members */}
        <div className="rounded-xl bg-surface-2 p-3">
          <p className="text-xl font-bold text-foreground leading-none">
            {totalMembers}
          </p>
          <p className="text-[10px] text-muted mt-1 leading-tight">
            Active members
          </p>
        </div>

        {/* Daily completion */}
        <div className="rounded-xl bg-surface-2 p-3">
          <div className="flex items-baseline gap-0.5">
            <p className="text-xl font-bold text-primary leading-none">
              {completedToday}
            </p>
            <p className="text-sm text-muted">/{totalToday}</p>
          </div>
          <p className="text-[10px] text-muted mt-1 leading-tight">
            Done today
          </p>
        </div>

        {/* Weekly consistency */}
        <div className="rounded-xl bg-surface-2 p-3">
          <p className="text-xl font-bold text-foreground leading-none">
            {weeklyConsistency}
            <span className="text-sm text-muted">%</span>
          </p>
          <p className="text-[10px] text-muted mt-1 leading-tight">
            Weekly rate
          </p>
        </div>
      </div>

      {/* Daily completion progress */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-muted flex items-center gap-1.5">
            <Zap size={12} className="text-primary" />
            Today&apos;s completion
          </span>
          <span className="text-xs font-semibold text-primary">
            {completionPct}%
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-white/8 overflow-hidden">
          <div
            className="h-full rounded-full bg-[#a3ff3f] transition-[width] duration-700 ease-out"
            style={{ width: `${completionPct}%` }}
          />
        </div>
      </div>

      {/* Weekly consistency bar */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-muted flex items-center gap-1.5">
            <TrendingUp size={12} className="text-primary" />
            Weekly consistency
          </span>
          <span className="text-xs font-semibold text-foreground">
            {weeklyConsistency}%
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-white/8 overflow-hidden">
          <div
            className="h-full rounded-full bg-foreground/40 transition-[width] duration-700 ease-out"
            style={{ width: `${weeklyConsistency}%` }}
          />
        </div>
      </div>

      {/* Invite code */}
      <div className="border-t border-border pt-4">
        <p className="text-xs text-muted mb-2">Family invite code</p>
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 bg-surface-2 rounded-xl px-3 py-2">
            <span className="font-mono text-sm font-semibold text-primary tracking-widest flex-1">
              {inviteCode}
            </span>
          </div>
          <button
            onClick={handleCopy}
            aria-label={copied ? 'Copied!' : 'Copy invite code'}
            className={cn(
              'flex items-center justify-center w-9 h-9 rounded-xl',
              'transition-all duration-150',
              copied
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'bg-surface-2 text-muted hover:text-primary hover:bg-primary/10',
            )}
          >
            {copied ? <Check size={15} /> : <Copy size={15} />}
          </button>
        </div>
      </div>
    </div>
  )
}
