'use client'

import { useState, useTransition } from 'react'
import { UserPlus, LogOut, Loader2 } from 'lucide-react'
import { InviteModal } from './InviteModal'
import { leaveFamily } from '@/server/actions/family'
import type { Family } from '@/types'

interface FamilyDashboardProps {
  family: Family
  isOwner: boolean
  familyId: string
}

export function FamilyDashboard({ family, isOwner, familyId }: FamilyDashboardProps) {
  const [inviteOpen, setInviteOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleLeave() {
    if (!confirm('Are you sure you want to leave this family?')) return
    setError(null)
    startTransition(async () => {
      const result = await leaveFamily(familyId)
      if (result && !result.success) {
        setError(result.error ?? 'Failed to leave family.')
      }
    })
  }

  return (
    <>
      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm text-red-400 mb-2">
          {error}
        </div>
      )}

      <div className="flex items-center gap-2 shrink-0">
        {isOwner && (
          <button
            onClick={() => setInviteOpen(true)}
            className="flex items-center gap-2 bg-[#a3ff3f] text-[#0f1115] font-semibold px-4 py-2.5 rounded-xl hover:bg-[#7acc2e] transition-colors text-sm"
          >
            <UserPlus size={16} />
            Invite Member
          </button>
        )}

        {!isOwner && (
          <button
            onClick={handleLeave}
            disabled={isPending}
            className="flex items-center gap-2 bg-[#1c2433] border border-white/8 text-[#8b95a5] hover:text-red-400 hover:border-red-500/30 font-medium px-4 py-2.5 rounded-xl transition-colors text-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isPending ? <Loader2 size={16} className="animate-spin" /> : <LogOut size={16} />}
            Leave Family
          </button>
        )}
      </div>

      <InviteModal
        inviteCode={family.inviteCode}
        familyName={family.familyName}
        open={inviteOpen}
        onOpenChange={setInviteOpen}
      />
    </>
  )
}
