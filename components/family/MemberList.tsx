'use client'

import { useState, useTransition } from 'react'
import { Loader2, UserMinus, LogOut } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { removeMember, leaveFamily } from '@/server/actions/family'
import { FamilyMember } from '@/types'
import { formatDate } from '@/lib/utils'

interface MemberListProps {
  members: FamilyMember[]
  currentUserId: string
  isOwner: boolean
  familyId: string
}

export function MemberList({ members, currentUserId, isOwner, familyId }: MemberListProps) {
  const [isPending, startTransition] = useTransition()
  const [pendingMemberId, setPendingMemberId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  function handleRemoveMember(memberId: string) {
    if (!confirm('Are you sure you want to remove this member?')) return
    setError(null)
    setPendingMemberId(memberId)
    startTransition(async () => {
      const result = await removeMember(memberId)
      if (!result.success) {
        setError(result.error ?? 'Failed to remove member.')
      }
      setPendingMemberId(null)
    })
  }

  function handleLeaveFamily() {
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
    <div className="flex flex-col gap-2">
      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {members.map((member) => {
        const isSelf = member.userId === currentUserId
        const isOwnerRow = member.role === 'OWNER'
        const isProcessing = isPending && pendingMemberId === member.id

        return (
          <div
            key={member.id}
            className="flex items-center gap-3 rounded-xl bg-[#1c2433] border border-white/8 px-4 py-3 transition-colors hover:border-white/12"
          >
            {/* Avatar */}
            <Avatar
              src={member.user?.avatar}
              name={member.user?.name ?? 'Unknown'}
              size="md"
            />

            {/* Name + join date */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[#f5f7fa] font-medium text-sm truncate">
                  {member.user?.name ?? 'Unknown Member'}
                </span>
                {isSelf && (
                  <span className="text-[#8b95a5] text-xs">(you)</span>
                )}
              </div>
              <span className="text-[#8b95a5] text-xs">
                Joined {formatDate(member.joinedAt)}
              </span>
            </div>

            {/* Role badge */}
            <span
              className={
                isOwnerRow
                  ? 'bg-[#a3ff3f]/15 text-[#a3ff3f] text-xs font-semibold px-2.5 py-1 rounded-full shrink-0'
                  : 'bg-white/8 text-[#8b95a5] text-xs font-semibold px-2.5 py-1 rounded-full shrink-0'
              }
            >
              {isOwnerRow ? 'OWNER' : 'MEMBER'}
            </span>

            {/* Actions */}
            {isOwner && !isSelf && (
              <button
                onClick={() => handleRemoveMember(member.id)}
                disabled={isPending}
                aria-label={`Remove ${member.user?.name ?? 'member'}`}
                className="ml-1 flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-[#8b95a5] hover:bg-red-500/10 hover:text-red-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              >
                {isProcessing ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <UserMinus size={13} />
                )}
                Remove
              </button>
            )}

            {!isOwner && isSelf && (
              <button
                onClick={handleLeaveFamily}
                disabled={isPending}
                aria-label="Leave family"
                className="ml-1 flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-[#8b95a5] hover:bg-red-500/10 hover:text-red-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              >
                {isPending ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <LogOut size={13} />
                )}
                Leave
              </button>
            )}
          </div>
        )
      })}

      {members.length === 0 && (
        <p className="text-center text-[#8b95a5] text-sm py-6">No members found.</p>
      )}
    </div>
  )
}
